import {
  BAHAN_LIBRARY,
  type Batch,
  type Checkpoint,
  type Ingredient,
  type Project,
  type TargetParam,
} from "./data";

export type ParamGrup =
  | "Fisikokimia"
  | "Tekstur dan Sensori"
  | "Stabilitas"
  | "Efikasi Klinis"
  | "Mikrobiologi dan Keamanan"
  | "Kemasan dan Aplikasi";

export type ParamDef = {
  id: string;
  label: string;
  unit: string;
  grup: ParamGrup;
  metode: string;
  target: number;
  toleransi: number;
  sensor: string;
};

const p = (
  id: string,
  label: string,
  unit: string,
  grup: ParamGrup,
  metode: string,
  target: number,
  toleransi: number,
  sensor = "manual",
): ParamDef => ({ id, label, unit, grup, metode, target, toleransi, sensor });

export const PARAM_LIBRARY: ParamDef[] = [
  // Fisikokimia
  p("ph", "pH", "", "Fisikokimia", "pH meter terkalibrasi 25 C", 5.4, 0.4, "ph"),
  p(
    "viskositas",
    "Viskositas",
    "cP",
    "Fisikokimia",
    "Viskometer rotasi spindle 4, 20 rpm",
    6500,
    800,
    "viskositas",
  ),
  p("densitas", "Densitas", "g/ml", "Fisikokimia", "Piknometer 25 C", 1.02, 0.03),
  p(
    "konduktivitas",
    "Konduktivitas",
    "uS/cm",
    "Fisikokimia",
    "Konduktometer",
    780,
    150,
    "konduktivitas",
  ),
  p("kadar_air", "Kadar Air", "%", "Fisikokimia", "Moisture analyzer halogen", 68, 4),
  p(
    "aktivitas_air",
    "Aktivitas Air",
    "aw",
    "Fisikokimia",
    "Water activity meter",
    0.82,
    0.05,
    "aktivitas_air",
  ),
  p("total_solid", "Total Padatan", "%", "Fisikokimia", "Gravimetri oven 105 C", 22, 3),
  p(
    "turbiditas",
    "Turbiditas",
    "NTU",
    "Fisikokimia",
    "Turbidimeter nefelometrik",
    12,
    6,
    "turbiditas",
  ),
  p("indeks_bias", "Indeks Bias", "nD", "Fisikokimia", "Refraktometer Abbe", 1.36, 0.02),
  p(
    "ukuran_droplet",
    "Ukuran Droplet",
    "um",
    "Fisikokimia",
    "Mikroskop optik dan analisis citra",
    3,
    1,
    "ukuran_droplet",
  ),
  p("ukuran_partikel", "Ukuran Partikel D50", "um", "Fisikokimia", "Laser diffraction", 8, 3),
  p(
    "span_distribusi",
    "Span Distribusi Partikel",
    "",
    "Fisikokimia",
    "Laser diffraction D10 D50 D90",
    1.4,
    0.4,
  ),
  p("zeta", "Potensial Zeta", "mV", "Fisikokimia", "Zetasizer", -32, 8),
  p("kadar_aktif", "Kadar Bahan Aktif", "%", "Fisikokimia", "HPLC fase terbalik", 4, 0.4),
  p("kadar_etanol", "Kadar Etanol", "%", "Fisikokimia", "Kromatografi gas headspace", 0, 0.5),
  p("sisa_pelarut", "Sisa Pelarut", "ppm", "Fisikokimia", "Kromatografi gas", 20, 20),
  p("warna_l", "Warna L", "", "Fisikokimia", "Kolorimeter CIELAB", 88, 3),
  p("warna_b", "Warna b", "", "Fisikokimia", "Kolorimeter CIELAB", 6, 2),
  p("titik_leleh", "Titik Leleh", "C", "Fisikokimia", "Melting point apparatus", 52, 3),

  // Tekstur dan sensori
  p("daya_sebar", "Daya Sebar", "mm", "Tekstur dan Sensori", "Uji plat kaca beban 125 g", 48, 6),
  p(
    "firmness",
    "Kekerasan Tekstur",
    "g",
    "Tekstur dan Sensori",
    "Texture analyzer probe 10 mm",
    120,
    25,
  ),
  p(
    "kohesivitas",
    "Kohesivitas",
    "",
    "Tekstur dan Sensori",
    "Texture analyzer dua siklus",
    0.72,
    0.1,
  ),
  p(
    "yield_stress",
    "Yield Stress",
    "Pa",
    "Tekstur dan Sensori",
    "Rheometer amplitude sweep",
    18,
    5,
  ),
  p(
    "tiksotropi",
    "Indeks Tiksotropi",
    "",
    "Tekstur dan Sensori",
    "Rheometer loop naik turun",
    1.8,
    0.4,
  ),
  p("kelengketan", "Kelengketan", "g", "Tekstur dan Sensori", "Texture analyzer tack test", 35, 10),
  p(
    "drag_force",
    "Gaya Gesek Aplikasi",
    "N",
    "Tekstur dan Sensori",
    "Friction tester kulit sintetis",
    0.42,
    0.1,
  ),
  p("waktu_serap", "Waktu Serap", "detik", "Tekstur dan Sensori", "Panel sensori terlatih", 40, 12),
  p(
    "after_feel_lembap",
    "After Feel Lembap",
    "skor",
    "Tekstur dan Sensori",
    "Panel sensori skala 1 sampai 9",
    7.5,
    1,
  ),
  p(
    "after_feel_berminyak",
    "After Feel Berminyak",
    "skor",
    "Tekstur dan Sensori",
    "Panel sensori skala 1 sampai 9",
    3,
    1,
  ),
  p(
    "whitecast",
    "Whitecast",
    "delta L",
    "Tekstur dan Sensori",
    "Kolorimeter pada kulit sintetis",
    2,
    1.5,
  ),
  p("gloss", "Kilap Film", "GU", "Tekstur dan Sensori", "Glossmeter 60 derajat", 12, 5),
  p(
    "film_residu",
    "Residu Film",
    "mg/cm2",
    "Tekstur dan Sensori",
    "Gravimetri kulit sintetis",
    0.6,
    0.2,
  ),
  p("foam_volume", "Volume Busa", "ml", "Tekstur dan Sensori", "Ross Miles 40 C", 180, 30),
  p("foam_stability", "Stabilitas Busa 5 Menit", "%", "Tekstur dan Sensori", "Ross Miles", 82, 8),
  p(
    "aroma_intensitas",
    "Intensitas Aroma",
    "skor",
    "Tekstur dan Sensori",
    "Panel sensori skala 1 sampai 9",
    5,
    1.5,
  ),
  p(
    "kelembutan_sensori",
    "Kelembutan Sentuh",
    "skor",
    "Tekstur dan Sensori",
    "Panel sensori skala 1 sampai 9",
    7.8,
    1,
  ),

  // Stabilitas
  p(
    "sentrifugasi",
    "Uji Sentrifugasi",
    "%",
    "Stabilitas",
    "3000 rpm 30 menit, persen fase terpisah",
    0,
    1,
  ),
  p(
    "siklus_beku",
    "Siklus Beku Cair",
    "siklus lolos",
    "Stabilitas",
    "Tiga siklus minus 5 C sampai 40 C",
    3,
    0,
  ),
  p(
    "stabilitas_45",
    "Stabilitas 45 C 28 Hari",
    "skor",
    "Stabilitas",
    "Oven 45 C, penilaian visual 0 sampai 100",
    92,
    6,
  ),
  p(
    "delta_ph_28",
    "Perubahan pH 28 Hari",
    "unit",
    "Stabilitas",
    "pH meter T0 dibanding T28",
    0.2,
    0.2,
  ),
  p(
    "delta_viskositas_28",
    "Perubahan Viskositas 28 Hari",
    "%",
    "Stabilitas",
    "Viskometer T0 dibanding T28",
    8,
    7,
  ),
  p("pemisahan_fase", "Pemisahan Fase", "%", "Stabilitas", "Pengamatan visual tabung uji", 0, 1),
  p("sineresis", "Sineresis Gel", "%", "Stabilitas", "Gravimetri cairan keluar", 1, 1),
  p(
    "stabilitas_warna",
    "Stabilitas Warna",
    "delta E",
    "Stabilitas",
    "Kolorimeter T0 dibanding T28",
    1.5,
    1,
  ),
  p("fotostabilitas", "Fotostabilitas", "%", "Stabilitas", "Paparan lampu xenon 7 hari", 95, 5),
  p("peroksida", "Bilangan Peroksida", "meq/kg", "Stabilitas", "Titrasi iodometri", 4, 3),

  // Efikasi
  p("tewl", "TEWL", "g/m2h", "Efikasi Klinis", "Tewameter setelah 4 jam", 9, 3),
  p(
    "hidrasi",
    "Hidrasi Kulit",
    "AU",
    "Efikasi Klinis",
    "Corneometer 2 jam setelah aplikasi",
    62,
    8,
  ),
  p("sebum", "Kadar Sebum", "ug/cm2", "Efikasi Klinis", "Sebumeter setelah 4 jam", 90, 20),
  p("eritema", "Indeks Eritema", "AU", "Efikasi Klinis", "Mexameter", 280, 40),
  p("melanin", "Indeks Melanin", "AU", "Efikasi Klinis", "Mexameter 28 hari", 320, 40),
  p("elastisitas", "Elastisitas Kulit", "R2", "Efikasi Klinis", "Cutometer", 0.78, 0.08),
  p("kekasaran", "Kekasaran Kulit", "um", "Efikasi Klinis", "Visioscan Ra", 24, 5),
  p("pori", "Tampilan Pori", "%", "Efikasi Klinis", "Analisis citra kulit 28 hari", 18, 6),
  p("spf_invitro", "SPF In Vitro", "SPF", "Efikasi Klinis", "ISO 24443 transmitansi UV", 40, 6),
  p("uva_pf", "UVA PF", "PF", "Efikasi Klinis", "ISO 24443", 14, 3),
  p(
    "panjang_kritis",
    "Panjang Gelombang Kritis",
    "nm",
    "Efikasi Klinis",
    "Spektrofotometri UV",
    380,
    5,
  ),
  p("tahan_air", "Ketahanan Air", "%", "Efikasi Klinis", "Uji rendam 40 menit", 80, 8),
  p(
    "anti_polusi",
    "Perlindungan Anti Polusi",
    "%",
    "Efikasi Klinis",
    "Uji adhesi partikel karbon",
    72,
    8,
  ),

  // Mikrobiologi dan keamanan
  p("tpc", "Total Plate Count", "cfu/g", "Mikrobiologi dan Keamanan", "Kultur agar 48 jam", 50, 50),
  p(
    "kapang",
    "Kapang dan Khamir",
    "cfu/g",
    "Mikrobiologi dan Keamanan",
    "Kultur agar Sabouraud",
    10,
    10,
  ),
  p(
    "pet",
    "Uji Tantang Pengawet",
    "log reduksi",
    "Mikrobiologi dan Keamanan",
    "ISO 11930 hari ke 28",
    3,
    0.5,
  ),
  p(
    "patch_test",
    "Skor Iritasi Patch Test",
    "skor",
    "Mikrobiologi dan Keamanan",
    "Patch test 48 jam 30 subjek",
    0.2,
    0.3,
  ),
  p(
    "logam_berat",
    "Cemaran Logam Berat",
    "ppm",
    "Mikrobiologi dan Keamanan",
    "ICP MS timbal dan merkuri",
    1,
    1,
  ),

  // Kemasan dan aplikasi
  p(
    "daya_keluar",
    "Daya Keluar Kemasan",
    "g/tekan",
    "Kemasan dan Aplikasi",
    "Uji pompa sepuluh kali tekan",
    0.35,
    0.08,
  ),
  p("torsi_tutup", "Torsi Buka Tutup", "Ncm", "Kemasan dan Aplikasi", "Torque meter", 90, 20),
  p(
    "kompatibilitas_kemasan",
    "Kompatibilitas Kemasan",
    "%",
    "Kemasan dan Aplikasi",
    "Penyimpanan 40 C 12 minggu",
    98,
    2,
  ),
  p("kebocoran", "Uji Kebocoran", "%", "Kemasan dan Aplikasi", "Vakum 0.5 bar 15 menit", 0, 0),
  p(
    "fungsi_aplikator",
    "Fungsi Aplikator",
    "%",
    "Kemasan dan Aplikasi",
    "Uji pompa, spray, dan dropper 50 aktuasi",
    100,
    2,
  ),
  p(
    "susut_bobot",
    "Susut Bobot Kemasan",
    "%",
    "Kemasan dan Aplikasi",
    "Gravimetri 45 C 28 hari",
    0.5,
    0.5,
  ),

  // Fisik dasar tambahan
  p(
    "penampilan",
    "Homogenitas Visual",
    "skor",
    "Fisikokimia",
    "Pengamatan visual skala 0 sampai 10",
    10,
    1,
  ),
  p(
    "kejernihan",
    "Kejernihan",
    "skor",
    "Fisikokimia",
    "Pengamatan visual berlatar hitam putih",
    9,
    1,
  ),
  p("warna_a", "Warna a", "", "Fisikokimia", "Kolorimeter CIELAB", 1.5, 1),
  p(
    "delta_e_batch",
    "Delta E Antar Batch",
    "delta E",
    "Fisikokimia",
    "Spektrofotometer pantul",
    1,
    1,
  ),
  p(
    "bau_organoleptik",
    "Skor Bau Organoleptik",
    "skor",
    "Tekstur dan Sensori",
    "Panel organoleptik skala 1 sampai 9",
    7,
    1.5,
  ),
  p(
    "rheogram_n",
    "Indeks Aliran n Rheogram",
    "",
    "Tekstur dan Sensori",
    "Rheometer kurva alir 0.1 sampai 100 per detik",
    0.35,
    0.15,
  ),
  p(
    "histeresis",
    "Luas Histeresis Tiksotropi",
    "Pa/s",
    "Tekstur dan Sensori",
    "Rheometer loop naik turun",
    950,
    250,
  ),
  p(
    "pemulihan_viskositas",
    "Pemulihan Viskositas Setelah Shear",
    "%",
    "Tekstur dan Sensori",
    "Rheometer three interval thixotropy",
    88,
    8,
  ),
  p(
    "spreadability",
    "Spreadability",
    "cm2",
    "Tekstur dan Sensori",
    "Parallel plate 1 gram beban 500 g",
    18,
    4,
  ),
  p("adhesi_film", "Adhesi Film", "N", "Tekstur dan Sensori", "Peel test film kering", 0.8, 0.25),
  p(
    "panel_internal",
    "Skor Panel Sensori Internal",
    "skor",
    "Tekstur dan Sensori",
    "Panel internal 10 panelis terlatih",
    7.5,
    1,
  ),

  // Mikrostruktur
  p("d10", "Ukuran Partikel D10", "um", "Fisikokimia", "Laser diffraction", 2, 1),
  p("d90", "Ukuran Partikel D90", "um", "Fisikokimia", "Laser diffraction", 18, 5),
  p(
    "polidispersitas",
    "Indeks Polidispersitas",
    "PDI",
    "Fisikokimia",
    "Dynamic light scattering",
    0.25,
    0.1,
  ),
  p(
    "mikroskopi",
    "Skor Struktur Mikroskopis",
    "skor",
    "Fisikokimia",
    "Mikroskop optik perbesaran 400 kali",
    9,
    1,
  ),

  // Stabilitas tambahan
  p(
    "suhu_bertahap",
    "Suhu Bertahap Sampai Pemisahan",
    "C",
    "Stabilitas",
    "Kenaikan 5 C per tahap",
    55,
    5,
  ),
  p("stabilitas_4", "Stabilitas 4 C 28 Hari", "skor", "Stabilitas", "Lemari pendingin 4 C", 94, 5),
  p(
    "stabilitas_minus10",
    "Stabilitas Minus 10 C 28 Hari",
    "skor",
    "Stabilitas",
    "Freezer minus 10 C",
    90,
    6,
  ),
  p(
    "accelerated_40",
    "Accelerated Aging 40 C 12 Minggu",
    "skor",
    "Stabilitas",
    "Climatic chamber 40 C RH 75",
    90,
    6,
  ),
  p(
    "real_time_6",
    "Real Time 6 Bulan",
    "skor",
    "Stabilitas",
    "Penyimpanan suhu ruang terkendali",
    90,
    6,
  ),
  p("oksidasi_anisidin", "Bilangan Anisidin", "AnV", "Stabilitas", "Spektrofotometri 350 nm", 3, 2),
  p(
    "uji_getaran",
    "Uji Getaran Transportasi",
    "skor",
    "Stabilitas",
    "Vibration table 3 jam ASTM D999",
    95,
    5,
  ),
  p(
    "evaporasi",
    "Kehilangan Bobot Evaporasi",
    "%",
    "Stabilitas",
    "Gravimetri kemasan tersegel",
    0.4,
    0.4,
  ),

  // Kimia dan mikrobiologi tambahan
  p(
    "assay_aktif",
    "Assay Kadar Aktif Terverifikasi",
    "% target",
    "Fisikokimia",
    "HPLC dibanding kadar teoretis",
    98,
    3,
  ),
  p(
    "kemurnian_coa",
    "Kesesuaian CoA Bahan Masuk",
    "%",
    "Fisikokimia",
    "Verifikasi incoming QC",
    100,
    0,
  ),
  p(
    "tpc_awal",
    "Total Plate Count Skrining Awal",
    "cfu/g",
    "Mikrobiologi dan Keamanan",
    "Skrining internal 48 jam",
    100,
    100,
  ),

  // Scale up
  p(
    "keseragaman_campur",
    "Keseragaman Pencampuran",
    "% RSD",
    "Fisikokimia",
    "Sampling tiga titik reaktor",
    2,
    2,
  ),
  p(
    "konsistensi_scaleup",
    "Konsistensi Parameter Saat Scale Up",
    "%",
    "Fisikokimia",
    "Perbandingan skala lab dan pilot",
    97,
    3,
  ),
];

