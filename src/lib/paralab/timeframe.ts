import type { CitraStabilitasEntry } from "./data";

export function bolehMulaiTimeframe(feedback: string): boolean {
  return feedback.trim().length > 0;
}

type PengamatanManual = Pick<
  CitraStabilitasEntry,
  | "hari"
  | "homogenitas"
  | "estimasiDroplet"
  | "indeksPolidispersi"
  | "skorPemisahan"
  | "kesimpulan"
  | "waktu"
>;

export function buatCitraManual(pengamatan: PengamatanManual): CitraStabilitasEntry {
  return {
    ...pengamatan,
    id: "manual-" + pengamatan.waktu + "-hari-" + pengamatan.hari,
    sumber: "manual",
    distribusi: [],
    histogram: [],
  };
}
