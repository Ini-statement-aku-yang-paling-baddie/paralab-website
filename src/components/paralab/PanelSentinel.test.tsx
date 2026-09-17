// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PanelSentinel } from "./PanelSentinel";
import { cekKesehatanF3, jalankanF3, type F3Forecast } from "@/lib/paralab/f3";
import type { Batch, Project } from "@/lib/paralab/data";

vi.mock("@/lib/paralab/f3", async (importOriginal) => {
  const nyata = await importOriginal<typeof import("@/lib/paralab/f3")>();
  return { ...nyata, jalankanF3: vi.fn(), cekKesehatanF3: vi.fn() };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const PROYEK = {
  id: "serum",
  judul: "Serum Pencerah",
  kategori: "Pelembap",
  peneliti: "Dina Aprilia",
  targets: [],
} as unknown as Project;

const BATCH = { nomor: 2, bahan: [], hasil: [], prosedur: [] } as unknown as Batch;

const HASIL: F3Forecast = {
  kind: "forecast",
  trialId: "serum-batch-2",
  keputusan: "flag_high_risk",
  risiko: 0.9965,
  band: "high",
  keyakinan: "high",
  mingguForecast: 4,
  horizon: "week_12",
  tindakan: "Mulai reformulasi paralel.",
  sinyal: [],
  batas: ["Forecast tidak menggantikan formal stability validation."],
  screening: null,
  modelVersion: "stability-sentinel-v1",
  dataOrigin: "synthetic_demo",
};

describe("PanelSentinel onHasil", () => {
  it("meneruskan hasil F3 asli ke pemanggil supaya F4 memakai sumber yang sama", async () => {
    vi.mocked(cekKesehatanF3).mockResolvedValue({
      ok: true,
      modelVersion: "stability-sentinel-v1",
      dataOrigin: "synthetic_demo",
      cvStatus: "concept_only_synthetic_render_pilot",
    });
    vi.mocked(jalankanF3).mockResolvedValue(HASIL);

    const onHasil = vi.fn();
    render(
      <PanelSentinel proyek={PROYEK} batch={BATCH} peneliti="Dina Aprilia" onHasil={onHasil} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /jalankan f3/i }));

    await waitFor(() => expect(onHasil).toHaveBeenCalledWith(HASIL));
  });

  it("tetap berjalan tanpa pemanggil yang mengharapkan hasil", async () => {
    vi.mocked(cekKesehatanF3).mockResolvedValue({ ok: false });
    vi.mocked(jalankanF3).mockResolvedValue(HASIL);

    render(<PanelSentinel proyek={PROYEK} batch={BATCH} peneliti="Dina Aprilia" />);
    fireEvent.click(screen.getByRole("button", { name: /jalankan f3/i }));

    await waitFor(() => expect(jalankanF3).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/risiko tinggi ditandai/i)).toBeTruthy();
  });
});
