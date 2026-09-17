// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { VoiceLog } from "./VoiceLog";
import type { F5Draft } from "@/lib/paralab/f5-adapter";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const DRAFT: F5Draft = {
  trial_id: "serum-batch-2",
  proposed_checkpoint_patch: {
    measurements: { ph: 5.5 },
    observations: { appearance: "homogen" },
  },
  requires_confirmation: true,
};

function mockFetch(payload: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify(payload), { status })),
  );
}

function buatDraft(onTerapkan: (hasil: unknown) => void) {
  render(
    <VoiceLog
      selectedTrialId="serum-batch-2"
      onTerapkan={onTerapkan as never}
    />,
  );
  fireEvent.click(screen.getByTitle(/pencatatan suara/i));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "pH lima koma lima" } });
  fireEvent.click(screen.getByRole("button", { name: /buat draft/i }));
}

describe("VoiceLog", () => {
  it("tidak menulis ke jurnal saat draft dibuat", async () => {
    mockFetch(DRAFT);
    const onTerapkan = vi.fn();
    buatDraft(onTerapkan);

    expect(await screen.findByText(/serum-batch-2/)).toBeTruthy();
    expect(onTerapkan).not.toHaveBeenCalled();
  });

  it("memperingatkan bahwa draft belum masuk jurnal", async () => {
    mockFetch(DRAFT);
    buatDraft(vi.fn());

    expect(await screen.findByText(/draft belum masuk ke jurnal/i)).toBeTruthy();
  });

  it("menulis ke jurnal hanya setelah konfirmasi", async () => {
    mockFetch(DRAFT);
    const onTerapkan = vi.fn();
    buatDraft(onTerapkan);

    fireEvent.click(await screen.findByRole("button", { name: /konfirmasi/i }));

    expect(onTerapkan).toHaveBeenCalledTimes(1);
    expect(onTerapkan.mock.calls[0]![0]).toMatchObject({
      mentah: "pH lima koma lima",
      parameter: [{ label: "pH", nilai: 5.5, unit: "" }],
    });
  });

  it("menolak draft yang mengklaim tidak butuh konfirmasi", async () => {
    mockFetch({ ...DRAFT, requires_confirmation: false });
    const onTerapkan = vi.fn();
    buatDraft(onTerapkan);

    expect(await screen.findByText(/harus meminta konfirmasi/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /konfirmasi/i })).toBeNull();
    expect(onTerapkan).not.toHaveBeenCalled();
  });

  it("menampilkan pesan error saat gateway menolak", async () => {
    mockFetch({ detail: "transcript too short" }, 422);
    buatDraft(vi.fn());

    expect(await screen.findByText(/transcript too short/)).toBeTruthy();
  });
});
