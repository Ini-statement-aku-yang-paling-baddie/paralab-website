/**
 * Kontrak klaim ParaLab.
 *
 * Sumber: docs/architecture/architecture_v5.md pada repository paralab-architecture.
 * Berkas ini menyalin kosakata dan batas klaim arsitektur ke dalam website supaya
 * kedua sisi memakai istilah yang sama dan tidak ada layar yang menjanjikan lebih
 * dari yang benar-benar dijalankan kode.
 */

/** Asal data seluruh prediksi di prototipe ini. Tidak pernah data lab nyata. */
export const DATA_ORIGIN = "synthetic_demo" as const;

/** Status validasi ilmiah. Tidak pernah berubah selama prototipe. */
export const VALIDATION_STATUS = "not_validated_for_production" as const;

/** Versi rule F2 yang dirujuk website. Sinkron dengan data/formulation_rules.json. */
export const RULE_VERSION = "2026.09" as const;

/** Status pilot CV sesuai model_manifest.json. */
export const CV_STATUS = "concept_only_synthetic_render_pilot" as const;

/**
 * Empat lapis yang wajib dibedakan di setiap layar (architecture v5 §13 poin 6).
 * Dipakai sebagai `variant` pada BandProvenance agar peneliti selalu tahu
 * sebuah angka datang dari mana.
 */
export type LapisKlaim = "rule" | "sensor" | "prediksi" | "manusia" | "heuristik";

export const LAPIS: Record<LapisKlaim, { label: string; teks: string }> = {
  rule: {
    label: "Rule deterministik",
    teks: "Hasil rule engine yang dapat ditelusuri ke rule ID, sumber, dan versi. Bukan persetujuan BPOM, halal, atau keamanan.",
  },
  sensor: {
    label: "Pembacaan alat",
    teks: "Angka dari kanal sensor laboratorium. Perlu dikonfirmasi peneliti sebelum menjadi hasil uji resmi.",
  },
  prediksi: {
    label: "Prediksi synthetic-demo",
    teks: "Model dilatih dan diuji hanya pada data sintetis. Tidak memprediksi perilaku formulasi nyata dan tidak menggantikan uji stabilitas formal.",
  },
  manusia: {
    label: "Keputusan peneliti",
    teks: "Dicatat atas konfirmasi manusia. Sistem tidak pernah menulis bagian ini sendiri.",
  },
  heuristik: {
    label: "Estimasi kasar",
    teks: "Perhitungan heuristik untuk perencanaan internal, bukan hasil model tervalidasi maupun pengganti uji laboratorium.",
  },
};

/**
 * Domain yang didukung F2/F3 pada arsitektur v5 §3.
 * Di luar ini, sistem wajib abstain, bukan menebak.
 */
export const DOMAIN_DIDUKUNG = "moisturizer gel-cream oil-in-water untuk kulit berminyak" as const;

/** Batas yang selalu ikut ditampilkan bersama keluaran F3. */
export const BATAS_F3 = [
  "Forecast dilatih dan dievaluasi pada synthetic-demo data, bukan data laboratorium.",
  "Forecast tidak menggantikan uji stabilitas formal dan tidak pernah menyatakan formula lolos lebih awal.",
  "Risiko rendah berarti lanjutkan observasi, bukan formula dinyatakan aman.",
];

/** Batas yang selalu ikut ditampilkan bersama keluaran analisis citra. */
export const BATAS_CV = [
  "Pilot CV dilatih pada render prosedural sintetis, belum tervalidasi untuk foto kosmetik nyata.",
  "Analisis citra hanya mengusulkan observasi. Peneliti yang memutuskan nilai yang masuk checkpoint.",
];
