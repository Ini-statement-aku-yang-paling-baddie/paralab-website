export type HalalStatus = "halal" | "syubhat" | "haram";

export type Ingredient = {
  id: string;
  name: string;
  inci: string;
  phase: string;
  fungsi: string;
  percent: number;
  hargaPerKg: number;
  halal: HalalStatus;
  catatanHalal: string;
  bpom: "diizinkan" | "dibatasi" | "dilarang";
  batasBpom?: string | undefined;
  golongan: string;
  cas: string;
  rumus: string;
  bm: number;
  kelarutan: string;
  phKerja: [number, number];
  dosis: [number, number];
  suhuTambah: string;
  mekanisme: string;
  inkompatibel: string;
  penyimpanan: string;
  spesifikasi: string;
  grade: string;
};


export type TargetParam = {
  id: string;
  label: string;
  unit: string;
  target: number;
  toleransi: number;
  sensor: string;
};

export type TestResult = {
  paramId: string;
  nilai: number | null;
  sumber: "sensor" | "manual";
  waktu?: string | undefined;
};

export type CitraStabilitasEntry = {
  id: string;
  hari: number;
  waktu: string;
  namaFile: string;
  gambar: string;
  homogenitas: number;
  estimasiDroplet: number;
  indeksPolidispersi: number;
  skorPemisahan: number;
  kesimpulan: string;
  distribusi: { ukuran: number; volume: number }[];
  histogram: { bin: string; jumlah: number }[];
};

export type BatchStatus = "draft" | "berjalan" | "pemantauan" | "selesai" | "dievaluasi";

export type Batch = {
  nomor: number;
  status: BatchStatus;
  dibuat: string;
  tujuan: string[];
  hipotesis: string;
  prosedur: string[];
  bahan: Ingredient[];
  hasil: TestResult[];
  observasi: string;
  feedback: string;
  evaluasi?: BatchEvaluation | undefined;
  dokumen?: string | undefined;
  dokumenDiubah?: string | undefined;
  ujiSampelDimulai?: string | undefined;
  citraStabilitas?: CitraStabilitasEntry[] | undefined;
};

export type BatchEvaluation = {
  ringkasan: string;
  kekurangan: string[];
  rekomendasi: string[];
  perubahanFormula: { bahan: string; dari: number; ke: number; alasan: string }[];
  rancanganBerikutnya: { tujuan: string[]; fokusUji: string[]; hipotesis: string };
  skorKesesuaian: number;
};

export type Project = {
  id: string;
  judul: string;
  peneliti: string;
  tim: string;
  kategori: string;
  status: "Draft" | "Sedang Berjalan" | "Menunggu Tinjauan" | "Selesai";
  update: string;
  brief: string;
  targets: TargetParam[];
  batches: Batch[];
  dikirimKe?: string | undefined;
  standar?: "nasional" | "internasional" | "keduanya" | undefined;
};

export type SensorDef = {
  id: string;
  label: string;
  unit: string;
  grup: "Lingkungan Lab" | "Reaktor & Proses" | "Kualitas Sampel" | "Utilitas & Keselamatan";
  base: number;
  jitter: number;
  aman: [number, number];
  desimal: number;
};

export const SENSORS: SensorDef[] = [
  { id: "suhu_ruang", label: "Suhu Ruang", unit: "°C", grup: "Lingkungan Lab", base: 22.4, jitter: 0.5, aman: [20, 25], desimal: 1 },
  { id: "kelembapan", label: "Kelembapan Relatif", unit: "%RH", grup: "Lingkungan Lab", base: 52, jitter: 3, aman: [45, 60], desimal: 0 },
  { id: "tekanan_ruang", label: "Tekanan Ruang", unit: "Pa", grup: "Lingkungan Lab", base: 12, jitter: 2.5, aman: [5, 20], desimal: 1 },
  { id: "partikel", label: "Partikel Udara PM2.5", unit: "µg/m³", grup: "Lingkungan Lab", base: 8, jitter: 3, aman: [0, 15], desimal: 1 },
  { id: "tvoc", label: "TVOC", unit: "ppb", grup: "Lingkungan Lab", base: 110, jitter: 35, aman: [0, 250], desimal: 0 },
  { id: "co2", label: "Karbon Dioksida", unit: "ppm", grup: "Lingkungan Lab", base: 620, jitter: 70, aman: [400, 1000], desimal: 0 },
  { id: "cahaya", label: "Intensitas Cahaya", unit: "lux", grup: "Lingkungan Lab", base: 480, jitter: 40, aman: [300, 750], desimal: 0 },
  { id: "kebisingan", label: "Kebisingan", unit: "dB", grup: "Lingkungan Lab", base: 54, jitter: 5, aman: [0, 70], desimal: 0 },
  { id: "suhu_reaktor", label: "Suhu Reaktor", unit: "°C", grup: "Reaktor & Proses", base: 72, jitter: 1.4, aman: [68, 78], desimal: 1 },
  { id: "rpm", label: "Kecepatan Homogenizer", unit: "rpm", grup: "Reaktor & Proses", base: 3200, jitter: 120, aman: [2800, 3600], desimal: 0 },
  { id: "torsi", label: "Torsi Pengaduk", unit: "N·cm", grup: "Reaktor & Proses", base: 41, jitter: 4, aman: [25, 60], desimal: 1 },
  { id: "vakum", label: "Tekanan Vakum", unit: "mbar", grup: "Reaktor & Proses", base: 320, jitter: 25, aman: [250, 450], desimal: 0 },
  { id: "ph", label: "pH Sampel", unit: "", grup: "Kualitas Sampel", base: 5.4, jitter: 0.12, aman: [4.8, 6.0], desimal: 2 },
  { id: "viskositas", label: "Viskositas", unit: "cP", grup: "Kualitas Sampel", base: 6400, jitter: 220, aman: [5000, 8000], desimal: 0 },
  { id: "konduktivitas", label: "Konduktivitas", unit: "µS/cm", grup: "Kualitas Sampel", base: 780, jitter: 40, aman: [500, 1200], desimal: 0 },
  { id: "turbiditas", label: "Turbiditas", unit: "NTU", grup: "Kualitas Sampel", base: 14, jitter: 3, aman: [0, 30], desimal: 1 },
  { id: "ukuran_droplet", label: "Ukuran Droplet", unit: "µm", grup: "Kualitas Sampel", base: 3.4, jitter: 0.3, aman: [1, 5], desimal: 2 },
  { id: "aktivitas_air", label: "Aktivitas Air", unit: "aw", grup: "Kualitas Sampel", base: 0.82, jitter: 0.02, aman: [0.6, 0.9], desimal: 2 },
  { id: "suhu_chiller", label: "Suhu Chiller", unit: "°C", grup: "Utilitas & Keselamatan", base: 6.2, jitter: 0.6, aman: [4, 8], desimal: 1 },
  { id: "aliran_air", label: "Aliran Air Pendingin", unit: "L/min", grup: "Utilitas & Keselamatan", base: 9.4, jitter: 0.8, aman: [7, 12], desimal: 1 },
  { id: "uv", label: "Lampu UV Sterilisasi", unit: "mW/cm²", grup: "Utilitas & Keselamatan", base: 1.2, jitter: 0.2, aman: [0.8, 2], desimal: 2 },
  { id: "gas", label: "Detektor Gas Mudah Terbakar", unit: "%LEL", grup: "Utilitas & Keselamatan", base: 2, jitter: 1.2, aman: [0, 10], desimal: 1 },
];

export const RESEARCHERS = [
  "Samuel Kevin",
  "Dina Aprilia",
  "Raka Wijaya",
  "Nadia Puspita",
  "Farhan Maulana",
  "Intan Rahmawati",
];

export const DIVISI = [
  "Divisi Produksi",
  "Divisi Regulatory & Legal",
  "Divisi Quality Control",
  "Divisi Marketing Produk",
  "Divisi Supply Chain",
];

const bahan = (
  id: string,
  name: string,
  inci: string,
  phase: string,
  fungsi: string,
  percent: number,
  hargaPerKg: number,
  x: Partial<Ingredient> = {},
): Ingredient => ({
  halal: "halal",
  catatanHalal: "Bahan nabati atau sintetis, tersertifikasi MUI",
  bpom: "diizinkan",
  golongan: "Bahan pendukung",
  cas: "-",
  rumus: "-",
  bm: 0,
  kelarutan: "Larut air",
  phKerja: [4, 7],
  dosis: [0.1, 5],
  suhuTambah: "Fase dingin di bawah 40 C",
  mekanisme: "Mendukung sistem formula",
  inkompatibel: "Tidak ada catatan khusus",
  penyimpanan: "Suhu ruang terkendali, wadah tertutup rapat, hindari cahaya langsung",
  spesifikasi: "Verifikasi CoA pemasok tiap lot",
  grade: "Cosmetic grade",
  ...x,
  id,
  name,
  inci,
  phase,
  fungsi,
  percent,
  hargaPerKg,
});

