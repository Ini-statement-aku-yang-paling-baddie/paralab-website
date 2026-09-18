import { describe, expect, it } from "vitest";
import { bolehMulaiTimeframe, buatCitraManual } from "./timeframe";

describe("bolehMulaiTimeframe", () => {
  it("mengizinkan uji timeframe dengan feedback tanpa gambar spesimen awal", () => {
    expect(
      bolehMulaiTimeframe("Kondisi sampel akan dicatat manual pada pengamatan berikutnya."),
    ).toBe(true);
  });

  it("tetap memerlukan feedback peneliti", () => {
    expect(bolehMulaiTimeframe("   ")).toBe(false);
  });
});

describe("buatCitraManual", () => {
  it("membuat entri pengamatan tanpa berkas gambar", () => {
    const entri = buatCitraManual({
      hari: 3,
      homogenitas: 92,
      estimasiDroplet: 14.2,
      indeksPolidispersi: 0.18,
      skorPemisahan: 8,
      kesimpulan: "Homogen, tidak ada pemisahan fase.",
      waktu: "2026-09-18T00:00:00.000Z",
    });

    expect(entri).toMatchObject({
      hari: 3,
      sumber: "manual",
      homogenitas: 92,
      estimasiDroplet: 14.2,
    });
    expect(entri.gambar).toBeUndefined();
    expect(entri.namaFile).toBeUndefined();
  });
});
