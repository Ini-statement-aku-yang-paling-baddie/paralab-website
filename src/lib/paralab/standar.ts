export type LingkupStandar = "nasional" | "internasional";

export type StandarUji = {
  id: string;
  kode: string;
  nama: string;
  lingkup: LingkupStandar;
  cakupan: string;
};

export const STANDAR_UJI: StandarUji[] = [
  {
    id: "sni_16_4399",
    kode: "SNI 16-4399",
    nama: "Sediaan tabir surya",
    lingkup: "nasional",
    cakupan: "Syarat mutu dan metode uji tabir surya di Indonesia",
  },
  {
    id: "sni_16_4954",
    kode: "SNI 16-4954",
    nama: "Pelembap kulit",
    lingkup: "nasional",
    cakupan: "Syarat mutu pelembap, pH, cemaran logam, cemaran mikroba",
  },
  {
    id: "sni_06_2588",
    kode: "SNI 06-2588",
    nama: "Sabun mandi cair",
    lingkup: "nasional",
    cakupan: "Kadar bahan aktif, pH, cemaran mikroba sabun cair",
  },
  {
    id: "perbpom_17",
    kode: "PerBPOM 17 Tahun 2022",
    nama: "Bahan kosmetika",
    lingkup: "nasional",
    cakupan: "Daftar bahan diizinkan, dibatasi, dan dilarang",
  },
  {
    id: "perbpom_12",
    kode: "PerBPOM 12 Tahun 2019",
    nama: "Cemaran kosmetika",
    lingkup: "nasional",
    cakupan: "Batas cemaran mikroba dan logam berat",
  },
  {
    id: "cpkb",
    kode: "CPKB BPOM",
    nama: "Cara pembuatan kosmetika yang baik",
    lingkup: "nasional",
    cakupan: "Kendali proses, dokumentasi batch, higiene produksi",
  },
  {
    id: "has23000",
    kode: "HAS 23000 MUI",
    nama: "Sistem jaminan produk halal",
    lingkup: "nasional",
    cakupan: "Kriteria bahan, fasilitas, dan penelusuran halal",
  },
  {
    id: "iso11930",
    kode: "ISO 11930",
    nama: "Uji efikasi pengawet",
    lingkup: "internasional",
    cakupan: "Challenge test lima mikroba uji selama 28 hari",
  },
  {
    id: "iso21149",
    kode: "ISO 21149",
    nama: "Angka lempeng total aerob",
    lingkup: "internasional",
    cakupan: "Enumerasi bakteri aerob mesofilik",
  },
  {
    id: "iso16212",
    kode: "ISO 16212",
    nama: "Enumerasi khamir dan kapang",
    lingkup: "internasional",
    cakupan: "Cemaran jamur pada sediaan kosmetik",
  },
  {
    id: "iso24444",
    kode: "ISO 24444",
    nama: "Penentuan SPF in vivo",
    lingkup: "internasional",
    cakupan: "Pengukuran SPF pada panel sukarelawan",
  },
  {
    id: "iso24443",
    kode: "ISO 24443",
    nama: "Penentuan UVA in vitro",
    lingkup: "internasional",
    cakupan: "Rasio UVA PF dan panjang gelombang kritis",
  },
  {
    id: "iso18889",
    kode: "ISO 18889",
    nama: "Uji ketahanan air",
    lingkup: "internasional",
    cakupan: "Water resistance tabir surya",
  },
  {
    id: "ich_q1a",
    kode: "ICH Q1A R2",
    nama: "Uji stabilitas",
    lingkup: "internasional",
    cakupan: "Kondisi jangka panjang, intermediate, dan dipercepat",
  },
  {
    id: "ich_q1b",
    kode: "ICH Q1B",
    nama: "Uji fotostabilitas",
    lingkup: "internasional",
    cakupan: "Paparan cahaya terkendali pada sediaan dan kemasan",
  },
  {
    id: "usp51",
    kode: "USP 51",
    nama: "Antimicrobial effectiveness",
    lingkup: "internasional",
    cakupan: "Alternatif challenge test farmakope Amerika",
  },
  {
    id: "asean_acd",
    kode: "ASEAN Cosmetic Directive",
    nama: "Regulasi kosmetik ASEAN",
    lingkup: "internasional",
    cakupan: "Notifikasi, penandaan, dan daftar bahan ASEAN",
  },
  {
    id: "oecd439",
    kode: "OECD 439",
    nama: "Iritasi kulit in vitro",
    lingkup: "internasional",
    cakupan: "Model epidermis manusia rekonstruksi, bebas hewan",
  },
  {
    id: "astm_d7490",
    kode: "ASTM D7490",
    nama: "Energi permukaan kemasan",
    lingkup: "internasional",
    cakupan: "Kompatibilitas sediaan dengan bahan kemasan",
  },
];

export type PilihanStandar = "nasional" | "internasional" | "keduanya";

export const PILIHAN_STANDAR: { id: PilihanStandar; label: string; teks: string }[] = [
  {
    id: "nasional",
    label: "Standar nasional",
    teks: "SNI, PerBPOM, CPKB, dan HAS 23000 untuk pasar Indonesia.",
  },
  {
    id: "internasional",
    label: "Standar internasional",
    teks: "ISO, ICH, USP, OECD, dan ASEAN Cosmetic Directive untuk ekspor.",
  },
  {
    id: "keduanya",
    label: "Nasional dan internasional",
    teks: "Laporan memuat dua kolom acuan sekaligus, cocok untuk produk ekspor dan lokal.",
  },
];

export function standarTerpilih(pilihan: PilihanStandar): StandarUji[] {
  if (pilihan === "keduanya") return STANDAR_UJI;
  return STANDAR_UJI.filter((s) => s.lingkup === pilihan);
}

export function labelStandar(pilihan: PilihanStandar) {
  return PILIHAN_STANDAR.find((p) => p.id === pilihan)?.label ?? "Standar nasional";
}