export const BAHAN_LIBRARY: Ingredient[] = [
  // Pelarut, humektan, dan pembawa
  bahan("aqua", "Air Demineralisasi", "Aqua", "A", "Pelarut utama", 62, 3000, {
    golongan: "Pelarut",
    cas: "7732-18-5",
    rumus: "H2O",
    bm: 18.02,
    kelarutan: "Pelarut polar",
    phKerja: [5, 7],
    dosis: [30, 90],
    suhuTambah: "Fase air, dipanaskan sampai 75 C",
    mekanisme: "Media pelarutan bahan hidrofilik dan fase kontinu emulsi",
    inkompatibel: "Kontaminasi mikroba bila konduktivitas di atas 5 uS per cm",
    spesifikasi: "Konduktivitas maksimal 5 uS per cm, TPC kurang dari 10 cfu per ml",
    grade: "Purified water USP",
  }),
  bahan("glycerin", "Gliserin Nabati", "Glycerin", "A", "Humektan", 5, 32000, {
    golongan: "Humektan",
    cas: "56-81-5",
    rumus: "C3H8O3",
    bm: 92.09,
    phKerja: [3, 9],
    dosis: [2, 10],
    suhuTambah: "Fase air panas",
    mekanisme: "Mengikat air pada stratum korneum dan menurunkan aktivitas air",
    inkompatibel: "Oksidator kuat seperti kalium permanganat",
    spesifikasi: "Kemurnian minimal 99.5 persen, bebas dietilen glikol",
    grade: "USP nabati RSPO",
  }),
  bahan("butylene", "Butylene Glycol", "Butylene Glycol", "A", "Humektan dan pelarut aktif", 3, 68000, {
    golongan: "Humektan",
    cas: "107-88-0",
    rumus: "C4H10O2",
    bm: 90.12,
    phKerja: [3, 9],
    dosis: [1, 10],
    mekanisme: "Melarutkan aktif polar dan memberi rasa ringan tanpa lengket",
    spesifikasi: "Kadar air maksimal 0.2 persen",
  }),
  bahan("propanediol", "Propanediol Fermentasi", "Propanediol", "A", "Humektan dan booster pengawet", 3, 88000, {
    golongan: "Humektan",
    cas: "504-63-2",
    rumus: "C3H8O2",
    bm: 76.09,
    dosis: [1, 8],
    mekanisme: "Menurunkan aktivitas air dan meningkatkan efikasi sistem pengawet",
    inkompatibel: "Kadar tinggi dapat menurunkan viskositas gel karbomer",
  }),
  bahan("pentylene", "Pentylene Glycol", "Pentylene Glycol", "A", "Pelarut dan antimikroba ringan", 2, 210000, {
    golongan: "Humektan",
    cas: "5343-92-0",
    rumus: "C5H12O2",
    bm: 104.15,
    dosis: [1, 5],
    mekanisme: "Mendukung sistem pengawet bebas paraben",
  }),
  bahan("betaine", "Betaine Gula Bit", "Betaine", "A", "Humektan osmolit", 1.5, 145000, {
    golongan: "Humektan",
    cas: "107-43-7",
    rumus: "C5H11NO2",
    bm: 117.15,
    dosis: [0.5, 4],
    mekanisme: "Osmoprotektan yang menjaga keseimbangan air sel kulit",
  }),
  bahan("urea", "Urea Kosmetik", "Urea", "A", "Humektan dan keratolitik ringan", 3, 54000, {
    golongan: "Humektan",
    cas: "57-13-6",
    rumus: "CH4N2O",
    bm: 60.06,
    phKerja: [5, 7],
    dosis: [1, 10],
    mekanisme: "Bagian natural moisturizing factor, melunakkan keratin",
    inkompatibel: "Terhidrolisis menjadi amonia pada pH di luar 5 sampai 7 dan suhu tinggi",
    suhuTambah: "Tambahkan di bawah 40 C",
  }),

  // Aktif pencerah golongan niacinamide dan turunan vitamin C
  bahan("niacinamide", "Niacinamide USP Kadar Rendah Asam Nikotinat", "Niacinamide", "A", "Pencerah dan pengendali sebum", 4, 480000, {
    golongan: "Aktif pencerah",
    cas: "98-92-0",
    rumus: "C6H6N2O",
    bm: 122.12,
    phKerja: [5, 7],
    dosis: [2, 10],
    mekanisme: "Menghambat transfer melanosom ke keratinosit dan memperbaiki sawar lipid",
    inkompatibel: "Asam askorbat bebas pada pH rendah, hidrolisis menjadi asam nikotinat pemicu flushing",
    spesifikasi: "Asam nikotinat bebas maksimal 150 ppm, kadar 99 sampai 101 persen",
    grade: "PC grade low nicotinic acid",
  }),
  bahan("niacinamide_hp", "Niacinamide Kadar Tinggi 10 Persen", "Niacinamide", "A", "Pencerah intensif", 10, 520000, {
    golongan: "Aktif pencerah",
    cas: "98-92-0",
    rumus: "C6H6N2O",
    bm: 122.12,
    phKerja: [5.5, 6.5],
    dosis: [5, 10],
    mekanisme: "Dosis tinggi untuk klaim pencerah kuat, perlu uji toleransi kulit sensitif",
    inkompatibel: "Risiko flushing meningkat, wajib kontrol asam nikotinat bebas di bawah 100 ppm",
    spesifikasi: "Uji patch 48 jam wajib pada kadar di atas 5 persen",
  }),
  bahan("vitc", "Sodium Ascorbyl Phosphate", "Sodium Ascorbyl Phosphate", "C", "Antioksidan stabil turunan vitamin C", 2, 1450000, {
    golongan: "Turunan vitamin C",
    cas: "66170-10-3",
    rumus: "C6H6Na3O9P",
    bm: 322.05,
    phKerja: [6, 7],
    dosis: [1, 3],
    mekanisme: "Prodrug vitamin C yang dihidrolisis fosfatase kulit menjadi asam askorbat",
    inkompatibel: "Ion besi dan tembaga memicu perubahan warna, hindari pH di bawah 6",
    spesifikasi: "Kadar minimal 95 persen, warna larutan tidak lebih tua dari standar kuning muda",
  }),
  bahan("map", "Magnesium Ascorbyl Phosphate", "Magnesium Ascorbyl Phosphate", "C", "Pencerah lembut turunan vitamin C", 3, 1680000, {
    golongan: "Turunan vitamin C",
    cas: "113170-55-1",
    rumus: "C12H12Mg3O18P2",
    bm: 706.6,
    phKerja: [6.5, 8],
    dosis: [1, 5],
    mekanisme: "Menghambat tirosinase dengan iritasi rendah, cocok kulit sensitif",
    inkompatibel: "Mengendap bersama elektrolit divalen dan gum anionik pada pH rendah",
  }),
  bahan("laa", "L Ascorbic Acid Murni", "Ascorbic Acid", "C", "Antioksidan kuat", 10, 620000, {
    golongan: "Turunan vitamin C",
    cas: "50-81-7",
    rumus: "C6H8O6",
    bm: 176.12,
    phKerja: [2.5, 3.5],
    dosis: [5, 20],
    kelarutan: "Larut air, sangat mudah teroksidasi",
    mekanisme: "Donor elektron langsung, kofaktor sintesis kolagen",
    inkompatibel: "Oksigen, cahaya, logam berat, niacinamide pada pH rendah",
    suhuTambah: "Tambahkan pada fase dingin dalam kondisi nitrogen blanket",
    penyimpanan: "Kemasan kedap cahaya dan udara, simpan pada 2 sampai 8 C",
    spesifikasi: "Warna larutan b value maksimal 8 pada T0",
  }),
  bahan("eac", "Ethyl Ascorbic Acid", "3-O-Ethyl Ascorbic Acid", "C", "Pencerah stabil larut air", 2, 2100000, {
    golongan: "Turunan vitamin C",
    cas: "86404-04-8",
    rumus: "C8H12O6",
    bm: 204.18,
    phKerja: [4, 6],
    dosis: [1, 3],
    mekanisme: "Gugus etil melindungi posisi 3 sehingga stabil dan tetap bioaktif",
    inkompatibel: "Warna menguning bila terdapat besi bebas",
  }),
  bahan("thda", "Tetrahexyldecyl Ascorbate", "Tetrahexyldecyl Ascorbate", "B", "Vitamin C larut minyak", 2, 3200000, {
    golongan: "Turunan vitamin C",
    cas: "183476-82-6",
    rumus: "C70H128O10",
    bm: 1129.8,
    kelarutan: "Larut minyak",
    phKerja: [4, 7],
    dosis: [0.5, 3],
    mekanisme: "Penetrasi lipofilik ke dermis lalu dikonversi menjadi asam askorbat",
    inkompatibel: "Bahan berair tanpa emulsifier, dapat memicu kabut pada gel bening",
  }),
  bahan("ascorbyl_glucoside", "Ascorbyl Glucoside", "Ascorbyl Glucoside", "C", "Pencerah bertahap", 2, 1950000, {
    golongan: "Turunan vitamin C",
    cas: "129499-78-1",
    rumus: "C12H18O11",
    bm: 338.26,
    phKerja: [5, 7],
    dosis: [1, 3],
    mekanisme: "Dipecah alfa glukosidase kulit menjadi vitamin C secara perlahan",
  }),
  bahan("kojic", "Asam Kojat", "Kojic Acid", "C", "Pencerah penghambat tirosinase", 1, 890000, {
    golongan: "Aktif pencerah",
    cas: "501-30-4",
    rumus: "C6H6O4",
    bm: 142.11,
    phKerja: [4, 5.5],
    dosis: [0.5, 2],
    bpom: "dibatasi",
    batasBpom: "Maksimal 2 persen",
    catatanHalal: "Hasil fermentasi Aspergillus oryzae",
    mekanisme: "Mengikat tembaga pada sisi aktif tirosinase",
    inkompatibel: "Ion besi membentuk kompleks merah kecoklatan",
  }),
  bahan("arbutin", "Alpha Arbutin", "Alpha-Arbutin", "C", "Pencerah bertarget", 2, 4200000, {
    golongan: "Aktif pencerah",
    cas: "84380-01-8",
    rumus: "C12H16O7",
    bm: 272.25,
    phKerja: [4, 7],
    dosis: [0.5, 2],
    mekanisme: "Analog hidrokuinon terglikosilasi yang menghambat tirosinase tanpa sitotoksik",
    inkompatibel: "Hidrolisis menjadi hidrokuinon pada pH di bawah 4 atau suhu di atas 50 C",
    suhuTambah: "Tambahkan di bawah 40 C",
  }),
  bahan("tranexamic", "Asam Traneksamat", "Tranexamic Acid", "C", "Penanganan hiperpigmentasi", 3, 1250000, {
    golongan: "Aktif pencerah",
    cas: "1197-18-8",
    rumus: "C8H15NO2",
    bm: 157.21,
    phKerja: [5, 7],
    dosis: [1, 5],
    mekanisme: "Menghambat jalur plasmin sehingga menurunkan melanogenesis akibat inflamasi",
  }),
  bahan("glutathione", "Glutathione Tereduksi", "Glutathione", "C", "Antioksidan pencerah", 1, 3800000, {
    golongan: "Aktif pencerah",
    cas: "70-18-8",
    rumus: "C10H17N3O6S",
    bm: 307.32,
    phKerja: [4, 6],
    dosis: [0.1, 1],
    mekanisme: "Mengalihkan melanogenesis dari eumelanin ke feomelanin",
    inkompatibel: "Teroksidasi cepat oleh udara dan logam, butuh kelator",
    catatanHalal: "Pastikan hasil fermentasi ragi, bukan hidrolisat hewani",
    halal: "syubhat",
  }),

  // Retinoid dan alternatif
  bahan("retinol", "Retinol Terenkapsulasi", "Retinol", "C", "Anti penuaan", 0.3, 5400000, {
    golongan: "Retinoid",
    cas: "68-26-8",
    rumus: "C20H30O",
    bm: 286.45,
    kelarutan: "Larut minyak",
    phKerja: [5, 6.5],
    dosis: [0.1, 0.3],
    bpom: "dibatasi",
    batasBpom: "Maksimal 0.3 persen leave on",
    mekanisme: "Dikonversi menjadi asam retinoat, mempercepat pergantian sel dan sintesis kolagen",
    inkompatibel: "Cahaya, oksigen, AHA dan BHA kuat, peroksida",
    suhuTambah: "Tambahkan di bawah 35 C dengan nitrogen blanket",
    penyimpanan: "Kemasan airless kedap cahaya, simpan 2 sampai 8 C",
    spesifikasi: "Kadar retinol tersisa minimal 90 persen setelah 3 bulan pada 25 C",
  }),
  bahan("retinal", "Retinaldehyde", "Retinal", "C", "Retinoid potensi tinggi", 0.1, 9800000, {
    golongan: "Retinoid",
    cas: "116-31-4",
    rumus: "C20H28O",
    bm: 284.44,
    kelarutan: "Larut minyak",
    phKerja: [5, 6.5],
    dosis: [0.05, 0.1],
    bpom: "dibatasi",
    batasBpom: "Ikuti batas retinoid setara 0.3 persen retinol",
    mekanisme: "Satu langkah dari asam retinoat sehingga bekerja lebih cepat",
    inkompatibel: "Amina primer, cahaya, oksidator",
  }),
  bahan("retinyl_palmitate", "Retinyl Palmitate", "Retinyl Palmitate", "B", "Retinoid lembut", 0.5, 1450000, {
    golongan: "Retinoid",
    cas: "79-81-2",
    rumus: "C36H60O2",
    bm: 524.86,
    kelarutan: "Larut minyak",
    dosis: [0.1, 1],
    mekanisme: "Ester retinol yang dihidrolisis esterase kulit, iritasi minimal",
    catatanHalal: "Cek sumber asam palmitat nabati",
  }),
  bahan("hpr", "Hydroxypinacolone Retinoate", "Hydroxypinacolone Retinoate", "B", "Retinoid ester aktif langsung", 0.5, 7600000, {
    golongan: "Retinoid",
    cas: "893412-73-2",
    rumus: "C26H38O3",
    bm: 398.58,
    kelarutan: "Larut minyak",
    dosis: [0.1, 1],
    mekanisme: "Berikatan langsung dengan reseptor asam retinoat tanpa konversi",
  }),
  bahan("bakuchiol", "Bakuchiol", "Bakuchiol", "B", "Alternatif retinoid nabati", 1, 3900000, {
    golongan: "Aktif anti penuaan",
    cas: "10309-37-2",
    rumus: "C18H24O",
    bm: 256.38,
    kelarutan: "Larut minyak",
    dosis: [0.5, 2],
    mekanisme: "Memodulasi ekspresi gen mirip retinoid dengan iritasi rendah",
  }),
  bahan("peptide_matrixyl", "Peptida Matrixyl 3000", "Palmitoyl Tripeptide-1", "C", "Peptida sinyal kolagen", 3, 4800000, {
    golongan: "Peptida",
    cas: "147732-56-7",
    rumus: "C39H73N7O6",
    bm: 760.05,
    phKerja: [5, 7],
    dosis: [1, 5],
    mekanisme: "Memicu sintesis kolagen tipe I dan fibronektin",
    inkompatibel: "Surfaktan anionik kuat dan pH ekstrem merusak rantai peptida",
    suhuTambah: "Tambahkan di bawah 40 C",
  }),
  bahan("argireline", "Peptida Relaksasi Otot", "Acetyl Hexapeptide-8", "C", "Mengurangi garis halus ekspresi", 5, 5200000, {
    golongan: "Peptida",
    cas: "616204-22-9",
    rumus: "C34H60N14O12S",
    bm: 888.99,
    dosis: [2, 10],
    mekanisme: "Menghambat kompleks SNARE sehingga kontraksi otot mikro menurun",
  }),
  bahan("copper_peptide", "Peptida Tembaga", "Copper Tripeptide-1", "C", "Regenerasi dan penyembuhan", 1, 6800000, {
    golongan: "Peptida",
    cas: "89030-95-5",
    rumus: "C14H24CuN6O4",
    bm: 403.93,
    phKerja: [5.5, 7],
    dosis: [0.1, 2],
    mekanisme: "Mendukung remodeling matriks dermal dan angiogenesis",
    inkompatibel: "Vitamin C dan asam kuat menghilangkan kompleks tembaga",
  }),

  // Eksfolian dan aktif acne
  bahan("salicylic", "Asam Salisilat", "Salicylic Acid", "B", "Eksfoliasi dalam pori", 1.5, 410000, {
    golongan: "Beta hidroksi asam",
    cas: "69-72-7",
    rumus: "C7H6O3",
    bm: 138.12,
    kelarutan: "Sedikit larut air, larut dalam glikol",
    phKerja: [3, 4],
    dosis: [0.5, 2],
    bpom: "dibatasi",
    batasBpom: "Maksimal 2 persen untuk leave on",
    catatanHalal: "Sintetis, bebas turunan hewani",
    mekanisme: "Lipofilik, melarutkan sumbatan keratin dalam folikel",
    inkompatibel: "Ion besi memberi warna ungu, retinol menambah iritasi",
  }),
  bahan("aha", "Asam Glikolat", "Glycolic Acid", "C", "Eksfoliasi permukaan", 4, 180000, {
    golongan: "Alfa hidroksi asam",
    cas: "79-14-1",
    rumus: "C2H4O3",
    bm: 76.05,
    phKerja: [3.5, 4.5],
    dosis: [2, 10],
    bpom: "dibatasi",
    batasBpom: "Maksimal 10 persen dengan pH minimal 3.5",
    mekanisme: "Melemahkan ikatan korneodesmosom sehingga sel mati terlepas",
    inkompatibel: "Basa kuat menetralkan gugus aktif, retinoid meningkatkan iritasi",
  }),
  bahan("lactic", "Asam Laktat Fermentasi", "Lactic Acid", "C", "Eksfoliasi lembut dan pelembap", 5, 96000, {
    golongan: "Alfa hidroksi asam",
    cas: "50-21-5",
    rumus: "C3H6O3",
    bm: 90.08,
    phKerja: [3.5, 4.5],
    dosis: [1, 10],
    catatanHalal: "Pastikan media fermentasi bebas bahan haram",
    halal: "syubhat",
    mekanisme: "Eksfolian sekaligus komponen natural moisturizing factor",
  }),
  bahan("mandelic", "Asam Mandelat", "Mandelic Acid", "C", "Eksfoliasi molekul besar", 5, 720000, {
    golongan: "Alfa hidroksi asam",
    cas: "90-64-2",
    rumus: "C8H8O3",
    bm: 152.15,
    phKerja: [3.5, 4.5],
    dosis: [2, 10],
    mekanisme: "Penetrasi lambat karena bobot molekul besar sehingga ramah kulit sensitif",
  }),
  bahan("pha", "Gluconolactone", "Gluconolactone", "C", "Poli hidroksi asam", 4, 380000, {
    golongan: "Poli hidroksi asam",
    cas: "90-80-2",
    rumus: "C6H10O6",
    bm: 178.14,
    phKerja: [3.5, 5],
    dosis: [1, 10],
    mekanisme: "Eksfoliasi lembut dengan efek humektan dan antioksidan",
  }),
  bahan("azelaic", "Asam Azelaat", "Azelaic Acid", "C", "Anti acne dan meratakan warna", 10, 460000, {
    golongan: "Aktif acne",
    cas: "123-99-9",
    rumus: "C9H16O4",
    bm: 188.22,
    kelarutan: "Sulit larut, perlu dispersi atau derivat",
    phKerja: [4, 5],
    dosis: [5, 10],
    mekanisme: "Antibakteri terhadap C acnes dan menghambat tirosinase",
    inkompatibel: "Rekristalisasi pada suhu rendah bila pelarut tidak cukup",
  }),
  bahan("benzoyl", "Benzoyl Peroxide Hidrat", "Benzoyl Peroxide", "C", "Antibakteri acne", 2.5, 320000, {
    golongan: "Aktif acne",
    cas: "94-36-0",
    rumus: "C14H10O4",
    bm: 242.23,
    phKerja: [3, 6],
    dosis: [2.5, 5],
    bpom: "dibatasi",
    batasBpom: "Terbatas untuk kategori obat, verifikasi regulasi sebelum dipakai",
    mekanisme: "Melepas radikal bebas oksigen yang membunuh C acnes",
    inkompatibel: "Retinoid dan vitamin C teroksidasi, memutihkan kain",
    penyimpanan: "Jauhkan dari panas dan logam, risiko dekomposisi eksotermik",
  }),
  bahan("zinc", "Zinc PCA", "Zinc PCA", "A", "Pengendali minyak", 1, 620000, {
    golongan: "Aktif sebum",
    cas: "15454-75-8",
    rumus: "C10H12N2O6Zn",
    bm: 321.6,
    phKerja: [4.5, 6.5],
    dosis: [0.2, 1],
    mekanisme: "Menghambat 5 alfa reduktase sehingga produksi sebum turun",
    inkompatibel: "Menurunkan viskositas gel karbomer karena beban elektrolit",
  }),
  bahan("tea_tree", "Minyak Pohon Teh", "Melaleuca Alternifolia Leaf Oil", "B", "Antibakteri alami", 0.5, 640000, {
    golongan: "Minyak esensial",
    cas: "68647-73-4",
    rumus: "Campuran terpen",
    bm: 154.25,
    kelarutan: "Larut minyak",
    dosis: [0.1, 1],
    mekanisme: "Terpinen 4 ol merusak membran sel bakteri",
    inkompatibel: "Teroksidasi menjadi alergen, butuh antioksidan dan kemasan gelap",
    spesifikasi: "Terpinen 4 ol minimal 35 persen, 1,8 sineol maksimal 5 persen",
  }),

  // Pelembap, sawar kulit, dan soothing
  bahan("hyaluronic", "Natrium Hialuronat Bobot Sedang", "Sodium Hyaluronate", "C", "Pelembap pengikat air", 0.5, 2100000, {
    golongan: "Pelembap polimer",
    cas: "9067-32-7",
    rumus: "(C14H20NNaO11)n",
    bm: 1000000,
    phKerja: [5, 7],
    dosis: [0.05, 1],
    halal: "syubhat",
    catatanHalal: "Pastikan hasil fermentasi Streptococcus, bukan ekstrak jengger ayam",
    mekanisme: "Mengikat air sampai seribu kali bobotnya di permukaan kulit",
    inkompatibel: "Elektrolit tinggi dan pH ekstrem menurunkan viskositas",
  }),
  bahan("ha_low", "Hialuronat Bobot Rendah", "Hydrolyzed Sodium Hyaluronate", "C", "Pelembap lapis dalam", 0.3, 2650000, {
    golongan: "Pelembap polimer",
    cas: "9067-32-7",
    rumus: "(C14H20NNaO11)n",
    bm: 50000,
    dosis: [0.05, 0.5],
    mekanisme: "Fragmen kecil menembus lebih dalam untuk hidrasi berlapis",
  }),
  bahan("panthenol", "D Panthenol", "Panthenol", "C", "Soothing dan penguat sawar", 2, 380000, {
    golongan: "Provitamin",
    cas: "81-13-0",
    rumus: "C9H19NO4",
    bm: 205.25,
    phKerja: [4, 7],
    dosis: [0.5, 5],
    mekanisme: "Provitamin B5 yang dikonversi menjadi asam pantotenat, mempercepat perbaikan sawar",
    inkompatibel: "Terhidrolisis pada pH di bawah 4 atau di atas 8",
  }),
  bahan("allantoin", "Allantoin", "Allantoin", "C", "Anti iritasi", 0.3, 290000, {
    golongan: "Soothing",
    cas: "97-59-6",
    rumus: "C4H6N4O3",
    bm: 158.12,
    phKerja: [4, 8],
    dosis: [0.1, 0.5],
    kelarutan: "Larut air terbatas, maksimal 0.5 persen pada suhu ruang",
    mekanisme: "Keratolitik ringan dan memicu proliferasi sel",
    inkompatibel: "Rekristalisasi bila kadar melebihi kelarutan",
  }),
  bahan("centella", "Ekstrak Centella Terstandar", "Centella Asiatica Extract", "C", "Menenangkan dan memperbaiki", 2, 520000, {
    golongan: "Ekstrak botani",
    cas: "84696-21-9",
    rumus: "Campuran triterpen",
    bm: 488.7,
    dosis: [0.5, 5],
    mekanisme: "Asiaticoside dan madecassoside memicu sintesis kolagen dan meredakan inflamasi",
    spesifikasi: "Total triterpen minimal 10 persen dalam ekstrak",
  }),
  bahan("madecassoside", "Madecassoside Murni", "Madecassoside", "C", "Anti inflamasi terarah", 0.2, 8900000, {
    golongan: "Aktif botani murni",
    cas: "34540-22-2",
    rumus: "C48H78O20",
    bm: 975.13,
    dosis: [0.05, 0.5],
    mekanisme: "Menurunkan sitokin inflamasi dan memperkuat sawar",
  }),
  bahan("ceramide_np", "Ceramide NP", "Ceramide NP", "B", "Lipid sawar kulit", 0.5, 12500000, {
    golongan: "Lipid sawar",
    cas: "100403-19-8",
    rumus: "C34H67NO4",
    bm: 553.9,
    kelarutan: "Larut minyak, butuh pemanasan dan ko emulsifier",
    dosis: [0.05, 1],
    suhuTambah: "Larutkan pada fase minyak 75 C",
    mekanisme: "Mengisi kembali lipid interselular stratum korneum",
    inkompatibel: "Rekristalisasi bila didinginkan terlalu cepat",
    catatanHalal: "Cek sumber sfingosin, hindari turunan hewani",
    halal: "syubhat",
  }),
  bahan("cholesterol", "Kolesterol Nabati", "Cholesterol", "B", "Lipid pendamping ceramide", 0.3, 4500000, {
    golongan: "Lipid sawar",
    cas: "57-88-5",
    rumus: "C27H46O",
    bm: 386.65,
    kelarutan: "Larut minyak",
    dosis: [0.1, 1],
    mekanisme: "Bagian rasio sawar 3 banding 1 banding 1 bersama ceramide dan asam lemak",
    catatanHalal: "Wajib kolesterol nabati atau wol tersertifikasi",
    halal: "syubhat",
  }),
  bahan("madu_ekstrak", "Ekstrak Madu Terfermentasi", "Honey Extract", "C", "Humektan dan antioksidan alami", 1, 780000, {
    golongan: "Ekstrak botani",
    cas: "8028-66-8",
    rumus: "Campuran gula",
    bm: 342.3,
    dosis: [0.5, 3],
    mekanisme: "Gula alami dan flavonoid yang menahan air dan meredakan iritasi",
  }),
  bahan("kolagen", "Kolagen Laut Terhidrolisis", "Hydrolyzed Collagen", "C", "Pelembap protein", 1, 1650000, {
    golongan: "Protein",
    cas: "9007-34-5",
    rumus: "Polipeptida",
    bm: 3000,
    dosis: [0.5, 3],
    halal: "syubhat",
    catatanHalal: "Sumber hewani, wajib sertifikat halal pemasok dan surat asal bahan",
    mekanisme: "Membentuk film pelembap dan memasok asam amino permukaan",
    inkompatibel: "Bau amis bila pH di atas 7 atau terkontaminasi mikroba",
  }),

  // Emolien, oklusif, dan minyak
  bahan("squalane", "Skualan Tebu", "Squalane", "B", "Emolien ringan", 3, 340000, {
    golongan: "Emolien",
    cas: "111-01-3",
    rumus: "C30H62",
    bm: 422.81,
    kelarutan: "Larut minyak",
    dosis: [1, 20],
    catatanHalal: "Bersumber dari tebu, bukan hati ikan hiu",
    mekanisme: "Mirip lipid sebum manusia sehingga cepat menyerap",
    spesifikasi: "Bilangan peroksida maksimal 2 meq per kg",
  }),
  bahan("jojoba", "Minyak Jojoba", "Simmondsia Chinensis Seed Oil", "B", "Emolien ester alami", 2, 290000, {
    golongan: "Emolien",
    cas: "61789-91-1",
    rumus: "Ester rantai panjang",
    bm: 600,
    kelarutan: "Larut minyak",
    dosis: [1, 10],
    mekanisme: "Wax ester cair yang stabil oksidasi dan membentuk film napas",
  }),
  bahan("caprylic", "Caprylic Capric Triglyceride", "Caprylic/Capric Triglyceride", "B", "Emolien pembawa aktif", 5, 78000, {
    golongan: "Emolien",
    cas: "73398-61-5",
    rumus: "C21H40O5",
    bm: 372.5,
    kelarutan: "Larut minyak",
    dosis: [2, 20],
    mekanisme: "Pembawa aktif lipofilik dengan sensori ringan",
    catatanHalal: "Pastikan gliserol dan asam lemak dari kelapa sawit atau kelapa",
  }),
  bahan("shea", "Shea Butter Terrefinasi", "Butyrospermum Parkii Butter", "B", "Oklusif dan nutrisi", 5, 165000, {
    golongan: "Butter nabati",
    cas: "91080-23-8",
    rumus: "Trigliserida",
    bm: 850,
    kelarutan: "Larut minyak",
    dosis: [1, 15],
    suhuTambah: "Lelehkan pada 70 sampai 75 C",
    mekanisme: "Menahan penguapan air dan memasok asam lemak tak jenuh",
    inkompatibel: "Rekristalisasi berpasir bila pendinginan tidak terkontrol",
  }),
  bahan("dimethicone", "Dimethicone 350 cSt", "Dimethicone", "B", "Emolien silikon", 3, 128000, {
    golongan: "Silikon",
    cas: "63148-62-9",
    rumus: "(C2H6OSi)n",
    bm: 14000,
    kelarutan: "Larut silikon dan sebagian minyak",
    dosis: [1, 10],
    mekanisme: "Membentuk film bernapas yang menurunkan TEWL dan memberi slip",
  }),
  bahan("cyclopenta", "Cyclopentasiloxane", "Cyclopentasiloxane", "B", "Silikon volatil", 4, 175000, {
    golongan: "Silikon",
    cas: "541-02-6",
    rumus: "C10H30O5Si5",
    bm: 370.77,
    kelarutan: "Larut silikon",
    dosis: [2, 15],
    mekanisme: "Memberi sensori kering saat aplikasi lalu menguap",
    inkompatibel: "Menguap pada proses panas terbuka, tambahkan saat dingin",
  }),
  bahan("isopropyl", "Isopropyl Myristate", "Isopropyl Myristate", "B", "Emolien penyebar", 2, 92000, {
    golongan: "Ester emolien",
    cas: "110-27-0",
    rumus: "C17H34O2",
    bm: 270.45,
    kelarutan: "Larut minyak",
    dosis: [1, 8],
    mekanisme: "Menurunkan rasa berat dan meningkatkan daya sebar",
    inkompatibel: "Berpotensi komedogenik pada kulit berminyak",
  }),
  bahan("petrolatum", "Petrolatum Putih", "Petrolatum", "B", "Oklusif kuat", 5, 46000, {
    golongan: "Oklusif",
    cas: "8009-03-8",
    rumus: "Hidrokarbon",
    bm: 500,
    kelarutan: "Larut minyak",
    dosis: [1, 20],
    mekanisme: "Menurunkan TEWL sampai 98 persen dengan film hidrofobik",
  }),

  // Emulsifier, pengental, dan surfaktan
  bahan("cetearyl", "Cetearyl Alcohol", "Cetearyl Alcohol", "B", "Pengental dan ko emulsifier", 3, 54000, {
    golongan: "Alkohol lemak",
    cas: "67762-27-0",
    rumus: "C16H34O dan C18H38O",
    bm: 256.5,
    kelarutan: "Larut minyak",
    dosis: [1, 6],
    suhuTambah: "Fase minyak 75 C",
    mekanisme: "Membentuk kristal cair lamelar yang menstabilkan emulsi",
  }),
  bahan("gms", "Gliseril Monostearat SE", "Glyceryl Stearate SE", "B", "Emulsifier minyak dalam air", 2.5, 76000, {
    golongan: "Emulsifier",
    cas: "31566-31-1",
    rumus: "C21H42O4",
    bm: 358.56,
    kelarutan: "Larut minyak",
    dosis: [1, 5],
    halal: "syubhat",
    catatanHalal: "Perlu verifikasi sumber lemak, dapat berasal dari hewani",
    suhuTambah: "Fase minyak 75 C",
    mekanisme: "HLB sekitar 5.8, dipasangkan dengan emulsifier HLB tinggi",
  }),
  bahan("ceteareth", "Ceteareth 20", "Ceteareth-20", "B", "Emulsifier HLB tinggi", 1.5, 98000, {
    golongan: "Emulsifier",
    cas: "68439-49-6",
    rumus: "C18H38O(C2H4O)n",
    bm: 1100,
    dosis: [0.5, 3],
    mekanisme: "HLB sekitar 15.5, pasangan sistem emulsi minyak dalam air",
    inkompatibel: "Bahan anionik kuat dapat mengganggu keseimbangan HLB",
  }),
  bahan("polysorbate", "Polysorbate 80", "Polysorbate 80", "D", "Pelarut parfum dan minyak", 1, 86000, {
    golongan: "Surfaktan nonionik",
    cas: "9005-65-6",
    rumus: "C64H124O26",
    bm: 1310,
    dosis: [0.5, 3],
    mekanisme: "Melarutkan minyak esensial dalam sistem berair bening",
    catatanHalal: "Pastikan asam oleat nabati",
    halal: "syubhat",
  }),
  bahan("cocamidopropyl", "Cocamidopropyl Betaine", "Cocamidopropyl Betaine", "A", "Surfaktan amfoterik lembut", 8, 58000, {
    golongan: "Surfaktan",
    cas: "61789-40-0",
    rumus: "C19H38N2O3",
    bm: 342.52,
    phKerja: [4.5, 6.5],
    dosis: [3, 15],
    mekanisme: "Menurunkan iritasi surfaktan anionik dan menambah busa krim",
    spesifikasi: "Amidoamine bebas maksimal 50 ppm",
  }),
  bahan("sci", "Sodium Cocoyl Isethionate", "Sodium Cocoyl Isethionate", "A", "Surfaktan pembersih lembut", 10, 165000, {
    golongan: "Surfaktan",
    cas: "61789-32-0",
    rumus: "C14H27NaO5S",
    bm: 330.4,
    phKerja: [5, 6.5],
    dosis: [5, 20],
    mekanisme: "Busa halus dengan iritasi sangat rendah, cocok pembersih pH kulit",
  }),
  bahan("decyl", "Decyl Glucoside", "Decyl Glucoside", "A", "Surfaktan nonionik nabati", 6, 74000, {
    golongan: "Surfaktan",
    cas: "68515-73-1",
    rumus: "C16H32O6",
    bm: 320.42,
    phKerja: [4, 7],
    dosis: [3, 15],
    mekanisme: "Pembersih lembut dari glukosa dan alkohol lemak kelapa",
  }),
  bahan("xanthan", "Xanthan Gum Transparan", "Xanthan Gum", "D", "Penstabil dan pengental", 0.4, 210000, {
    golongan: "Polimer alami",
    cas: "11138-66-2",
    rumus: "(C35H49O29)n",
    bm: 2000000,
    phKerja: [3, 11],
    dosis: [0.1, 1],
    mekanisme: "Memberi perilaku pseudoplastis dan mencegah pengendapan partikel",
    inkompatibel: "Gumpal bila didispersi tanpa pra campur glikol",
  }),
  bahan("carbomer", "Karbomer 940", "Carbomer", "D", "Pengental gel bening", 0.3, 320000, {
    golongan: "Polimer sintetis",
    cas: "9003-01-4",
    rumus: "(C3H4O2)n",
    bm: 1000000,
    phKerja: [5, 7],
    dosis: [0.1, 1],
    mekanisme: "Mengembang setelah dinetralkan sehingga membentuk gel jernih",
    inkompatibel: "Elektrolit dan kation menurunkan viskositas secara tajam",
  }),
  bahan("sepimax", "Polimer Toleran Elektrolit", "Polyacrylate Crosspolymer-6", "D", "Pengental toleran garam", 1, 640000, {
    golongan: "Polimer sintetis",
    cas: "1443167-76-9",
    rumus: "(C3H4O2)n",
    bm: 800000,
    phKerja: [3, 9],
    dosis: [0.3, 2],
    mekanisme: "Gel stabil pada kehadiran aktif ionik seperti niacinamide dan zinc",
  }),
  bahan("hec", "Hydroxyethylcellulose", "Hydroxyethylcellulose", "D", "Pengental selulosa", 0.8, 285000, {
    golongan: "Polimer alami",
    cas: "9004-62-0",
    rumus: "(C2H6O2)n",
    bm: 250000,
    phKerja: [3, 11],
    dosis: [0.2, 1.5],
    mekanisme: "Pengental non ionik dengan aliran halus untuk gel dan serum",
  }),
  bahan("clay", "Kaolin Halus", "Kaolin", "B", "Penyerap minyak", 6, 42000, {
    golongan: "Mineral",
    cas: "1332-58-7",
    rumus: "Al2Si2O5(OH)4",
    bm: 258.16,
    kelarutan: "Tidak larut, terdispersi",
    dosis: [2, 20],
    mekanisme: "Menyerap sebum dan kotoran pada permukaan kulit",
    spesifikasi: "Ukuran partikel D50 maksimal 10 mikron, logam berat sesuai batas BPOM",
  }),

  // Filter UV
  bahan("niacin_sunscreen", "Filter UVB Organik", "Ethylhexyl Methoxycinnamate", "B", "Perlindungan UVB", 7, 420000, {
    golongan: "Filter UV organik",
    cas: "5466-77-3",
    rumus: "C18H26O3",
    bm: 290.4,
    kelarutan: "Larut minyak",
    dosis: [2, 10],
    bpom: "dibatasi",
    batasBpom: "Maksimal 10 persen",
    mekanisme: "Menyerap radiasi UVB puncak 310 nm",
    inkompatibel: "Fotodegradasi bersama avobenzone tanpa fotostabilizer",
  }),
  bahan("avobenzone", "Avobenzone", "Butyl Methoxydibenzoylmethane", "B", "Perlindungan UVA", 3, 890000, {
    golongan: "Filter UV organik",
    cas: "70356-09-1",
    rumus: "C20H22O3",
    bm: 310.4,
    kelarutan: "Larut minyak",
    dosis: [1, 5],
    bpom: "dibatasi",
    batasBpom: "Maksimal 5 persen",
    mekanisme: "Menyerap UVA panjang dengan puncak 357 nm",
    inkompatibel: "Terdegradasi cahaya, butuh octocrylene atau Tinosorb sebagai penstabil",
  }),
  bahan("tinosorb_s", "Filter UV Spektrum Luas", "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine", "B", "Perlindungan UVA dan UVB", 3, 4200000, {
    golongan: "Filter UV organik",
    cas: "187393-00-6",
    rumus: "C38H49N3O5",
    bm: 627.8,
    kelarutan: "Larut minyak, butuh pelarut khusus",
    dosis: [1, 10],
    bpom: "dibatasi",
    batasBpom: "Maksimal 10 persen",
    mekanisme: "Fotostabil dan menstabilkan avobenzone",
  }),
  bahan("zinc_oxide", "Zinc Oxide Terlapis", "Zinc Oxide", "B", "Perlindungan UV fisik", 10, 145000, {
    golongan: "Filter UV mineral",
    cas: "1314-13-2",
    rumus: "ZnO",
    bm: 81.38,
    kelarutan: "Tidak larut, terdispersi",
    dosis: [5, 25],
    bpom: "dibatasi",
    batasBpom: "Maksimal 25 persen",
    mekanisme: "Memantulkan dan menyerap UVA serta UVB",
    inkompatibel: "Bereaksi dengan asam bebas dan dapat memicu whitecast",
    spesifikasi: "Ukuran partikel dan tingkat dispersi dipantau untuk kontrol whitecast",
  }),
  bahan("titanium", "Titanium Dioxide Terlapis", "Titanium Dioxide", "B", "Perlindungan UVB fisik", 6, 185000, {
    golongan: "Filter UV mineral",
    cas: "13463-67-7",
    rumus: "TiO2",
    bm: 79.87,
    kelarutan: "Tidak larut, terdispersi",
    dosis: [2, 25],
    bpom: "dibatasi",
    batasBpom: "Maksimal 25 persen",
    mekanisme: "Menghamburkan sinar UVB, dilapis untuk menekan aktivitas fotokatalitik",
  }),

  // Pengawet, antioksidan, kelator, dan penyesuai pH
  bahan("phenoxy", "Fenoksietanol", "Phenoxyethanol", "D", "Pengawet spektrum luas", 0.9, 120000, {
    golongan: "Pengawet",
    cas: "122-99-6",
    rumus: "C8H10O2",
    bm: 138.16,
    phKerja: [3, 8],
    dosis: [0.3, 1],
    bpom: "dibatasi",
    batasBpom: "Maksimal 1 persen",
    mekanisme: "Merusak membran sel mikroba, kuat terhadap gram negatif",
    inkompatibel: "Diserap polimer nonionik dan kemasan tertentu sehingga efikasi turun",
    spesifikasi: "Wajib lolos uji tantangan mikroba ISO 11930",
  }),
  bahan("ehg", "Ethylhexylglycerin", "Ethylhexylglycerin", "D", "Booster pengawet", 0.3, 320000, {
    golongan: "Pengawet",
    cas: "70445-33-9",
    rumus: "C11H24O3",
    bm: 204.31,
    dosis: [0.1, 1],
    mekanisme: "Menurunkan tegangan antarmuka membran mikroba dan menekan bau badan",
  }),
  bahan("sodium_benzoate", "Natrium Benzoat", "Sodium Benzoate", "D", "Pengawet sistem asam", 0.5, 48000, {
    golongan: "Pengawet",
    cas: "532-32-1",
    rumus: "C7H5NaO2",
    bm: 144.11,
    phKerja: [3, 5],
    dosis: [0.2, 0.5],
    bpom: "dibatasi",
    batasBpom: "Maksimal 0.5 persen sebagai asam",
    mekanisme: "Aktif dalam bentuk asam bebas sehingga butuh pH di bawah 5",
    inkompatibel: "Bersama vitamin C dapat membentuk benzena jejak",
  }),
  bahan("potassium_sorbate", "Kalium Sorbat", "Potassium Sorbate", "D", "Pengawet antijamur", 0.3, 62000, {
    golongan: "Pengawet",
    cas: "24634-61-5",
    rumus: "C6H7KO2",
    bm: 150.22,
    phKerja: [3, 5.5],
    dosis: [0.1, 0.6],
    bpom: "dibatasi",
    batasBpom: "Maksimal 0.6 persen sebagai asam",
    mekanisme: "Menghambat kapang dan khamir pada sistem asam",
  }),
  bahan("edta", "Disodium EDTA", "Disodium EDTA", "D", "Kelator logam", 0.1, 68000, {
    golongan: "Kelator",
    cas: "139-33-3",
    rumus: "C10H14N2Na2O8",
    bm: 336.21,
    phKerja: [4, 9],
    dosis: [0.05, 0.2],
    mekanisme: "Mengikat ion logam yang memicu oksidasi dan perubahan warna",
  }),
  bahan("tocopherol", "Tokoferol Campuran", "Tocopherol", "B", "Antioksidan minyak", 0.3, 980000, {
    golongan: "Antioksidan",
    cas: "10191-41-0",
    rumus: "C29H50O2",
    bm: 430.71,
    kelarutan: "Larut minyak",
    dosis: [0.05, 0.5],
    mekanisme: "Memutus rantai radikal bebas pada fase lipid",
    inkompatibel: "Menggelap bila kontak logam dan cahaya",
  }),
  bahan("ferulic", "Asam Ferulat", "Ferulic Acid", "C", "Antioksidan penstabil vitamin C", 0.5, 2450000, {
    golongan: "Antioksidan",
    cas: "1135-24-6",
    rumus: "C10H10O4",
    bm: 194.18,
    phKerja: [3, 5],
    dosis: [0.1, 1],
    mekanisme: "Memperpanjang umur simpan vitamin C dan vitamin E",
  }),
  bahan("tea", "Trietanolamin", "Triethanolamine", "D", "Penyeimbang pH", 0.2, 95000, {
    golongan: "Penyesuai pH",
    cas: "102-71-6",
    rumus: "C6H15NO3",
    bm: 149.19,
    phKerja: [7, 10],
    dosis: [0.05, 0.5],
    mekanisme: "Menetralkan karbomer dan menaikkan pH sistem",
    inkompatibel: "Berpotensi membentuk nitrosamin bila bersama donor nitrit",
  }),
  bahan("naoh", "Larutan Natrium Hidroksida 10 Persen", "Sodium Hydroxide", "D", "Penyesuai pH basa", 0.2, 38000, {
    golongan: "Penyesuai pH",
    cas: "1310-73-2",
    rumus: "NaOH",
    bm: 40,
    phKerja: [7, 13],
    dosis: [0.01, 0.5],
    mekanisme: "Menaikkan pH secara cepat, gunakan bertahap sambil diaduk",
    penyimpanan: "Bahan korosif, gunakan pelindung mata dan sarung tangan",
  }),
  bahan("citric", "Larutan Asam Sitrat 20 Persen", "Citric Acid", "D", "Penyesuai pH asam", 0.2, 42000, {
    golongan: "Penyesuai pH",
    cas: "77-92-9",
    rumus: "C6H8O7",
    bm: 192.12,
    phKerja: [2, 6],
    dosis: [0.01, 0.5],
    mekanisme: "Menurunkan pH dan sekaligus bertindak sebagai kelator lemah",
  }),
  bahan("parfum", "Parfum Bebas Alkohol", "Parfum", "D", "Pewangi", 0.3, 780000, {
    golongan: "Pewangi",
    cas: "-",
    rumus: "Campuran",
    bm: 250,
    kelarutan: "Larut minyak",
    dosis: [0.05, 1],
    halal: "syubhat",
    catatanHalal: "Cek pelarut etanol dan bahan turunan hewani pada dokumen pemasok",
    mekanisme: "Memberi identitas aroma produk",
    inkompatibel: "Dapat menurunkan kejernihan gel, perlu solubilizer",
    spesifikasi: "Deklarasi 26 alergen parfum sesuai regulasi",
  }),
];