export const PARAM_GRUP: ParamGrup[] = [
  "Fisikokimia",
  "Tekstur dan Sensori",
  "Stabilitas",
  "Efikasi Klinis",
  "Mikrobiologi dan Keamanan",
  "Kemasan dan Aplikasi",
];

export function paramKeTarget(def: ParamDef): TargetParam {
  return {
    id: def.id,
    label: def.label,
    unit: def.unit,
    target: def.target,
    toleransi: def.toleransi,
    sensor: def.sensor,
  };
}

export function targetDariId(ids: string[]): TargetParam[] {
  return ids
    .map((id) => PARAM_LIBRARY.find((x) => x.id === id))
    .filter((x): x is ParamDef => Boolean(x))
    .map(paramKeTarget);
}

export type KategoriDef = {
  nama: string;
  bentuk: string;
  resep: string[];
  params: string[];
};

const k = (nama: string, bentuk: string, resep: string[], params: string[]): KategoriDef => ({
  nama,
  bentuk,
  resep,
  params,
});

const DASAR_EMULSI = ["aqua", "glycerin", "cetearyl", "gms", "squalane", "xanthan", "phenoxy"];
const DASAR_GEL = ["aqua", "glycerin", "carbomer", "tea", "panthenol", "phenoxy"];
const DASAR_LARUTAN = ["aqua", "butylene", "panthenol", "phenoxy"];
const DASAR_PEMBERSIH = ["aqua", "glycerin", "clay", "xanthan", "phenoxy"];

