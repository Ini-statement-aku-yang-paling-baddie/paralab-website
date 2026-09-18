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
  render(<VoiceLog selectedTrialId="serum-batch-2" onTerapkan={onTerapkan as never} />);
  fireEvent.click(screen.getByTitle(/pencatatan suara/i));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "pH lima koma lima" } });
  fireEvent.click(screen.getByRole("button", { name: /buat draft/i }));
}

describe("VoiceLog", () => {
  it("mengirim trial terpilih dari halaman saat membuat draft", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(DRAFT)));
    vi.stubGlobal("fetch", fetchMock);
    buatDraft(vi.fn());

    await screen.findByText(/serum-batch-2/);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/v1\/f5\/transcribe-draft$/),
      expect.objectContaining({
        body: JSON.stringify({
          selected_trial_id: "serum-batch-2",
          transcript: "pH lima koma lima",
        }),
      }),
    );
  });

  it("tidak menulis ke jurnal saat draft dibuat", async () => {
    mockFetch(DRAFT);
    const onTerapkan = vi.fn();
    buatDraft(onTerapkan);

    expect(await screen.findByText(/serum-batch-2/)).toBeTruthy();
    expect(onTerapkan).not.toHaveBeenCalled();
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

  it("menampilkan galat dan tidak merender draft untuk payload malformed", async () => {
    mockFetch({ ...DRAFT, proposed_checkpoint_patch: { measurements: [], observations: {} } });
    buatDraft(vi.fn());

    expect(await screen.findByText(/kontrak draft f5/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /konfirmasi/i })).toBeNull();
  });

  it("menolak draft untuk trial yang tidak sedang dipilih", async () => {
    mockFetch({ ...DRAFT, trial_id: "trial-lain" });
    buatDraft(vi.fn());

    expect(await screen.findByText(/trial yang dipilih/i)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /konfirmasi/i })).toBeNull();
  });

  it("mengizinkan peneliti mengedit draft sebelum konfirmasi", async () => {
    mockFetch(DRAFT);
    const onTerapkan = vi.fn();
    buatDraft(onTerapkan);

    const measurement = await screen.findByLabelText(/measurement ph/i);
    fireEvent.change(measurement, { target: { value: "5.7" } });
    fireEvent.click(screen.getByRole("button", { name: /konfirmasi/i }));

    expect(onTerapkan.mock.calls[0]![0]).toMatchObject({
      parameter: [{ label: "pH", nilai: 5.7, unit: "" }],
    });
  });
});