export const CLASH_RULES: { a: string; b: string; tingkat: "tinggi" | "sedang"; alasan: string }[] = [
  { a: "vitc", b: "niacinamide", tingkat: "sedang", alasan: "Pada pH rendah dapat membentuk niacin yang memicu kemerahan, pisahkan fase atau jaga pH di atas 5" },
  { a: "retinol", b: "aha", tingkat: "tinggi", alasan: "Kombinasi eksfolian kuat meningkatkan risiko iritasi dan merusak stabilitas retinol" },
  { a: "retinol", b: "salicylic", tingkat: "tinggi", alasan: "Beban eksfoliasi berlebih untuk produk leave on harian" },
  { a: "carbomer", b: "zinc", tingkat: "sedang", alasan: "Elektrolit tinggi menurunkan viskositas gel karbomer" },
  { a: "vitc", b: "kojic", tingkat: "sedang", alasan: "Dua bahan rentan oksidasi, warna produk cepat menguning" },
  { a: "aha", b: "tea", tingkat: "sedang", alasan: "Netralisasi berlebih membuat pH keluar dari jendela kerja asam" },
  { a: "laa", b: "niacinamide", tingkat: "tinggi", alasan: "Asam askorbat bebas dan niacinamide pada pH di bawah 4 membentuk kompleks kuning dan asam nikotinat pemicu flushing" },
  { a: "laa", b: "copper_peptide", tingkat: "tinggi", alasan: "Vitamin C mereduksi kompleks tembaga sehingga peptida kehilangan aktivitas" },
  { a: "laa", b: "edta", tingkat: "sedang", alasan: "Kelator dibutuhkan, namun rasio harus dihitung agar tidak mengganggu kestabilan warna" },
  { a: "arbutin", b: "aha", tingkat: "tinggi", alasan: "pH asam menghidrolisis arbutin menjadi hidrokuinon yang dilarang" },
  { a: "benzoyl", b: "retinol", tingkat: "tinggi", alasan: "Peroksida mengoksidasi retinol sehingga potensi hilang dalam hitungan jam" },
  { a: "benzoyl", b: "laa", tingkat: "tinggi", alasan: "Oksidasi silang membuat warna berubah dan kedua aktif terdegradasi" },
  { a: "retinal", b: "aha", tingkat: "tinggi", alasan: "Gugus aldehid tidak stabil pada pH rendah dan beban iritasi bertambah" },
  { a: "peptide_matrixyl", b: "aha", tingkat: "sedang", alasan: "pH rendah memutus rantai peptida sehingga klaim anti penuaan tidak tercapai" },
  { a: "carbomer", b: "sci", tingkat: "sedang", alasan: "Surfaktan anionik dan elektrolit menurunkan viskositas gel karbomer secara tajam" },
  { a: "carbomer", b: "niacinamide_hp", tingkat: "sedang", alasan: "Kadar aktif tinggi menambah beban ionik, gunakan polimer toleran elektrolit" },
  { a: "avobenzone", b: "zinc_oxide", tingkat: "tinggi", alasan: "Zinc oxide mempercepat fotodegradasi avobenzone, butuh pelapis atau filter pengganti" },
  { a: "avobenzone", b: "niacin_sunscreen", tingkat: "sedang", alasan: "Pasangan ini cepat kehilangan SPF tanpa fotostabilizer seperti Tinosorb S" },
  { a: "sodium_benzoate", b: "laa", tingkat: "sedang", alasan: "Kombinasi berpotensi membentuk benzena jejak, hindari atau ganti pengawet" },
  { a: "urea", b: "naoh", tingkat: "sedang", alasan: "pH tinggi menghidrolisis urea menjadi amonia sehingga aroma berubah" },
  { a: "map", b: "zinc", tingkat: "sedang", alasan: "Ion divalen mengendapkan turunan askorbil fosfat" },
  { a: "kolagen", b: "aha", tingkat: "sedang", alasan: "Hidrolisis lanjutan protein pada pH rendah menimbulkan bau dan kekeruhan" },
  { a: "tea_tree", b: "carbomer", tingkat: "sedang", alasan: "Minyak esensial tanpa solubilizer membuat gel keruh dan berpisah" },
];