export const KATEGORI_PRODUK: KategoriDef[] = [
  k(
    "Face Wash Pria",
    "Pembersih",
    [...DASAR_PEMBERSIH, "zinc", "niacinamide"],
    ["ph", "viskositas", "foam_volume", "foam_stability", "sebum", "tpc"],
  ),
  k(
    "Facial Wash Gel",
    "Pembersih",
    [...DASAR_GEL, "centella"],
    ["ph", "viskositas", "foam_volume", "foam_stability", "patch_test"],
  ),
  k(
    "Micellar Water",
    "Pembersih",
    ["aqua", "butylene", "panthenol", "allantoin", "phenoxy"],
    ["ph", "turbiditas", "konduktivitas", "waktu_serap", "tpc"],
  ),
  k(
    "Cleansing Balm",
    "Pembersih",
    ["jojoba", "squalane", "cetearyl", "gms", "parfum"],
    ["titik_leleh", "firmness", "daya_sebar", "film_residu", "peroksida"],
  ),
  k(
    "Cleansing Oil",
    "Pembersih",
    ["jojoba", "squalane", "gms", "parfum"],
    ["densitas", "indeks_bias", "waktu_serap", "peroksida"],
  ),
  k(
    "Toner Hidrasi",
    "Toner",
    [...DASAR_LARUTAN, "hyaluronic", "centella"],
    ["ph", "turbiditas", "hidrasi", "tewl", "tpc"],
  ),
  k(
    "Toner Eksfoliasi",
    "Toner",
    ["aqua", "aha", "panthenol", "centella", "phenoxy"],
    ["ph", "kadar_aktif", "eritema", "patch_test", "kekasaran"],
  ),
  k(
    "Essence Ringan",
    "Essence",
    [...DASAR_LARUTAN, "hyaluronic", "niacinamide"],
    ["ph", "viskositas", "waktu_serap", "hidrasi", "kelengketan"],
  ),
  k(
    "Serum Pencerah",
    "Serum",
    ["aqua", "niacinamide", "vitc", "butylene", "hyaluronic", "panthenol", "phenoxy"],
    ["ph", "kadar_aktif", "melanin", "warna_b", "stabilitas_warna", "kelengketan"],
  ),
  k(
    "Serum Anti Penuaan",
    "Serum",
    ["aqua", "retinol", "squalane", "panthenol", "allantoin", "xanthan", "phenoxy"],
    ["ph", "kadar_aktif", "elastisitas", "kekasaran", "fotostabilitas", "patch_test"],
  ),
  k(
    "Serum Acne",
    "Serum",
    ["aqua", "salicylic", "zinc", "centella", "panthenol", "phenoxy"],
    ["ph", "kadar_aktif", "sebum", "eritema", "pori"],
  ),
  k(
    "Ampoule Intensif",
    "Serum",
    ["aqua", "niacinamide", "hyaluronic", "kolagen", "butylene", "phenoxy"],
    ["ph", "viskositas", "hidrasi", "tewl", "tpc"],
  ),
  k(
    "Pelembap Gel",
    "Pelembap",
    [...DASAR_GEL, "hyaluronic", "allantoin"],
    ["ph", "viskositas", "yield_stress", "hidrasi", "waktu_serap", "sineresis"],
  ),
  k(
    "Pelembap Krim",
    "Pelembap",
    [...DASAR_EMULSI, "niacinamide", "allantoin"],
    ["ph", "viskositas", "ukuran_droplet", "daya_sebar", "tewl", "sentrifugasi"],
  ),
  k(
    "Sleeping Mask",
    "Masker",
    [...DASAR_EMULSI, "panthenol", "centella"],
    ["viskositas", "firmness", "film_residu", "hidrasi", "stabilitas_45"],
  ),
  k(
    "Clay Mask",
    "Masker",
    ["aqua", "clay", "glycerin", "centella", "allantoin", "xanthan", "phenoxy"],
    ["ph", "viskositas", "kadar_air", "ukuran_partikel", "sebum", "sineresis"],
  ),
  k(
    "Peel Off Mask",
    "Masker",
    ["aqua", "glycerin", "carbomer", "panthenol", "phenoxy"],
    ["viskositas", "waktu_serap", "film_residu", "kelengketan"],
  ),
  k(
    "Sheet Mask Essence",
    "Masker",
    [...DASAR_LARUTAN, "hyaluronic", "niacinamide", "centella"],
    ["ph", "viskositas", "hidrasi", "tpc", "pet"],
  ),
  k(
    "Sunscreen Krim SPF",
    "Tabir Surya",
    ["aqua", "zinc_oxide", "niacin_sunscreen", "squalane", "cetearyl", "gms", "xanthan", "phenoxy"],
    ["spf_invitro", "uva_pf", "panjang_kritis", "whitecast", "ukuran_partikel", "tahan_air"],
  ),
  k(
    "Sunscreen Gel Ringan",
    "Tabir Surya",
    ["aqua", "niacin_sunscreen", "butylene", "carbomer", "tea", "phenoxy"],
    ["spf_invitro", "uva_pf", "kelengketan", "waktu_serap", "ph"],
  ),
  k(
    "Sunscreen Stick",
    "Tabir Surya",
    ["squalane", "cetearyl", "zinc_oxide", "jojoba", "parfum"],
    ["titik_leleh", "firmness", "spf_invitro", "film_residu", "gloss"],
  ),
  k(
    "Eye Cream",
    "Perawatan Mata",
    [...DASAR_EMULSI, "kolagen", "allantoin"],
    ["ph", "viskositas", "ukuran_droplet", "elastisitas", "patch_test"],
  ),
  k(
    "Lip Balm",
    "Perawatan Bibir",
    ["squalane", "jojoba", "cetearyl", "parfum"],
    ["titik_leleh", "firmness", "gloss", "film_residu", "peroksida"],
  ),
  k(
    "Lip Serum",
    "Perawatan Bibir",
    ["squalane", "jojoba", "hyaluronic", "panthenol"],
    ["viskositas", "gloss", "hidrasi", "kelengketan"],
  ),
  k(
    "Body Lotion",
    "Perawatan Tubuh",
    [...DASAR_EMULSI, "parfum", "allantoin"],
    ["ph", "viskositas", "daya_sebar", "tewl", "aroma_intensitas", "sentrifugasi"],
  ),
  k(
    "Body Butter",
    "Perawatan Tubuh",
    ["squalane", "jojoba", "cetearyl", "gms", "glycerin", "parfum"],
    ["firmness", "titik_leleh", "daya_sebar", "after_feel_berminyak"],
  ),
  k(
    "Body Scrub",
    "Perawatan Tubuh",
    ["aqua", "clay", "glycerin", "squalane", "xanthan", "parfum", "phenoxy"],
    ["viskositas", "ukuran_partikel", "kekasaran", "sineresis"],
  ),
  k(
    "Body Wash",
    "Perawatan Tubuh",
    ["aqua", "glycerin", "xanthan", "parfum", "phenoxy"],
    ["ph", "viskositas", "foam_volume", "foam_stability", "tpc"],
  ),
  k(
    "Hand Cream",
    "Perawatan Tangan",
    [...DASAR_EMULSI, "allantoin"],
    ["viskositas", "daya_sebar", "waktu_serap", "tewl", "kompatibilitas_kemasan"],
  ),
  k(
    "Deodoran Roll On",
    "Perawatan Tubuh",
    ["aqua", "glycerin", "zinc", "xanthan", "parfum", "phenoxy"],
    ["ph", "viskositas", "daya_keluar", "aroma_intensitas", "tpc"],
  ),
  k(
    "Face Mist",
    "Perawatan Wajah",
    ["aqua", "butylene", "panthenol", "centella", "phenoxy"],
    ["ph", "turbiditas", "daya_keluar", "hidrasi", "tpc"],
  ),
  k(
    "Acne Spot Gel",
    "Perawatan Wajah",
    ["aqua", "salicylic", "tea_tree", "carbomer", "tea", "phenoxy"],
    ["ph", "kadar_aktif", "viskositas", "eritema", "patch_test"],
  ),
  k(
    "Hair Serum",
    "Perawatan Rambut",
    ["squalane", "jojoba", "panthenol", "parfum"],
    ["densitas", "indeks_bias", "gloss", "kelengketan"],
  ),
  k(
    "Shampoo Lembut",
    "Perawatan Rambut",
    ["aqua", "glycerin", "panthenol", "xanthan", "parfum", "phenoxy"],
    ["ph", "viskositas", "foam_volume", "foam_stability", "tpc"],
  ),
  k(
    "Conditioner",
    "Perawatan Rambut",
    [...DASAR_EMULSI, "parfum"],
    ["ph", "viskositas", "daya_sebar", "drag_force", "sentrifugasi"],
  ),
  k(
    "Facial Wash Foam Lembut",
    "Pembersih",
    [...DASAR_GEL, "panthenol", "allantoin"],
    ["ph", "foam_volume", "foam_stability", "viskositas", "tpc_awal"],
  ),
  k(
    "Facial Wash Bubuk Enzim",
    "Pembersih",
    ["clay", "glycerin", "panthenol", "phenoxy"],
    ["kadar_air", "ukuran_partikel", "foam_volume", "ph"],
  ),
  k(
    "Cleansing Water Hydrating",
    "Pembersih",
    ["aqua", "butylene", "hyaluronic", "panthenol", "phenoxy"],
    ["ph", "turbiditas", "hidrasi", "tpc_awal"],
  ),
  k(
    "Makeup Remover Dua Fase",
    "Pembersih",
    ["aqua", "squalane", "jojoba", "butylene", "phenoxy"],
    ["densitas", "indeks_bias", "pemisahan_fase", "waktu_serap"],
  ),
  k(
    "Scrub Wajah Lembut",
    "Pembersih",
    ["aqua", "clay", "glycerin", "xanthan", "phenoxy"],
    ["viskositas", "ukuran_partikel", "kekasaran", "sineresis"],
  ),
  k(
    "Toner Menenangkan",
    "Toner",
    [...DASAR_LARUTAN, "centella", "allantoin"],
    ["ph", "turbiditas", "eritema", "patch_test"],
  ),
  k(
    "Toner Pencerah",
    "Toner",
    ["aqua", "niacinamide", "butylene", "panthenol", "phenoxy"],
    ["ph", "kadar_aktif", "melanin", "stabilitas_warna"],
  ),
  k(
    "Serum Hidrasi Multi Molekul",
    "Serum",
    ["aqua", "hyaluronic", "glycerin", "panthenol", "xanthan", "phenoxy"],
    ["ph", "viskositas", "hidrasi", "tewl", "rheogram_n"],
  ),
  k(
    "Serum Peptida",
    "Serum",
    ["aqua", "kolagen", "panthenol", "butylene", "xanthan", "phenoxy"],
    ["ph", "kadar_aktif", "elastisitas", "assay_aktif"],
  ),
  k(
    "Serum Barrier Ceramide",
    "Serum",
    [...DASAR_EMULSI, "panthenol", "allantoin"],
    ["ph", "tewl", "hidrasi", "ukuran_droplet", "stabilitas_45"],
  ),
  k(
    "Serum Eksfoliasi Malam",
    "Serum",
    ["aqua", "aha", "salicylic", "panthenol", "phenoxy"],
    ["ph", "kadar_aktif", "kekasaran", "eritema", "patch_test"],
  ),
  k(
    "Serum Anti Polusi",
    "Serum",
    ["aqua", "niacinamide", "centella", "butylene", "phenoxy"],
    ["ph", "anti_polusi", "hidrasi", "stabilitas_warna"],
  ),
  k(
    "Booster Vitamin C Anhidrat",
    "Serum",
    ["squalane", "vitc", "jojoba"],
    ["kadar_aktif", "warna_b", "stabilitas_warna", "peroksida", "oksidasi_anisidin"],
  ),
  k(
    "Emulsion Ringan",
    "Pelembap",
    [...DASAR_EMULSI, "hyaluronic"],
    ["ph", "viskositas", "ukuran_droplet", "waktu_serap", "sentrifugasi"],
  ),
  k(
    "Krim Malam Regenerasi",
    "Pelembap",
    [...DASAR_EMULSI, "retinol", "panthenol"],
    ["ph", "viskositas", "kadar_aktif", "fotostabilitas", "patch_test"],
  ),
  k(
    "Krim Barrier Kulit Sensitif",
    "Pelembap",
    [...DASAR_EMULSI, "allantoin", "centella"],
    ["ph", "tewl", "eritema", "ukuran_droplet", "stabilitas_45"],
  ),
  k(
    "Pelembap Oil Free Acne",
    "Pelembap",
    [...DASAR_GEL, "niacinamide", "zinc"],
    ["ph", "viskositas", "sebum", "pori", "waktu_serap"],
  ),
  k(
    "Masker Bubuk Alginate",
    "Masker",
    ["clay", "glycerin", "allantoin"],
    ["kadar_air", "ukuran_partikel", "firmness", "waktu_serap"],
  ),
  k(
    "Masker Tidur Gel Krim",
    "Masker",
    [...DASAR_GEL, "squalane", "panthenol"],
    ["viskositas", "yield_stress", "hidrasi", "sineresis"],
  ),
  k(
    "Sunscreen Losion Anak",
    "Tabir Surya",
    ["aqua", "zinc_oxide", "squalane", "cetearyl", "gms", "xanthan", "phenoxy"],
    ["spf_invitro", "uva_pf", "whitecast", "tahan_air", "patch_test"],
  ),
  k(
    "Sunscreen Serum Bening",
    "Tabir Surya",
    ["aqua", "niacin_sunscreen", "butylene", "carbomer", "tea", "phenoxy"],
    ["spf_invitro", "uva_pf", "kejernihan", "kelengketan", "ph"],
  ),
  k(
    "Sunscreen Powder Setting",
    "Tabir Surya",
    ["clay", "zinc_oxide", "squalane"],
    ["spf_invitro", "ukuran_partikel", "whitecast", "adhesi_film"],
  ),
  k(
    "After Sun Gel",
    "Tabir Surya",
    [...DASAR_GEL, "centella", "allantoin"],
    ["ph", "viskositas", "eritema", "hidrasi"],
  ),
  k(
    "Eye Serum Kantung Mata",
    "Perawatan Mata",
    ["aqua", "kolagen", "hyaluronic", "butylene", "xanthan", "phenoxy"],
    ["ph", "viskositas", "elastisitas", "patch_test"],
  ),
  k(
    "Lip Mask Malam",
    "Perawatan Bibir",
    ["squalane", "jojoba", "cetearyl", "panthenol"],
    ["firmness", "titik_leleh", "gloss", "evaporasi"],
  ),
  k(
    "Lip Scrub",
    "Perawatan Bibir",
    ["squalane", "jojoba", "clay", "glycerin"],
    ["ukuran_partikel", "firmness", "kekasaran"],
  ),
  k(
    "Lip Cream Matte",
    "Riasan",
    ["squalane", "clay", "jojoba", "cetearyl", "parfum"],
    ["viskositas", "gloss", "adhesi_film", "warna_a", "delta_e_batch"],
  ),
  k(
    "Cushion Foundation",
    "Riasan",
    [...DASAR_EMULSI, "clay", "zinc_oxide"],
    ["ukuran_partikel", "warna_l", "delta_e_batch", "adhesi_film", "spf_invitro"],
  ),
  k(
    "Primer Wajah",
    "Riasan",
    [...DASAR_GEL, "squalane"],
    ["viskositas", "adhesi_film", "film_residu", "kelengketan"],
  ),
  k(
    "Maskara Volume",
    "Riasan",
    ["aqua", "carbomer", "cetearyl", "clay", "phenoxy"],
    ["viskositas", "adhesi_film", "tiksotropi", "tpc_awal"],
  ),
  k(
    "Body Serum Pencerah",
    "Perawatan Tubuh",
    ["aqua", "niacinamide", "hyaluronic", "xanthan", "parfum", "phenoxy"],
    ["ph", "kadar_aktif", "melanin", "waktu_serap"],
  ),
  k(
    "Body Mist Parfum",
    "Perawatan Tubuh",
    ["aqua", "butylene", "parfum", "phenoxy"],
    ["turbiditas", "aroma_intensitas", "daya_keluar", "kejernihan"],
  ),
  k(
    "Hand Sanitizer Gel",
    "Perawatan Tangan",
    ["aqua", "glycerin", "carbomer", "tea", "panthenol"],
    ["ph", "viskositas", "kadar_etanol", "evaporasi"],
  ),
  k(
    "Foot Cream Urea",
    "Perawatan Tubuh",
    [...DASAR_EMULSI, "allantoin", "panthenol"],
    ["ph", "viskositas", "kekasaran", "tewl"],
  ),
  k(
    "Deodoran Spray",
    "Perawatan Tubuh",
    ["aqua", "butylene", "zinc", "parfum", "phenoxy"],
    ["ph", "daya_keluar", "aroma_intensitas", "kebocoran"],
  ),
  k(
    "Sabun Batang Sirih",
    "Perawatan Tubuh",
    ["cetearyl", "squalane", "glycerin", "clay", "parfum"],
    ["ph", "firmness", "foam_volume", "susut_bobot"],
  ),
  k(
    "Shampoo Anti Ketombe",
    "Perawatan Rambut",
    ["aqua", "zinc", "glycerin", "xanthan", "parfum", "phenoxy"],
    ["ph", "viskositas", "foam_volume", "tpc_awal"],
  ),
  k(
    "Hair Mask Perbaikan",
    "Perawatan Rambut",
    [...DASAR_EMULSI, "kolagen", "parfum"],
    ["viskositas", "daya_sebar", "drag_force", "pemulihan_viskositas"],
  ),
  k(
    "Hair Tonic Anti Rontok",
    "Perawatan Rambut",
    ["aqua", "butylene", "panthenol", "centella", "phenoxy"],
    ["ph", "turbiditas", "daya_keluar", "kejernihan"],
  ),
  k(
    "Dry Shampoo",
    "Perawatan Rambut",
    ["clay", "squalane", "parfum"],
    ["ukuran_partikel", "adhesi_film", "sebum", "daya_keluar"],
  ),
  k(
    "Intimate Wash",
    "Perawatan Personal",
    ["aqua", "glycerin", "panthenol", "allantoin", "xanthan", "phenoxy"],
    ["ph", "viskositas", "foam_volume", "patch_test"],
  ),
  k(
    "Baby Lotion",
    "Perawatan Bayi",
    [...DASAR_EMULSI, "allantoin", "panthenol"],
    ["ph", "viskositas", "tewl", "patch_test", "sentrifugasi"],
  ),
  k(
    "Baby Hair and Body Wash",
    "Perawatan Bayi",
    ["aqua", "glycerin", "panthenol", "xanthan", "phenoxy"],
    ["ph", "foam_volume", "patch_test", "tpc_awal"],
  ),
  k(
    "Balm Penghangat Tubuh",
    "Perawatan Tubuh",
    ["squalane", "jojoba", "cetearyl", "tea_tree", "parfum"],
    ["titik_leleh", "firmness", "film_residu", "patch_test"],
  ),
];

