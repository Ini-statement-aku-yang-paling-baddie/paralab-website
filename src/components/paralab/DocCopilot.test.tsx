// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DocCopilot } from "./DocCopilot";
import type { Batch, Project } from "@/lib/paralab/data";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const PROYEK = {
  id: "serum-pencerah",
  judul: "Serum Pencerah",
  peneliti: "Dina Aprilia",
  targets: [],
} as unknown as Project;

const BATCH = {
  nomor: 2,
  bahan: [],
  hasil: [],
  prosedur: [],
} as unknown as Batch;

const SUKSES = {
  query: "kenapa viskositas turun",
  evidence_status: "sufficient",
  evidence: [
    {
      source_id: "J-2024-072-T03",
      outcome: "failed",
      failure_mode: "viscosity_collapse",
    },
  ],
  answer: {
    summary: "Gel-cream dengan elektrolit sering turun viskositasnya.",
    limitations: "Evidence ini berasal dari data sintetis dan memerlukan validasi R&D manusia.",
  },
  limitations: ["Tidak mencakup semua kombinasi bahan."],
};

const EVIDENCE_TIDAK_CUKUP = {
  query: "resep sunscreen",
  evidence_status: "insufficient",
  evidence: [{ source_id: "J-2024-101-T01", journal_title: "Catatan uji terdahulu" }],
  answer: null,
  limitations: ["Evidence tidak cukup untuk menerbitkan ringkasan."],
};

function tanya(pertanyaan: string) {
  render(<DocCopilot proyek={PROYEK} batch={BATCH} onTutup={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText(/tanya tentang jurnal ini/i), {
    target: { value: pertanyaan },
  });
  fireEvent.click(screen.getByLabelText("Kirim"));
}

describe("DocCopilot", () => {
  it("memanggil F1 dan menampilkan ringkasan, sumber, serta semua limitations", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(SUKSES), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    tanya("kenapa viskositas turun");

    expect(await screen.findByText(SUKSES.answer.summary)).toBeTruthy();
    expect(screen.getByText("J-2024-072-T03")).toBeTruthy();
    expect(screen.getByText(SUKSES.answer.limitations)).toBeTruthy();
    expect(screen.getByText(SUKSES.limitations[0]!)).toBeTruthy();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/v1/f1/query");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      query: "kenapa viskositas turun",
    });
  });

  it("menampilkan evidence dan status normal saat server tidak menerbitkan jawaban", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(EVIDENCE_TIDAK_CUKUP), { status: 200 })),
    );
    tanya("resep sunscreen");

    expect(await screen.findByText(/ringkasan tidak diterbitkan/i)).toBeTruthy();
    expect(screen.getByText("J-2024-101-T01")).toBeTruthy();
    expect(screen.getByText(EVIDENCE_TIDAK_CUKUP.limitations[0]!)).toBeTruthy();
  });

  it("menampilkan abstain F1 beserta alasan server tanpa menjalankan jawaban lokal untuk respons non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Indeks evidence sedang diperbarui." }), {
          status: 503,
        }),
      ),
    );
    tanya("berapa perkiraan hpp");

    expect(await screen.findByText(/f1 tidak menerbitkan jawaban/i)).toBeTruthy();
    expect(screen.getByText(/alasan server: indeks evidence sedang diperbarui\./i)).toBeTruthy();
    expect(screen.queryByText(/jawaban lokal/i)).toBeNull();
    expect(screen.queryByText(/perkiraan harga pokok batch/i)).toBeNull();
  });

  it("menandai jawaban heuristik saat gateway tidak tersedia tanpa menyebutnya prediksi model", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    tanya("prediksi stabilitas");

    expect(await screen.findByText("Estimasi kasar")).toBeTruthy();
    expect(screen.getByText(/gateway model tidak tersedia/i)).toBeTruthy();
    expect(screen.queryByText(/prediksi model/i)).toBeNull();
  });
});
