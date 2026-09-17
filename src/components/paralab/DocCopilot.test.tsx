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

function mockFetch(payload: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status })),
  );
}

const SUKSES = {
  query: "kenapa viskositas turun",
  evidence_status: "sufficient",
  evidence: [
    {
      source_id: "J-2024-072-T03",
      hybrid_score: 0.032787,
      outcome: "failed",
      failure_mode: "viscosity_collapse",
    },
  ],
  answer: {
    summary: "Gel-cream dengan elektrolit sering turun viskositasnya.",
    limitations: "Evidence ini berasal dari data sintetis dan memerlukan validasi R&D manusia.",
  },
  requires_human_review: true,
};

const ABSTAIN = {
  query: "resep sunscreen",
  evidence_status: "insufficient",
  evidence: [],
  answer: null,
  requires_human_review: true,
  limitations: ["Evidence tidak cukup untuk menjawab pertanyaan ini."],
};

function tanya(pertanyaan: string) {
  render(<DocCopilot proyek={PROYEK} batch={BATCH} onTutup={() => {}} />);
  fireEvent.change(screen.getByPlaceholderText(/tanya tentang jurnal ini/i), {
    target: { value: pertanyaan },
  });
  fireEvent.click(screen.getByLabelText("Kirim"));
}

describe("DocCopilot", () => {
  it("menampilkan ringkasan, sumber, dan limitation dari F1", async () => {
    mockFetch(SUKSES);
    tanya("kenapa viskositas turun");

    expect(
      await screen.findByText("Gel-cream dengan elektrolit sering turun viskositasnya."),
    ).toBeTruthy();
    expect(screen.getByText(/J-2024-072-T03/)).toBeTruthy();
    expect(screen.getByText(/data sintetis dan memerlukan validasi/i)).toBeTruthy();
  });

  it("memanggil endpoint F1 dengan query pengguna", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(SUKSES), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    tanya("kenapa viskositas turun");

    await screen.findByText("Gel-cream dengan elektrolit sering turun viskositasnya.");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/v1/f1/query");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      query: "kenapa viskositas turun",
    });
  });

  it("abstain saat evidence tidak cukup tanpa mengarang jawaban", async () => {
    mockFetch(ABSTAIN);
    tanya("resep sunscreen");

    expect(await screen.findByText(/evidence tidak cukup untuk menjawab/i)).toBeTruthy();
    expect(screen.queryByText(/Gel-cream/)).toBeNull();
  });

  it("jatuh ke rule lokal dan menandainya saat gateway tidak tersedia", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    tanya("berapa perkiraan hpp");

    expect(await screen.findByText(/jawaban rule lokal/i)).toBeTruthy();
    expect(screen.getByText(/gateway model tidak tersedia/i)).toBeTruthy();
  });

  it("tidak menawarkan kontrol persen atau konsentrasi", async () => {
    mockFetch(SUKSES);
    tanya("kenapa viskositas turun");
    await screen.findByText("Gel-cream dengan elektrolit sering turun viskositasnya.");

    const label = [...screen.queryAllByRole("button"), ...screen.queryAllByRole("textbox")]
      .map((element) => element.textContent ?? "")
      .join(" | ");
    expect(label).not.toMatch(/persen|konsentrasi|%|spf/i);
  });
});
