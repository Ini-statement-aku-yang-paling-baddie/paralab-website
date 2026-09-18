import {
  BAHAN_LIBRARY,
  CLASH_RULES,
  SEED_PROJECTS,
  TARGET_PRESET,
  hitungHpp,
  type Batch,
  type BatchEvaluation,
  type Ingredient,
  type Project,
  type TargetParam,
} from "./data";
import { EXTRA_PROJECTS, KATEGORI_NAMA, kategoriDef, targetDariId } from "./catalog";
import { RULE_VERSION } from "./kontrak";

export type Brief = {
  judul: string;
  kategori: string;
  targetKulit: string;
  klaim: string[];
  catatan: string;
};

export const KATEGORI_OPSI = KATEGORI_NAMA;

export const KLAIM_OPSI = [
  "Kontrol minyak",
  "Mencerahkan",
  "Melembapkan",
  "Anti penuaan",
  "Menenangkan kulit",
  "Tidak lengket",
  "Perlindungan UV",
  "Aman untuk kulit sensitif",
  "Memperbaiki skin barrier",
  "Mengurangi jerawat",
  "Menyamarkan bekas jerawat",
  "Mengecilkan tampilan pori",
  "Meratakan warna kulit",
  "Mengurangi kemerahan",
  "Eksfoliasi lembut",
  "Melembapkan 24 jam",
  "Mengencangkan kulit",
  "Menyamarkan garis halus",
  "Anti polusi",
  "Menutrisi kulit kering",
  "Ringan dan cepat meresap",
  "Bebas alkohol",
  "Bebas pewangi",
  "Non komedogenik",
  "Tahan air",
  "Tanpa whitecast",
  "Cocok dipakai di bawah riasan",
  "Menyegarkan dan mendinginkan",
  "Menghaluskan tekstur kulit",
  "Mengurangi kulit kusam",
  "Melindungi dari sinar biru",
  "Menutrisi rambut rusak",
  "Mengurangi ketombe",
  "Vegan dan bebas uji hewan",
  "Halal dan aman untuk keluarga",
];

export const TIPE_KULIT_OPSI = [
  "Normal",
  "Berminyak",
  "Kering",
  "Kombinasi",
  "Sensitif",
  "Berjerawat aktif",
  "Rawan komedo",
  "Dehidrasi",
  "Kusam dan tidak merata",
  "Hiperpigmentasi",
  "Matang dengan garis halus",
  "Kemerahan dan rosacea",
  "Barrier rusak",
  "Sensitif terhadap matahari",
  "Kulit remaja",
  "Kulit pria berminyak",
  "Kulit tubuh kering bersisik",
  "Kulit bayi",
  "Kulit iklim tropis lembap",
  "Semua jenis kulit",
];

const KLAIM_BAHAN: Record<string, string[]> = {
  "Kontrol minyak": ["zinc", "salicylic"],
  Mencerahkan: ["niacinamide", "vitc"],
  Melembapkan: ["hyaluronic", "glycerin"],
  "Anti penuaan": ["retinol", "panthenol"],
  "Menenangkan kulit": ["centella", "allantoin"],
  "Tidak lengket": ["butylene"],
  "Perlindungan UV": ["zinc_oxide", "niacin_sunscreen"],
  "Aman untuk kulit sensitif": ["panthenol", "allantoin"],
  "Memperbaiki skin barrier": ["panthenol", "squalane"],
  "Mengurangi jerawat": ["salicylic", "zinc", "tea_tree"],
  "Menyamarkan bekas jerawat": ["niacinamide", "centella"],
  "Mengecilkan tampilan pori": ["niacinamide", "salicylic"],
  "Meratakan warna kulit": ["niacinamide", "kojic"],
  "Mengurangi kemerahan": ["centella", "allantoin"],
  "Eksfoliasi lembut": ["aha"],
  "Melembapkan 24 jam": ["hyaluronic", "glycerin", "squalane"],
  "Mengencangkan kulit": ["kolagen", "retinol"],
  "Menyamarkan garis halus": ["retinol", "kolagen"],
  "Anti polusi": ["niacinamide", "centella"],
  "Menutrisi kulit kering": ["squalane", "jojoba"],
  "Ringan dan cepat meresap": ["butylene"],
  "Menghaluskan tekstur kulit": ["aha", "panthenol"],
  "Mengurangi kulit kusam": ["vitc", "niacinamide"],
  "Melindungi dari sinar biru": ["zinc_oxide", "niacinamide"],
  "Menutrisi rambut rusak": ["kolagen", "panthenol"],
  "Mengurangi ketombe": ["zinc", "tea_tree"],
  "Tanpa whitecast": ["niacin_sunscreen"],
  "Tahan air": ["squalane"],
  "Menyegarkan dan mendinginkan": ["centella"],
};