export const KATEGORI_NAMA = KATEGORI_PRODUK.map((x) => x.nama);

export function kategoriDef(nama: string): KategoriDef {
  return KATEGORI_PRODUK.find((x) => x.nama === nama) ?? KATEGORI_PRODUK[8]!;
}

function bahanDari(ids: string[]): Ingredient[] {
  return ids
    .map((id) => ({ ...BAHAN_LIBRARY.find((b) => b.id === id)! }))
    .filter((b) => Boolean(b.id));
}

const waktu = (hariLalu: number, jam = 9) =>
  new Date(Date.UTC(2026, 8, 17 - hariLalu, jam, 0)).toISOString();

function buatBatch(
  nomor: number,
  kategori: string,
  targets: TargetParam[],
  isi: "penuh" | "sebagian" | "kosong",
  hariLalu: number,
): Batch {
  const def = kategoriDef(kategori);
  return {
    nomor,
    status: isi === "penuh" ? "dievaluasi" : isi === "sebagian" ? "berjalan" : "draft",
    dibuat: waktu(hariLalu),
    tujuan: [
      "Memverifikasi formula " + kategori.toLowerCase() + " pada batch " + nomor,
      "Mengukur " +
        targets
          .slice(0, 3)
          .map((t) => t.label.toLowerCase())
          .join(", "),
    ],
    hipotesis:
      "Formula batch " +
      nomor +
      " memenuhi jendela target untuk " +
      targets.map((t) => t.label.toLowerCase()).join(", ") +
      ".",
    prosedur: [
      "Timbang seluruh bahan sesuai tabel formula dan catat nomor lot",
      "Siapkan fase air dan fase minyak pada 75 C",
      "Homogenisasi 3200 rpm selama 8 menit",
      "Dinginkan ke 40 C lalu tambahkan bahan aktif dan pengawet",
      "Ambil sampel untuk pembacaan parameter pada T0, T24 jam, dan T7 hari",
    ],
    bahan: bahanDari(def.resep),
    hasil: targets.map((t, i) => ({
      paramId: t.id,
      nilai:
        isi === "kosong" || (isi === "sebagian" && i > 1)
          ? null
          : Number((t.target + (i % 2 === 0 ? 1 : -1) * t.toleransi * 0.6).toFixed(2)),
      sumber: "sensor" as const,
    })),
    observasi:
      isi === "kosong"
        ? ""
        : "Warna dan aroma sesuai standar, tidak ada endapan pada pengamatan 24 jam.",
    feedback: isi === "penuh" ? "Tekstur sudah nyaman, lanjutkan uji stabilitas lanjutan." : "",
  };
}