const jam = (h: number) => new Date(Date.UTC(2026, 8, 17, h, 0)).toISOString();

function bahanDari(ids: string[], ubah: Record<string, number> = {}): Ingredient[] {
  return ids.map((id) => {
    const src = BAHAN_LIBRARY.find((b) => b.id === id)!;
    return { ...src, percent: ubah[id] ?? src.percent };
  });
}

export const TARGET_PRESET: TargetParam[] = [
  { id: "ph", label: "pH", unit: "", target: 5.4, toleransi: 0.4, sensor: "ph" },
  { id: "viskositas", label: "Viskositas", unit: "cP", target: 6500, toleransi: 800, sensor: "viskositas" },
  { id: "ukuran_droplet", label: "Ukuran Droplet", unit: "µm", target: 3, toleransi: 1, sensor: "ukuran_droplet" },
  { id: "turbiditas", label: "Turbiditas", unit: "NTU", target: 12, toleransi: 6, sensor: "turbiditas" },
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "prj-kahf-oil",
    judul: "Kahf Oil Control Face Wash, Optimasi Sistem Pembersih",
    peneliti: "Dina Aprilia",
    tim: "Tim Grooming",
    kategori: "Perawatan Wajah Pria",
    status: "Sedang Berjalan",
    update: jam(7),
    brief: "Studi simulasi pengembangan pembersih wajah pada kategori publik Kahf untuk kulit berminyak pria aktif. Formula dan hasil uji pada aplikasi bukan data produk komersial.",
    targets: TARGET_PRESET,
    batches: [
      {
        nomor: 1,
        status: "dievaluasi",
        dibuat: jam(2),
        tujuan: ["Menilai daya kontrol minyak", "Menguji kestabilan awal emulsi"],
        hipotesis: "Kombinasi zinc PCA dan kaolin menurunkan kilap tanpa membuat kulit kering.",
        prosedur: ["Larutkan fase A pada 75 C", "Lelehkan fase B pada 75 C", "Homogenisasi 3200 rpm selama 8 menit", "Dinginkan ke 40 C lalu tambahkan fase C dan D"],
        bahan: bahanDari(["aqua", "glycerin", "niacinamide", "zinc", "clay", "cetearyl", "gms", "xanthan", "phenoxy"]),
        hasil: [
          { paramId: "ph", nilai: 5.9, sumber: "sensor" },
          { paramId: "viskositas", nilai: 5200, sumber: "sensor" },
          { paramId: "ukuran_droplet", nilai: 4.6, sumber: "sensor" },
          { paramId: "turbiditas", nilai: 21, sumber: "sensor" },
        ],
        observasi: "Tekstur agak encer, sedikit pemisahan di permukaan setelah 24 jam pada 45 C.",
        feedback: "Perlu penguat sistem emulsi dan penyesuaian pH.",
        evaluasi: {
          ringkasan: "Batch 1 mencapai kontrol minyak yang baik namun kestabilan emulsi belum memenuhi target.",
          kekurangan: ["pH 0.5 unit di atas target", "Viskositas di bawah batas bawah", "Droplet terlalu besar sehingga rentan koalesensi"],
          rekomendasi: ["Naikkan cetearyl alcohol menjadi 4 persen", "Tambahkan fase asam untuk menurunkan pH", "Perpanjang homogenisasi menjadi 10 menit"],
          perubahanFormula: [
            { bahan: "Cetearyl Alcohol", dari: 3, ke: 4, alasan: "Menaikkan viskositas ke jendela target" },
            { bahan: "Xanthan Gum", dari: 0.4, ke: 0.6, alasan: "Menstabilkan fase air" },
          ],
          rancanganBerikutnya: {
            tujuan: ["Menstabilkan emulsi pada 45 C selama 14 hari", "Mengunci pH pada 5.4"],
            fokusUji: ["Viskositas", "Ukuran droplet", "pH", "Sentrifugasi"],
            hipotesis: "Penambahan pengental dan penurunan pH akan memperkecil droplet di bawah 3.5 um.",
          },
          skorKesesuaian: 68,
        },
      },
      {
        nomor: 2,
        status: "berjalan",
        dibuat: jam(6),
        tujuan: ["Menstabilkan emulsi pada 45 C selama 14 hari", "Mengunci pH pada 5.4"],
        hipotesis: "Penambahan pengental dan penurunan pH akan memperkecil droplet di bawah 3.5 um.",
        prosedur: ["Ulangi prosedur batch 1 dengan cetearyl 4 persen", "Homogenisasi 3400 rpm selama 10 menit", "Uji sentrifugasi 3000 rpm 30 menit"],
        bahan: bahanDari(["aqua", "glycerin", "niacinamide", "zinc", "clay", "cetearyl", "gms", "xanthan", "phenoxy"], { cetearyl: 4, xanthan: 0.6 }),
        hasil: [
          { paramId: "ph", nilai: 5.5, sumber: "sensor" },
          { paramId: "viskositas", nilai: 6300, sumber: "sensor" },
          { paramId: "ukuran_droplet", nilai: null, sumber: "sensor" },
          { paramId: "turbiditas", nilai: null, sumber: "sensor" },
        ],
        observasi: "",
        feedback: "",
      },
    ],
  },
  {
    id: "prj-serum-cerah",
    judul: "Wardah Brightening Serum, Optimasi Niacinamide Ringan",
    peneliti: "Raka Wijaya",
    tim: "Tim Skin Care",
    kategori: "Serum Wajah",
    status: "Menunggu Tinjauan",
    update: jam(5),
    brief: "Studi simulasi kategori serum pencerah Wardah dengan fokus sensori ringan, tidak lengket, dan kompatibilitas niacinamide. Formula bukan formula produk komersial.",
    targets: TARGET_PRESET,
    batches: [
      {
        nomor: 1,
        status: "dievaluasi",
        dibuat: jam(1),
        tujuan: ["Menguji kenyamanan sensori", "Memastikan kejernihan larutan"],
        hipotesis: "Kadar niacinamide 4 persen cukup untuk klaim cerah tanpa rasa lengket.",
        prosedur: ["Larutkan bahan aktif ke fase air", "Aduk 600 rpm selama 15 menit", "Sesuaikan pH ke 5.5"],
        bahan: bahanDari(["aqua", "niacinamide", "butylene", "hyaluronic", "panthenol", "allantoin", "phenoxy"]),
        hasil: [
          { paramId: "ph", nilai: 5.3, sumber: "sensor" },
          { paramId: "viskositas", nilai: 2100, sumber: "sensor" },
          { paramId: "ukuran_droplet", nilai: 1.2, sumber: "sensor" },
          { paramId: "turbiditas", nilai: 6, sumber: "sensor" },
        ],
        observasi: "Larutan jernih, terasa ringan, sedikit lengket pada menit pertama.",
        feedback: "Kurangi humektan gliserin, tambahkan silikon alternatif nabati.",
        evaluasi: {
          ringkasan: "Formula memenuhi kejernihan dan pH target, isu tersisa hanya sensori lengket.",
          kekurangan: ["Sensasi lengket 40 detik pertama", "Belum ada uji stabilitas cahaya"],
          rekomendasi: ["Turunkan butylene glycol ke 2 persen", "Tambahkan uji paparan cahaya 7 hari"],
          perubahanFormula: [{ bahan: "Butylene Glycol", dari: 3, ke: 2, alasan: "Mengurangi rasa lengket" }],
          rancanganBerikutnya: {
            tujuan: ["Menghilangkan sensasi lengket", "Memastikan warna stabil setelah paparan cahaya"],
            fokusUji: ["Sensori panel", "Warna", "pH"],
            hipotesis: "Penurunan humektan memperbaiki sensori tanpa menurunkan hidrasi.",
          },
          skorKesesuaian: 84,
        },
      },
    ],
  },
  {
    id: "prj-sunscreen",
    judul: "Wardah UV Shield, Studi Sunscreen Hybrid Tanpa Whitecast",
    peneliti: "Nadia Puspita",
    tim: "Tim Sun Care",
    kategori: "Perlindungan Matahari",
    status: "Sedang Berjalan",
    update: jam(4),
    brief: "Studi simulasi kategori perlindungan matahari Wardah untuk iklim tropis dengan tekstur ringan dan target residu putih rendah.",
    targets: TARGET_PRESET,
    batches: [
      {
        nomor: 1,
        status: "selesai",
        dibuat: jam(3),
        tujuan: ["Menguji dispersi zinc oxide", "Menilai whitecast"],
        hipotesis: "Zinc oxide terdispersi halus menurunkan whitecast pada kulit sawo matang.",
        prosedur: ["Dispersikan zinc oxide ke fase minyak", "Giling 3 siklus", "Emulsifikasi pada 70 C"],
        bahan: bahanDari(["aqua", "zinc_oxide", "niacin_sunscreen", "squalane", "cetearyl", "gms", "xanthan", "phenoxy"]),
        hasil: [
          { paramId: "ph", nilai: 6.1, sumber: "sensor" },
          { paramId: "viskositas", nilai: 7800, sumber: "sensor" },
          { paramId: "ukuran_droplet", nilai: 3.9, sumber: "sensor" },
          { paramId: "turbiditas", nilai: 28, sumber: "sensor" },
        ],
        observasi: "Whitecast masih terlihat pada kulit gelap, tekstur cukup berat.",
        feedback: "Perlu penurunan zinc oxide dan penambahan filter organik.",
      },
    ],
  },
  {
    id: "prj-toner",
    judul: "Emina Exfoliating Toner, Optimasi Asam Kadar Rendah",
    peneliti: "Farhan Maulana",
    tim: "Tim Skin Care",
    kategori: "Toner",
    status: "Selesai",
    update: jam(3),
    brief: "Studi simulasi kategori toner Emina dengan asam glikolat kadar rendah untuk kulit kombinasi. Keamanan klaim tetap memerlukan pengujian terkontrol.",
    targets: TARGET_PRESET,
    batches: [
      {
        nomor: 1,
        status: "dievaluasi",
        dibuat: jam(1),
        tujuan: ["Menentukan kadar asam glikolat aman"],
        hipotesis: "Asam glikolat 4 persen pada pH 3.8 memberi eksfoliasi tanpa iritasi berat.",
        prosedur: ["Campur fase air", "Sesuaikan pH", "Saring 5 mikron"],
        bahan: bahanDari(["aqua", "aha", "panthenol", "centella", "phenoxy"]),
        hasil: [
          { paramId: "ph", nilai: 3.8, sumber: "sensor" },
          { paramId: "viskositas", nilai: 900, sumber: "sensor" },
          { paramId: "ukuran_droplet", nilai: 1, sumber: "sensor" },
          { paramId: "turbiditas", nilai: 4, sumber: "sensor" },
        ],
        observasi: "Tidak ada endapan, aroma netral.",
        feedback: "Siap diteruskan ke uji klinis internal.",
        evaluasi: {
          ringkasan: "Formula memenuhi seluruh parameter target dan siap diserahkan.",
          kekurangan: ["Belum ada uji pemakaian 28 hari"],
          rekomendasi: ["Jadwalkan uji pemakaian konsumen"],
          perubahanFormula: [],
          rancanganBerikutnya: { tujuan: ["Uji pemakaian 28 hari"], fokusUji: ["Iritasi", "pH"], hipotesis: "Formula stabil sepanjang uji pemakaian." },
          skorKesesuaian: 93,
        },
      },
    ],
    dikirimKe: "Divisi Quality Control",
  },
  {
    id: "prj-body",
    judul: "Wardah Lightening Body Lotion, Studi Hidrasi 24 Jam",
    peneliti: "Intan Rahmawati",
    tim: "Tim Body Care",
    kategori: "Perawatan Tubuh",
    status: "Draft",
    update: jam(2),
    brief: "Studi simulasi kategori body lotion Wardah dengan target hidrasi 24 jam dan profil sensori yang sesuai untuk iklim tropis.",
    targets: TARGET_PRESET,
    batches: [],
  },
];

export function lengkapiBahan(b: Ingredient): Ingredient {
  const ref = BAHAN_LIBRARY.find((x) => x.id === b.id);
  const dasar = bahan(b.id, b.name, b.inci, b.phase, b.fungsi, b.percent, b.hargaPerKg);
  return { ...dasar, ...(ref ?? {}), ...b, percent: b.percent, phKerja: b.phKerja ?? ref?.phKerja ?? dasar.phKerja, dosis: b.dosis ?? ref?.dosis ?? dasar.dosis };
}

export function hitungHpp(bahanList: Ingredient[]) {

  const bahanCost = bahanList.reduce((t, b) => t + (b.percent / 100) * (b.hargaPerKg / 1000), 0);
  const kemasan = 3200;
  const produksi = 1450;
  const total = bahanCost * 50 + kemasan + produksi;
  return {
    perGram: bahanCost,
    per50ml: bahanCost * 50,
    kemasan,
    produksi,
    total,
  };
}

export function formatRupiah(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}