function ambil(id: string): Ingredient | null {
  const b = BAHAN_LIBRARY.find((x) => x.id === id);
  return b ? { ...b } : null;
}

function normalisasi(list: Ingredient[]): Ingredient[] {
  const air = list.find((b) => b.id === "aqua");
  const lain = list.filter((b) => b.id !== "aqua");
  const totalLain = lain.reduce((t, b) => t + b.percent, 0);
  if (air) air.percent = Math.max(0, Number((100 - totalLain).toFixed(2)));
  return list;
}

export function susunFormula(brief: Brief): Ingredient[] {
  const dasar = kategoriDef(brief.kategori).resep;
  const ids = [...dasar];
  for (const klaim of brief.klaim) {
    for (const id of KLAIM_BAHAN[klaim] ?? []) if (!ids.includes(id)) ids.push(id);
  }
  const list = ids.map(ambil).filter((b): b is Ingredient => b !== null);
  return normalisasi(list);
}

export type Clash = {
  a: string;
  b: string;
  tingkat: "tinggi" | "sedang";
  alasan: string;
  ruleId: string;
  ruleVersion: string;
  severity: "blocked" | "warning";
  sourceId: string;
  perluTinjauanManusia: boolean;
};

export function deteksiClash(list: Ingredient[]): Clash[] {
  const ids = new Set(list.map((b) => b.id));
  const hasil: Clash[] = [];
  for (const rule of CLASH_RULES) {
    if (ids.has(rule.a) && ids.has(rule.b)) {
      hasil.push({
        a: list.find((b) => b.id === rule.a)!.name,
        b: list.find((b) => b.id === rule.b)!.name,
        tingkat: rule.tingkat,
        alasan: rule.alasan,
        ruleId: rule.ruleId,
        ruleVersion: rule.ruleVersion,
        severity: rule.severity,
        sourceId: rule.sourceId,
        perluTinjauanManusia: rule.perluTinjauanManusia,
      });
    }
  }
  return hasil;
}

/**
 * Batas kadar prototipe, satu rule satu ID agar dapat ditelusuri.
 * Angka ini masih perlu diverifikasi terhadap PerBPOM sebelum dipakai nyata.
 */
const BATAS_KADAR: {
  id: string;
  ruleId: string;
  sourceId: string;
  maks: number;
  acuan: string;
}[] = [
  {
    id: "retinol",
    ruleId: "WEB-LIMIT-001",
    sourceId: "WEB-RULESRC-101",
    maks: 0.3,
    acuan: "PerBPOM 17/2022, lampiran bahan dibatasi",
  },
  {
    id: "salicylic",
    ruleId: "WEB-LIMIT-002",
    sourceId: "WEB-RULESRC-102",
    maks: 2,
    acuan: "PerBPOM 17/2022, leave-on",
  },
  {
    id: "phenoxy",
    ruleId: "WEB-LIMIT-003",
    sourceId: "WEB-RULESRC-103",
    maks: 1,
    acuan: "PerBPOM 17/2022, pengawet",
  },
  {
    id: "aha",
    ruleId: "WEB-LIMIT-004",
    sourceId: "WEB-RULESRC-104",
    maks: 10,
    acuan: "PerBPOM 17/2022, eksfolian",
  },
  {
    id: "kojic",
    ruleId: "WEB-LIMIT-005",
    sourceId: "WEB-RULESRC-105",
    maks: 2,
    acuan: "PerBPOM 17/2022, pencerah",
  },
  {
    id: "niacin_sunscreen",
    ruleId: "WEB-LIMIT-006",
    sourceId: "WEB-RULESRC-106",
    maks: 10,
    acuan: "PerBPOM 17/2022, UV filter",
  },
  {
    id: "zinc_oxide",
    ruleId: "WEB-LIMIT-007",
    sourceId: "WEB-RULESRC-107",
    maks: 25,
    acuan: "PerBPOM 17/2022, UV filter",
  },
];