type Ringkas = {
  id: string;
  judul: string;
  peneliti: string;
  tim: string;
  kategori: string;
  status: Project["status"];
  brief: string;
  batch: ("penuh" | "sebagian" | "kosong")[];
  kirim?: string;
};

const DAFTAR: Ringkas[] = [
  {
    id: "prj-mist-centella",
    judul: "Amarya C-Defense Face Mist, Studi Hidrasi",
    peneliti: "Samuel Kevin",
    tim: "Tim Skin Care",
    kategori: "Face Mist",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori face mist Amarya dengan fokus hidrasi, pola semprot, dan kenyamanan setelah pemakaian.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-eye-collagen",
    judul: "Vellure Eye Cream, Studi Sensori Area Mata",
    peneliti: "Intan Rahmawati",
    tim: "Tim Skin Care",
    kategori: "Eye Cream",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori perawatan mata Vellure dengan fokus daya sebar, iritasi, dan stabilitas emulsi.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-acne-spot",
    judul: "Zevi Ms. Pimple Spot Gel, Studi Salisilat",
    peneliti: "Raka Wijaya",
    tim: "Tim Derma",
    kategori: "Acne Spot Gel",
    status: "Menunggu Tinjauan",
    brief:
      "Studi simulasi kategori acne spot Zevi dengan salisilat kadar rendah dan evaluasi tolerabilitas pemakaian malam.",
    batch: ["penuh", "penuh"],
  },
  {
    id: "prj-sun-gel",
    judul: "Solvea BiomeProtect Sunscreen, Studi Tekstur Gel",
    peneliti: "Nadia Puspita",
    tim: "Tim Sun Care",
    kategori: "Sunscreen Gel Ringan",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori sunscreen Solvea dengan fokus sensori ringan, UVA-PF, SPF, dan stabilitas pada iklim lembap.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-sun-stick",
    judul: "Varko Sunscreen Stick, Studi Reaplikasi Luar Ruang",
    peneliti: "Farhan Maulana",
    tim: "Tim Sun Care",
    kategori: "Sunscreen Stick",
    status: "Draft",
    brief:
      "Studi simulasi kategori sunscreen stick Varko untuk reaplikasi cepat, ketahanan panas, dan gaya gesek saat aplikasi.",
    batch: ["kosong"],
  },
  {
    id: "prj-clay-mask",
    judul: "Clay Mask Kaolin Pori Bersih",
    peneliti: "Dina Aprilia",
    tim: "Tim Skin Care",
    kategori: "Clay Mask",
    status: "Sedang Berjalan",
    brief: "Masker tanah liat mingguan untuk kulit berminyak dengan pori terlihat besar.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-sleep-mask",
    judul: "Sleeping Mask Barrier Repair",
    peneliti: "Intan Rahmawati",
    tim: "Tim Skin Care",
    kategori: "Sleeping Mask",
    status: "Menunggu Tinjauan",
    brief: "Masker tidur untuk memperbaiki skin barrier setelah eksfoliasi.",
    batch: ["penuh"],
  },
  {
    id: "prj-micellar",
    judul: "Amarya Lightening Micellar Water, Studi Mildness",
    peneliti: "Samuel Kevin",
    tim: "Tim Cleansing",
    kategori: "Micellar Water",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori micellar water Amarya dengan fokus efisiensi pembersihan, kejernihan, dan kenyamanan mata.",
    batch: ["penuh", "kosong"],
  },
  {
    id: "prj-balm",
    judul: "Belloque Cleansing Balm, Studi Daya Angkat Riasan",
    peneliti: "Farhan Maulana",
    tim: "Tim Cleansing",
    kategori: "Cleansing Balm",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori cleansing balm Belloque untuk riasan tahan lama dengan evaluasi titik leleh dan residu setelah bilas.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-retinol",
    judul: "Serum Retinol Pemula Kadar Rendah",
    peneliti: "Raka Wijaya",
    tim: "Tim Derma",
    kategori: "Serum Anti Penuaan",
    status: "Sedang Berjalan",
    brief:
      "Serum retinol untuk pemula dengan penekanan pada kestabilan cahaya dan kenyamanan kulit.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-ampoule",
    judul: "Ampoule Hidrasi Intensif Musim Kemarau",
    peneliti: "Nadia Puspita",
    tim: "Tim Skin Care",
    kategori: "Ampoule Intensif",
    status: "Draft",
    brief: "Ampoule hidrasi untuk kulit dehidrasi pada musim kemarau panjang.",
    batch: ["kosong"],
  },
  {
    id: "prj-body-butter",
    judul: "Body Butter Kakao Kelembapan Dalam",
    peneliti: "Dina Aprilia",
    tim: "Tim Body Care",
    kategori: "Body Butter",
    status: "Sedang Berjalan",
    brief: "Butter tubuh kaya emolien untuk kulit sangat kering di area siku dan lutut.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-body-wash",
    judul: "Body Wash Lembut pH Seimbang",
    peneliti: "Intan Rahmawati",
    tim: "Tim Body Care",
    kategori: "Body Wash",
    status: "Selesai",
    brief: "Sabun mandi cair dengan pH seimbang untuk pemakaian harian seluruh keluarga.",
    batch: ["penuh", "penuh"],
    kirim: "Divisi Produksi",
  },
  {
    id: "prj-scrub",
    judul: "Body Scrub Butiran Halus Kopi Gayo",
    peneliti: "Farhan Maulana",
    tim: "Tim Body Care",
    kategori: "Body Scrub",
    status: "Menunggu Tinjauan",
    brief: "Lulur tubuh dengan butiran halus untuk eksfoliasi mingguan tanpa iritasi.",
    batch: ["penuh"],
  },
  {
    id: "prj-hand",
    judul: "Hand Cream Cepat Meresap Non Lengket",
    peneliti: "Samuel Kevin",
    tim: "Tim Body Care",
    kategori: "Hand Cream",
    status: "Sedang Berjalan",
    brief: "Krim tangan untuk pekerja kantor yang sering mencuci tangan.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-lip",
    judul: "Belloque Lip Serum, Studi Kilap dan Pigmen",
    peneliti: "Nadia Puspita",
    tim: "Tim Colour",
    kategori: "Lip Serum",
    status: "Sedang Berjalan",
    brief:
      "Studi simulasi kategori lip serum Belloque dengan evaluasi kilap, kestabilan pigmen, migrasi, dan rasa lengket.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-shampoo",
    judul: "Shampoo Lembut Kulit Kepala Sensitif",
    peneliti: "Raka Wijaya",
    tim: "Tim Hair Care",
    kategori: "Shampoo Lembut",
    status: "Sedang Berjalan",
    brief: "Sampo tanpa sulfat keras untuk kulit kepala sensitif dan mudah gatal.",
    batch: ["penuh", "sebagian"],
  },
  {
    id: "prj-conditioner",
    judul: "Conditioner Pelembut Rambut Diwarnai",
    peneliti: "Dina Aprilia",
    tim: "Tim Hair Care",
    kategori: "Conditioner",
    status: "Draft",
    brief: "Kondisioner untuk rambut diwarnai agar warna lebih tahan dan mudah disisir.",
    batch: ["kosong"],
  },
  {
    id: "prj-deo",
    judul: "Deodoran Roll On Bebas Alkohol",
    peneliti: "Intan Rahmawati",
    tim: "Tim Personal Care",
    kategori: "Deodoran Roll On",
    status: "Menunggu Tinjauan",
    brief: "Deodoran bebas alkohol dengan aroma segar tahan dua belas jam.",
    batch: ["penuh", "penuh"],
  },
  {
    id: "prj-essence",
    judul: "Essence Ringan Lapisan Pertama Hidrasi",
    peneliti: "Samuel Kevin",
    tim: "Tim Skin Care",
    kategori: "Essence Ringan",
    status: "Sedang Berjalan",
    brief: "Essence lapis pertama untuk mempersiapkan kulit sebelum serum.",
    batch: ["penuh", "sebagian"],
  },
  // Satu-satunya proyek yang berada di dalam domain F3 (gel-cream O/W kulit
  // berminyak). Dipakai untuk memperlihatkan alur lengkap checkpoint -> F3.
  {
    id: "prj-gelcream-oily",
    judul: "Pelembap Gel-Cream Kulit Berminyak",
    peneliti: "Dina Aprilia",
    tim: "Tim Skin Care",
    kategori: "Pelembap Krim",
    status: "Sedang Berjalan",
    brief:
      "Moisturizer gel-cream oil-in-water untuk kulit berminyak, satu-satunya kategori yang saat ini didukung F3 Stability Sentinel.",
    batch: ["sebagian"],
  },
];

