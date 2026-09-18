import { describe, expect, it } from "vitest";
import { bolehAksesRuangKerja, tujuanSetelahMasuk } from "./access";

describe("bolehAksesRuangKerja", () => {
  it("membatasi pengamat ke dashboard", () => {
    expect(bolehAksesRuangKerja("Pengamat", "/dashboard")).toBe(true);
    expect(bolehAksesRuangKerja("Pengamat", "/journal/new")).toBe(false);
    expect(bolehAksesRuangKerja("Pengamat", "/iot")).toBe(false);
  });

  it("memberi seluruh peran riset akses ke workspace", () => {
    expect(bolehAksesRuangKerja("RnD Formulator", "/journal/new")).toBe(true);
    expect(bolehAksesRuangKerja("Team Lead RnD", "/logbook")).toBe(true);
    expect(bolehAksesRuangKerja("Regulatory Specialist", "/warehouse")).toBe(true);
  });
});

describe("tujuanSetelahMasuk", () => {
  it("kembali ke halaman internal yang sebelumnya diminta", () => {
    expect(tujuanSetelahMasuk("/journal/new")).toBe("/journal/new");
  });

  it("menolak tujuan eksternal dan halaman login", () => {
    expect(tujuanSetelahMasuk("//malicious.example")).toBe("/dashboard");
    expect(tujuanSetelahMasuk("/login")).toBe("/dashboard");
    expect(tujuanSetelahMasuk(undefined)).toBe("/dashboard");
  });
});