export type PelanggaranKadar = {
  bahan: Ingredient;
  maks: number;
  ruleId: string;
  ruleVersion: string;
  sourceId: string;
  acuan: string;
};

/**
 * Status skrining mengikuti kosakata F2 (architecture v5 §5.1), bukan vonis.
 * `clear_for_current_screening` berarti tidak ada rule prototipe yang aktif,
 * bukan formula dinyatakan halal, aman, atau lolos BPOM.
 */
export type StatusSkrining = "clear_for_current_screening" | "warning" | "blocked" | "unknown";

export const LABEL_SKRINING: Record<StatusSkrining, string> = {
  clear_for_current_screening: "tidak ada rule aktif",
  warning: "perlu diperiksa",
  blocked: "melanggar batas prototipe",
  unknown: "belum dapat dipetakan",
};

export function ringkasKepatuhan(list: Ingredient[]) {
  const syubhat = list.filter((b) => b.halal === "syubhat");
  const haram = list.filter((b) => b.halal === "haram");
  const dibatasi = list.filter((b) => b.bpom === "dibatasi");

  const pelanggaran: PelanggaranKadar[] = [];
  for (const b of list) {
    const batas = BATAS_KADAR.find((x) => x.id === b.id);
    if (batas && b.percent > batas.maks) {
      pelanggaran.push({
        bahan: b,
        maks: batas.maks,
        ruleId: batas.ruleId,
        ruleVersion: RULE_VERSION,
        sourceId: batas.sourceId,
        acuan: batas.acuan,
      });
    }
  }
  const melanggar = pelanggaran.map((p) => p.bahan);

  // Bahan tanpa INCI atau tanpa nomor CAS belum dapat dipetakan dengan aman.
  // F2 menyebut keadaan ini `unknown`, dan `unknown` wajib menghentikan forecast.
  const takDikenal = list.filter((b) => !b.inci || b.inci === "-" || b.cas === "-");

  const status: StatusSkrining =
    haram.length > 0 || melanggar.length > 0
      ? "blocked"
      : takDikenal.length > 0
        ? "unknown"
        : syubhat.length > 0 || dibatasi.length > 0
          ? "warning"
          : "clear_for_current_screening";

  return {
    status,
    label: LABEL_SKRINING[status],
    ruleVersion: RULE_VERSION,
    syubhat,
    haram,
    dibatasi,
    melanggar,
    pelanggaran,
    takDikenal,
    /** Warning, blocked, dan unknown semuanya menuntut tanda tangan manusia. */
    perluTandaTanganManusia: status !== "clear_for_current_screening",
  };
}