/**
 * Checkpoint terkonfirmasi untuk proyek di dalam domain F3.
 * Tren viskositas sengaja menurun agar panel sentinel punya sinyal untuk dibaca.
 */
const CHECKPOINT_GELCREAM: Checkpoint[] = [
  {
    minggu: 0,
    ph: 5.42,
    viskositasCp: 6480,
    penampilan: "uniform",
    sumber: "manual",
    dikonfirmasi: true,
    dikonfirmasiOleh: "Dina Aprilia",
    waktu: waktu(30),
  },
  {
    minggu: 2,
    ph: 5.31,
    viskositasCp: 6120,
    penampilan: "uniform",
    sumber: "sensor",
    dikonfirmasi: true,
    dikonfirmasiOleh: "Dina Aprilia",
    waktu: waktu(16),
  },
  {
    minggu: 4,
    ph: 5.12,
    viskositasCp: 4950,
    penampilan: "uniform",
    sumber: "sensor",
    dikonfirmasi: true,
    dikonfirmasiOleh: "Dina Aprilia",
    waktu: waktu(2),
  },
];

export const EXTRA_PROJECTS: Project[] = DAFTAR.map((r, idx) => {
  const targets = targetDariId(kategoriDef(r.kategori).params);
  return {
    id: r.id,
    judul: r.judul,
    peneliti: r.peneliti,
    tim: r.tim,
    kategori: r.kategori,
    status: r.status,
    update: waktu(idx % 9, 8 + (idx % 6)),
    brief: r.brief,
    targets,
    batches: r.batch.map((isi, i) => {
      const batch = buatBatch(i + 1, r.kategori, targets, isi, r.batch.length - i + (idx % 4));
      if (r.id === "prj-gelcream-oily" && i === 0) {
        batch.checkpoints = CHECKPOINT_GELCREAM.map((c) => ({ ...c }));
        batch.proses = { heating_temp_c: 75, homogenization_rpm: 3200, mixing_time_min: 8 };
        batch.suhuSimpanC = 40;
        batch.status = "pemantauan";
      }
      return batch;
    }),
    dikirimKe: r.kirim,
  };
});
