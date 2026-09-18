import { BAHAN_LIBRARY, type Ingredient } from "./data";

export type StatusLot = "Tersedia" | "Karantina" | "Stok menipis" | "Mendekati kedaluwarsa";

export type LotBahan = {
  kode: string;
  bahanId: string;
  nama: string;
  pemasok: string;
  asal: string;
  produsen: string;
  kuantitas: number;
  satuan: "kg" | "L";
  rak: string;
  zona: string;
  diterima: string;
  kadaluarsa: string;
  coa: string;
  status: StatusLot;
  suhuSimpan: string;
};

const PEMASOK = [
  { nama: "PT Kimia Nusantara Jaya", asal: "Cikarang, Indonesia", produsen: "Kimia Nusantara" },
  { nama: "BASF Personal Care", asal: "Ludwigshafen, Jerman", produsen: "BASF SE" },
  { nama: "Croda Singapore", asal: "Singapura", produsen: "Croda International" },
  { nama: "Seppic Asia", asal: "Shanghai, Tiongkok", produsen: "Seppic SA" },
  { nama: "Evonik Care Solutions", asal: "Essen, Jerman", produsen: "Evonik Industries" },
  { nama: "Ashland Specialty", asal: "Wilmington, Amerika Serikat", produsen: "Ashland LLC" },
  { nama: "PT Sumber Bahan Aktif", asal: "Gresik, Indonesia", produsen: "Sumber Bahan Aktif" },
  { nama: "Nikkol Chemicals", asal: "Tokyo, Jepang", produsen: "Nikko Chemicals" },
  { nama: "Lubrizol Life Science", asal: "Cleveland, Amerika Serikat", produsen: "Lubrizol" },
  { nama: "Clariant Active Ingredients", asal: "Muttenz, Swiss", produsen: "Clariant AG" },
];

const ZONA = [
  { nama: "Zona A, Bahan Cair Umum", suhu: "Suhu ruang 20 sampai 25 C" },
  { nama: "Zona B, Bahan Aktif Sensitif", suhu: "Dingin 2 sampai 8 C, gelap" },
  { nama: "Zona C, Minyak dan Emolien", suhu: "Suhu ruang, jauh dari sumber panas" },
  { nama: "Zona D, Serbuk dan Polimer", suhu: "Kering, kelembapan di bawah 50 persen RH" },
  { nama: "Zona E, Bahan Mudah Terbakar", suhu: "Lemari tahan api, ventilasi khusus" },
];

function angka(teks: string, offset = 0) {
  let h = 2166136261 + offset * 7919;
  for (let i = 0; i < teks.length; i++) {
    h ^= teks.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const HARI = 86400000;
const PATOKAN = Date.UTC(2026, 8, 17);

function tanggal(offsetHari: number) {
  return new Date(PATOKAN + offsetHari * HARI).toISOString().slice(0, 10);
}

function zonaBahan(b: Ingredient) {
  const g = b.golongan.toLowerCase();
  if (
    b.penyimpanan.toLowerCase().includes("dingin") ||
    g.includes("aktif") ||
    g.includes("vitamin") ||
    g.includes("peptida")
  )
    return ZONA[1]!;
  if (g.includes("emolien") || g.includes("minyak") || g.includes("ester") || g.includes("lemak"))
    return ZONA[2]!;
  if (
    g.includes("polimer") ||
    g.includes("gum") ||
    g.includes("serbuk") ||
    g.includes("mineral") ||
    g.includes("filter")
  )
    return ZONA[3]!;
  if (g.includes("pelarut") || g.includes("alkohol") || g.includes("parfum")) return ZONA[4]!;
  return ZONA[0]!;
}

export function lotBahan(bahanId: string): LotBahan[] {
  const b = BAHAN_LIBRARY.find((x) => x.id === bahanId);
  if (!b) return [];
  const zona = zonaBahan(b);
  const jumlahLot = 1 + (angka(bahanId) % 3);
  const lots: LotBahan[] = [];
  for (let i = 0; i < jumlahLot; i++) {
    const h = angka(bahanId, i + 1);
    const pemasok = PEMASOK[h % PEMASOK.length]!;
    const diterimaOffset = -(10 + (h % 240));
    const umurSimpan = 365 + (h % 4) * 180;
    const kadaluarsaOffset = diterimaOffset + umurSimpan;
    const kuantitas = Number((0.5 + ((h >> 3) % 4000) / 10).toFixed(1));
    const cair = b.kelarutan.toLowerCase().includes("air") && b.phase.toLowerCase().includes("a");
    let status: StatusLot = "Tersedia";
    if (i === 0 && h % 11 === 0) status = "Karantina";
    else if (kuantitas < 8) status = "Stok menipis";
    else if (kadaluarsaOffset < 120) status = "Mendekati kedaluwarsa";
    lots.push({
      kode: "LOT-" + b.id.slice(0, 4).toUpperCase() + "-" + (2400 + (h % 600)) + "-" + (i + 1),
      bahanId: b.id,
      nama: b.name,
      pemasok: pemasok.nama,
      asal: pemasok.asal,
      produsen: pemasok.produsen,
      kuantitas,
      satuan: cair ? "L" : "kg",
      rak: "R" + (1 + (h % 9)) + "-" + String.fromCharCode(65 + (h % 6)) + "-" + (10 + (h % 40)),
      zona: zona.nama,
      diterima: tanggal(diterimaOffset),
      kadaluarsa: tanggal(kadaluarsaOffset),
      coa: "CoA-" + (100000 + (h % 899999)),
      status,
      suhuSimpan: zona.suhu,
    });
  }
  return lots;
}

export type RingkasStok = {
  total: number;
  satuan: string;
  jumlahLot: number;
  rakUtama: string;
  status: StatusLot;
  kadaluarsaTerdekat: string;
  asalUtama: string;
};

export function ringkasStok(bahanId: string): RingkasStok | null {
  const lots = lotBahan(bahanId);
  if (lots.length === 0) return null;
  const siap = lots.filter((l) => l.status !== "Karantina");
  const total = Number(siap.reduce((t, l) => t + l.kuantitas, 0).toFixed(1));
  const urut = [...lots].sort((a, b) => a.kadaluarsa.localeCompare(b.kadaluarsa));
  const prioritas: StatusLot[] = ["Karantina", "Stok menipis", "Mendekati kedaluwarsa", "Tersedia"];
  const status = prioritas.find((p) => lots.some((l) => l.status === p)) ?? "Tersedia";
  return {
    total,
    satuan: lots[0]!.satuan,
    jumlahLot: lots.length,
    rakUtama: lots[0]!.rak,
    status: total <= 0 ? "Stok menipis" : status,
    kadaluarsaTerdekat: urut[0]!.kadaluarsa,
    asalUtama: lots[0]!.asal,
  };
}

export const SEMUA_LOT: LotBahan[] = BAHAN_LIBRARY.flatMap((b) => lotBahan(b.id));

export function kebutuhanBahan(persen: number, skalaGram = 500) {
  return Number(((persen / 100) * skalaGram).toFixed(1));
}

export function cukupUntukBatch(bahanId: string, persen: number, skalaGram = 500) {
  const s = ringkasStok(bahanId);
  if (!s) return false;
  return s.total * 1000 >= kebutuhanBahan(persen, skalaGram);
}