export function prediksiParameter(list: Ingredient[], targets: TargetParam[]) {
  const pengental = list
    .filter((b) => ["cetearyl", "xanthan", "carbomer", "gms", "clay"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);
  const asam = list
    .filter((b) => ["aha", "salicylic", "vitc", "kojic"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);
  const emulsifier = list
    .filter((b) => ["gms", "cetearyl"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);

  const prediksi: Record<string, number> = {
    ph: Number(Math.max(3.2, 6.2 - asam * 0.28).toFixed(2)),
    viskositas: Math.round(600 + pengental * 950),
    ukuran_droplet: Number(Math.max(0.8, 6.5 - emulsifier * 0.55).toFixed(2)),
    turbiditas: Number(Math.max(2, 30 - emulsifier * 2.6).toFixed(1)),
  };

  return targets.map((t) => {
    const nilai = prediksi[t.id] ?? t.target;
    const selisih = Math.abs(nilai - t.target);
    return {
      paramId: t.id,
      label: t.label,
      unit: t.unit,
      target: t.target,
      prediksi: nilai,
      lolos: selisih <= t.toleransi,
      keyakinan: Math.max(48, Math.round(100 - (selisih / Math.max(t.toleransi, 0.001)) * 22)),
    };
  });
}

export function kurvaStabilitas(list: Ingredient[]) {
  const emulsifier = list
    .filter((b) => ["gms", "cetearyl", "xanthan"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);
  const skor = Math.min(98, 62 + emulsifier * 4);
  return [0, 3, 7, 14, 21, 28].map((hari) => ({
    hari: "H" + hari,
    suhuRuang: Number((skor - hari * 0.22).toFixed(1)),
    suhu45: Number((skor - hari * 0.85).toFixed(1)),
    suhu4: Number((skor - hari * 0.1).toFixed(1)),
  }));
}

export function kontribusiBiaya(list: Ingredient[]) {
  return list
    .map((b) => ({
      nama: b.name,
      biaya: Math.round((b.percent / 100) * (b.hargaPerKg / 1000) * 50),
    }))
    .filter((x) => x.biaya > 0)
    .sort((a, b) => b.biaya - a.biaya)
    .slice(0, 6);
}

export function cariJurnalMirip(judul: string, kategori: string) {
  const kata = judul
    .toLowerCase()
    .split(/\s+/)
    .filter((k) => k.length > 3);
  const bentuk = kategoriDef(kategori).bentuk;
  return [...SEED_PROJECTS, ...EXTRA_PROJECTS]
    .map((p) => {
      let skor = p.kategori === kategori ? 58 : kategoriDef(p.kategori).bentuk === bentuk ? 38 : 14;
      for (const k of kata) {
        if (p.judul.toLowerCase().includes(k) || p.brief.toLowerCase().includes(k)) skor += 11;
      }
      return { proyek: p, skor: Math.min(96, skor) };
    })
    .filter((x) => x.skor >= 30)
    .sort((a, b) => b.skor - a.skor)
    .slice(0, 8);
}

export function alasanRelevansi(p: Project) {
  const last = p.batches[p.batches.length - 1];
  if (!last) return "Proyek masih tahap perencanaan, brief dapat dijadikan pembanding awal.";
  if (last.evaluasi) return last.evaluasi.ringkasan;
  return (
    "Batch " + last.nomor + " sedang berjalan dengan tujuan " + last.tujuan.join(" dan ") + "."
  );
}

export function buatJurnalKosong(
  brief: Brief,
  bahan: Ingredient[],
  targets: TargetParam[],
  nomor = 1,
): Batch {
  const prediksi = prediksiParameter(bahan, targets);
  return {
    nomor,
    status: "berjalan",
    dibuat: new Date().toISOString(),
    tujuan: [
      "Memverifikasi formula usulan AI untuk " + brief.judul.toLowerCase(),
      "Mengukur " + targets.map((t) => t.label.toLowerCase()).join(", ") + " terhadap target",
      brief.klaim.length > 0
        ? "Menilai klaim " + brief.klaim.join(", ").toLowerCase()
        : "Menilai sensori dasar produk",
    ],
    hipotesis:
      "Formula usulan menghasilkan " +
      prediksi
        .map((p) => p.label.toLowerCase() + " sekitar " + p.prediksi + " " + p.unit)
        .join(", ") +
      " dan memenuhi jendela target yang ditetapkan.",
    prosedur: [
      "Timbang seluruh bahan sesuai tabel formula dan catat nomor lot",
      "Panaskan fase A dan fase B terpisah sampai 75 C",
      "Homogenisasi campuran pada 3200 rpm selama 8 menit",
      "Dinginkan ke 40 C lalu tambahkan bahan aktif dan pengawet",
      "Ambil sampel untuk pembacaan sensor pada T0, T24 jam, dan T7 hari",
    ],
    bahan: bahan.map((b) => ({ ...b })),
    hasil: targets.map((t) => ({ paramId: t.id, nilai: null, sumber: "sensor" as const })),
    observasi: "",
    feedback: "",
  };
}

export function evaluasiBatch(
  batch: Batch,
  targets: TargetParam[],
  feedback: string,
): BatchEvaluation {
  const kekurangan: string[] = [];
  const rekomendasi: string[] = [];
  const perubahanFormula: BatchEvaluation["perubahanFormula"] = [];
  let lolos = 0;

  for (const t of targets) {
    const hasil = batch.hasil.find((h) => h.paramId === t.id);
    if (!hasil || hasil.nilai === null) {
      kekurangan.push(t.label + " belum terisi, data sensor perlu dilengkapi");
      continue;
    }
    const delta = hasil.nilai - t.target;
    if (Math.abs(delta) <= t.toleransi) {
      lolos += 1;
      continue;
    }
    const arah = delta > 0 ? "di atas" : "di bawah";
    kekurangan.push(
      t.label + " " + arah + " target sebesar " + Math.abs(Number(delta.toFixed(2))) + " " + t.unit,
    );

    if (t.id === "ph") {
      rekomendasi.push(
        delta > 0
          ? "Tambahkan larutan asam sitrat bertahap 0.05 persen sampai pH menyentuh target"
          : "Netralkan dengan trietanolamin 0.05 persen",
      );
    }
    if (t.id === "viskositas") {
      const cet = batch.bahan.find((b) => b.id === "cetearyl");
      rekomendasi.push(
        delta > 0
          ? "Turunkan pengental struktural sekitar 0.5 persen"
          : "Naikkan pengental struktural sekitar 1 persen",
      );
      if (cet) {
        perubahanFormula.push({
          bahan: cet.name,
          dari: cet.percent,
          ke: Number((cet.percent + (delta > 0 ? -0.5 : 1)).toFixed(2)),
          alasan: "Mengarahkan viskositas ke jendela target",
        });
      }
    }
    if (t.id === "ukuran_droplet") {
      rekomendasi.push("Perpanjang homogenisasi menjadi 10 menit pada 3400 rpm");
      const gms = batch.bahan.find((b) => b.id === "gms");
      if (gms && delta > 0) {
        perubahanFormula.push({
          bahan: gms.name,
          dari: gms.percent,
          ke: Number((gms.percent + 0.5).toFixed(2)),
          alasan: "Memperkecil droplet emulsi",
        });
      }
    }
    if (t.id === "turbiditas")
      rekomendasi.push("Saring sampel pada 5 mikron dan periksa dispersi serbuk");
  }

  const clashes = deteksiClash(batch.bahan);
  for (const c of clashes)
    rekomendasi.push("Pisahkan fase " + c.a + " dan " + c.b + " atau sesuaikan pH kerja");

  const kepatuhan = ringkasKepatuhan(batch.bahan);
  for (const b of kepatuhan.syubhat)
    kekurangan.push("Status halal " + b.name + " masih perlu verifikasi dokumen pemasok");
  for (const b of kepatuhan.melanggar) kekurangan.push("Kadar " + b.name + " melewati batas BPOM");

  if (feedback.trim().length > 0)
    rekomendasi.push("Tindak lanjuti catatan peneliti: " + feedback.trim());
  if (batch.observasi.toLowerCase().includes("pisah")) {
    kekurangan.push("Terlihat tanda pemisahan fase pada observasi visual");
    rekomendasi.push("Tambahkan uji sentrifugasi 3000 rpm selama 30 menit pada batch berikutnya");
  }

  const skor = Math.round(
    (lolos / Math.max(targets.length, 1)) * 100 - kepatuhan.syubhat.length * 4 - clashes.length * 3,
  );

  return {
    ringkasan:
      "Batch " +
      batch.nomor +
      " memenuhi " +
      lolos +
      " dari " +
      targets.length +
      " parameter target. " +
      (kekurangan.length === 0
        ? "Tidak ada temuan kritis, formula siap masuk tahap serah terima."
        : "Terdapat " +
          kekurangan.length +
          " temuan yang perlu ditindaklanjuti pada batch berikutnya."),
    kekurangan,
    rekomendasi:
      rekomendasi.length > 0
        ? rekomendasi
        : ["Pertahankan parameter proses saat ini dan lanjutkan uji stabilitas 28 hari"],
    perubahanFormula,
    rancanganBerikutnya: {
      tujuan:
        kekurangan.length === 0
          ? ["Konfirmasi kestabilan 28 hari", "Uji sensori panel internal"]
          : kekurangan.slice(0, 3).map((k) => "Memperbaiki " + k.toLowerCase()),
      fokusUji: targets.map((t) => t.label),
      hipotesis:
        kekurangan.length === 0
          ? "Formula saat ini stabil sepanjang periode uji lanjutan."
          : "Penyesuaian formula dan parameter proses akan membawa seluruh parameter ke dalam jendela target.",
    },
    skorKesesuaian: Math.max(0, Math.min(100, skor)),
  };
}

export function targetDefault(kategori?: string): TargetParam[] {
  if (kategori) {
    const t = targetDariId(kategoriDef(kategori).params);
    if (t.length > 0) return t;
  }
  return TARGET_PRESET.map((t) => ({ ...t }));
}

export function ringkasBiaya(list: Ingredient[]) {
  return hitungHpp(list);
}

const KLAIM_BENTUK: Record<string, string[]> = {
  Pembersih: [
    "Kontrol minyak",
    "Mengurangi jerawat",
    "Non komedogenik",
    "Eksfoliasi lembut",
    "Menyegarkan dan mendinginkan",
    "Bebas alkohol",
    "Mengecilkan tampilan pori",
    "Mengurangi kulit kusam",
  ],
  Toner: [
    "Menenangkan kulit",
    "Mengurangi kemerahan",
    "Eksfoliasi lembut",
    "Melembapkan",
    "Mengecilkan tampilan pori",
    "Meratakan warna kulit",
    "Bebas alkohol",
  ],
  Essence: [
    "Melembapkan",
    "Melembapkan 24 jam",
    "Memperbaiki skin barrier",
    "Ringan dan cepat meresap",
    "Menghaluskan tekstur kulit",
  ],
  Serum: [
    "Mencerahkan",
    "Anti penuaan",
    "Menyamarkan garis halus",
    "Mengencangkan kulit",
    "Menyamarkan bekas jerawat",
    "Meratakan warna kulit",
    "Mengurangi jerawat",
    "Memperbaiki skin barrier",
    "Anti polusi",
    "Ringan dan cepat meresap",
  ],
  Pelembap: [
    "Melembapkan 24 jam",
    "Memperbaiki skin barrier",
    "Menutrisi kulit kering",
    "Tidak lengket",
    "Non komedogenik",
    "Menenangkan kulit",
    "Cocok dipakai di bawah riasan",
  ],
  Masker: [
    "Mencerahkan",
    "Menenangkan kulit",
    "Melembapkan",
    "Mengecilkan tampilan pori",
    "Menghaluskan tekstur kulit",
  ],
  "Tabir Surya": [
    "Perlindungan UV",
    "Tanpa whitecast",
    "Tahan air",
    "Tidak lengket",
    "Cocok dipakai di bawah riasan",
    "Melindungi dari sinar biru",
    "Non komedogenik",
  ],
  "Perawatan Mata": [
    "Menyamarkan garis halus",
    "Mengencangkan kulit",
    "Melembapkan",
    "Aman untuk kulit sensitif",
  ],
  "Perawatan Bibir": [
    "Melembapkan 24 jam",
    "Menutrisi kulit kering",
    "Eksfoliasi lembut",
    "Bebas pewangi",
  ],
  "Perawatan Tubuh": [
    "Mencerahkan",
    "Melembapkan 24 jam",
    "Menutrisi kulit kering",
    "Ringan dan cepat meresap",
    "Halal dan aman untuk keluarga",
  ],
  "Perawatan Tangan": [
    "Melembapkan",
    "Memperbaiki skin barrier",
    "Ringan dan cepat meresap",
    "Bebas pewangi",
  ],
  "Perawatan Wajah": ["Mencerahkan", "Melembapkan", "Menenangkan kulit", "Anti polusi"],
  "Perawatan Rambut": [
    "Menutrisi rambut rusak",
    "Mengurangi ketombe",
    "Bebas pewangi",
    "Vegan dan bebas uji hewan",
  ],
  Riasan: [
    "Cocok dipakai di bawah riasan",
    "Tahan air",
    "Non komedogenik",
    "Meratakan warna kulit",
    "Tidak lengket",
  ],
  "Perawatan Personal": [
    "Menyegarkan dan mendinginkan",
    "Bebas alkohol",
    "Halal dan aman untuk keluarga",
    "Bebas pewangi",
  ],
  "Perawatan Bayi": [
    "Aman untuk kulit sensitif",
    "Bebas pewangi",
    "Bebas alkohol",
    "Melembapkan",
    "Halal dan aman untuk keluarga",
  ],
};

const KLAIM_UMUM = [
  "Halal dan aman untuk keluarga",
  "Vegan dan bebas uji hewan",
  "Aman untuk kulit sensitif",
];

const KULIT_BENTUK: Record<string, string[]> = {
  Pembersih: [
    "Berminyak",
    "Kombinasi",
    "Berjerawat aktif",
    "Rawan komedo",
    "Kulit pria berminyak",
    "Kulit remaja",
    "Normal",
  ],
  Toner: ["Berminyak", "Kombinasi", "Kusam dan tidak merata", "Rawan komedo", "Sensitif", "Normal"],
  Essence: ["Dehidrasi", "Normal", "Kombinasi", "Barrier rusak"],
  Serum: [
    "Kusam dan tidak merata",
    "Hiperpigmentasi",
    "Matang dengan garis halus",
    "Berjerawat aktif",
    "Dehidrasi",
    "Barrier rusak",
    "Normal",
  ],
  Pelembap: [
    "Kering",
    "Dehidrasi",
    "Sensitif",
    "Barrier rusak",
    "Normal",
    "Kombinasi",
    "Berminyak",
  ],
  Masker: ["Kusam dan tidak merata", "Berminyak", "Kering", "Normal"],
  "Tabir Surya": [
    "Semua jenis kulit",
    "Sensitif terhadap matahari",
    "Berminyak",
    "Rawan komedo",
    "Kulit iklim tropis lembap",
  ],
  "Perawatan Mata": ["Matang dengan garis halus", "Sensitif", "Dehidrasi"],
  "Perawatan Bibir": ["Kering", "Sensitif", "Semua jenis kulit"],
  "Perawatan Tubuh": [
    "Kulit tubuh kering bersisik",
    "Kusam dan tidak merata",
    "Normal",
    "Semua jenis kulit",
  ],
  "Perawatan Tangan": ["Kulit tubuh kering bersisik", "Barrier rusak", "Sensitif"],
  "Perawatan Wajah": ["Semua jenis kulit", "Normal", "Kombinasi"],
  "Perawatan Rambut": ["Semua jenis kulit", "Sensitif"],
  Riasan: ["Berminyak", "Kombinasi", "Normal", "Rawan komedo"],
  "Perawatan Personal": ["Semua jenis kulit", "Sensitif"],
  "Perawatan Bayi": ["Kulit bayi", "Sensitif"],
};

export function klaimUntukKategori(kategori: string): string[] {
  const bentuk = kategoriDef(kategori).bentuk;
  const daftar = KLAIM_BENTUK[bentuk] ?? KLAIM_OPSI.slice(0, 10);
  return Array.from(new Set([...daftar, ...KLAIM_UMUM]));
}

export function tipeKulitUntukKategori(kategori: string): string[] {
  const bentuk = kategoriDef(kategori).bentuk;
  const daftar = KULIT_BENTUK[bentuk] ?? TIPE_KULIT_OPSI.slice(0, 8);
  return Array.from(new Set([...daftar, "Semua jenis kulit"]));
}

export function paramUntukKategori(kategori: string): string[] {
  return kategoriDef(kategori).params;
}

export function formulaDariProyek(p: Project): Ingredient[] {
  const batch = p.batches[p.batches.length - 1];
  if (!batch) return [];
  return batch.bahan.map((b) => ({ ...b }));
}
