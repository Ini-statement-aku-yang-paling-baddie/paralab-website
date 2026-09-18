import { BAHAN_LIBRARY, hitungHpp, type Ingredient } from "./data";

/* ============================================================
   1. Cost and Sustainability Impact Estimator
   ============================================================ */

export type SumberBahan = "nabati terbarukan" | "fermentasi" | "mineral" | "sintetis" | "hewani";

export type ProfilKeberlanjutan = {
  biodeg: number;
  sumber: SumberBahan;
  co2: number;
  air: number;
  catatan: string;
};

const SUMBER_GOLONGAN: Record<string, SumberBahan> = {
  Pelarut: "mineral",
  Humektan: "nabati terbarukan",
  Emolien: "nabati terbarukan",
  Emulsifier: "nabati terbarukan",
  Polimer: "sintetis",
  "Polimer dan Pengental": "sintetis",
  Pengental: "sintetis",
  Surfaktan: "nabati terbarukan",
  Pengawet: "sintetis",
  "UV Filter": "mineral",
  Peptida: "fermentasi",
  Vitamin: "sintetis",
  "Asam Eksfolian": "sintetis",
  Retinoid: "sintetis",
  "Ekstrak Botani": "nabati terbarukan",
  Pewangi: "sintetis",
  "Penyesuai pH": "sintetis",
  Antioksidan: "nabati terbarukan",
  Mineral: "mineral",
};

const BIODEG_SUMBER: Record<SumberBahan, number> = {
  "nabati terbarukan": 88,
  fermentasi: 84,
  mineral: 45,
  sintetis: 52,
  hewani: 76,
};

const CO2_SUMBER: Record<SumberBahan, number> = {
  "nabati terbarukan": 2.4,
  fermentasi: 3.1,
  mineral: 1.6,
  sintetis: 6.2,
  hewani: 8.4,
};

const KHUSUS: Record<string, Partial<ProfilKeberlanjutan>> = {
  aqua: {
    biodeg: 100,
    sumber: "mineral",
    co2: 0.05,
    air: 1,
    catatan: "Air demineralisasi, dampak utama pada energi pemurnian.",
  },
  glycerin: {
    biodeg: 96,
    sumber: "nabati terbarukan",
    co2: 1.9,
    catatan: "Gliserin nabati, sisa proses biodiesel, mudah terurai.",
  },
  squalane: {
    biodeg: 92,
    sumber: "fermentasi",
    co2: 3.8,
    catatan: "Skualan tebu hasil fermentasi, bebas sumber hiu.",
  },
  jojoba: {
    biodeg: 90,
    sumber: "nabati terbarukan",
    co2: 4.6,
    catatan: "Minyak jojoba, kebutuhan lahan tinggi.",
  },
  carbomer: {
    biodeg: 18,
    sumber: "sintetis",
    co2: 7.8,
    catatan: "Polimer akrilat, terurai sangat lambat di perairan.",
  },
  xanthan: {
    biodeg: 94,
    sumber: "fermentasi",
    co2: 3.4,
    catatan: "Gom xanthan fermentasi, terurai cepat.",
  },
  phenoxy: {
    biodeg: 58,
    sumber: "sintetis",
    co2: 6.9,
    catatan: "Pengawet sintetis, pantau beban air limbah.",
  },
  parfum: {
    biodeg: 40,
    sumber: "sintetis",
    co2: 9.4,
    catatan: "Campuran pewangi, sebagian komponen persisten.",
  },
  zinc_oxide: {
    biodeg: 30,
    sumber: "mineral",
    co2: 5.1,
    catatan: "Mineral tambang, perhatikan dampak terumbu pada bentuk nano.",
  },
  clay: {
    biodeg: 35,
    sumber: "mineral",
    co2: 1.1,
    catatan: "Lempung tambang, jejak karbon rendah.",
  },
  kolagen: {
    biodeg: 92,
    sumber: "fermentasi",
    co2: 5.6,
    catatan: "Peptida rekombinan, pastikan sumber bukan hewani.",
  },
  tea_tree: {
    biodeg: 86,
    sumber: "nabati terbarukan",
    co2: 7.2,
    catatan: "Minyak atsiri, rendemen distilasi rendah sehingga jejak karbon naik.",
  },
};

export function profilKeberlanjutan(b: Ingredient): ProfilKeberlanjutan {
  const sumberDasar = SUMBER_GOLONGAN[b.golongan] ?? "sintetis";
  const dasar: ProfilKeberlanjutan = {
    biodeg: BIODEG_SUMBER[sumberDasar],
    sumber: sumberDasar,
    co2: CO2_SUMBER[sumberDasar],
    air: Math.round(12 + CO2_SUMBER[sumberDasar] * 4),
    catatan: "Estimasi kelas " + b.golongan.toLowerCase() + " dari basis data internal.",
  };
  const khusus = KHUSUS[b.id];
  if (!khusus) return dasar;
  const sumber = khusus.sumber ?? dasar.sumber;
  return {
    biodeg: khusus.biodeg ?? BIODEG_SUMBER[sumber],
    sumber,
    co2: khusus.co2 ?? CO2_SUMBER[sumber],
    air: khusus.air ?? Math.round(12 + (khusus.co2 ?? CO2_SUMBER[sumber]) * 4),
    catatan: khusus.catatan ?? dasar.catatan,
  };
}

export type RingkasSustain = {
  skor: number;
  peringkat: "sangat baik" | "baik" | "cukup" | "perlu perbaikan";
  biodegRata: number;
  co2PerUnit: number;
  airPerUnit: number;
  porsiTerbarukan: number;
  biayaPerUnit: number;
  biayaBahan: number;
  rincian: {
    nama: string;
    persen: number;
    biodeg: number;
    sumber: SumberBahan;
    co2: number;
    biaya: number;
    catatan: string;
  }[];
  penyumbangCo2: { nama: string; co2: number }[];
  penyumbangBiaya: { nama: string; biaya: number }[];
  sorotan: string[];
};

const MASSA_UNIT_KG = 0.05;

export function hitungSustain(bahan: Ingredient[]): RingkasSustain {
  const hpp = hitungHpp(bahan);
  if (bahan.length === 0) {
    return {
      skor: 0,
      peringkat: "perlu perbaikan",
      biodegRata: 0,
      co2PerUnit: 0,
      airPerUnit: 0,
      porsiTerbarukan: 0,
      biayaPerUnit: hpp.total,
      biayaBahan: hpp.per50ml,
      rincian: [],
      penyumbangCo2: [],
      penyumbangBiaya: [],
      sorotan: ["Belum ada bahan pada formula."],
    };
  }

  const total = bahan.reduce((t, b) => t + b.percent, 0) || 100;
  let biodeg = 0;
  let co2 = 0;
  let air = 0;
  let terbarukan = 0;

  const rincian = bahan.map((b) => {
    const p = profilKeberlanjutan(b);
    const fraksi = b.percent / total;
    const massaKg = (b.percent / 100) * MASSA_UNIT_KG;
    biodeg += p.biodeg * fraksi;
    co2 += p.co2 * massaKg * 1000;
    air += p.air * massaKg * 1000;
    if (p.sumber === "nabati terbarukan" || p.sumber === "fermentasi") terbarukan += fraksi;
    return {
      nama: b.name,
      persen: b.percent,
      biodeg: p.biodeg,
      sumber: p.sumber,
      co2: Number((p.co2 * massaKg * 1000).toFixed(2)),
      biaya: Math.round(massaKg * b.hargaPerKg),
      catatan: p.catatan,
    };
  });

  const skor = Math.max(
    0,
    Math.min(
      100,
      Math.round(biodeg * 0.5 + terbarukan * 100 * 0.3 + Math.max(0, 100 - co2 * 0.9) * 0.2),
    ),
  );

  const sorotan: string[] = [];
  const persisten = rincian.filter((r) => r.biodeg < 40).sort((a, b) => a.biodeg - b.biodeg);
  if (persisten[0])
    sorotan.push(
      persisten[0].nama +
        " sulit terurai, pertimbangkan pengental alami sebagai pengganti sebagian.",
    );
  const beratCo2 = [...rincian].sort((a, b) => b.co2 - a.co2)[0];
  if (beratCo2 && beratCo2.co2 > 1)
    sorotan.push(beratCo2.nama + " menyumbang jejak karbon terbesar pada formula ini.");
  const mahal = [...rincian].sort((a, b) => b.biaya - a.biaya)[0];
  if (mahal && mahal.biaya > 0)
    sorotan.push(mahal.nama + " menjadi penyumbang biaya bahan terbesar per unit.");
  if (terbarukan > 0.6)
    sorotan.push("Lebih dari 60 persen komposisi berasal dari sumber terbarukan.");
  if (sorotan.length === 0)
    sorotan.push("Komposisi seimbang, belum ada temuan keberlanjutan yang menonjol.");

  return {
    skor,
    peringkat:
      skor >= 80 ? "sangat baik" : skor >= 65 ? "baik" : skor >= 50 ? "cukup" : "perlu perbaikan",
    biodegRata: Math.round(biodeg),
    co2PerUnit: Number(co2.toFixed(1)),
    airPerUnit: Math.round(air),
    porsiTerbarukan: Math.round(terbarukan * 100),
    biayaPerUnit: hpp.total,
    biayaBahan: hpp.per50ml,
    rincian,
    penyumbangCo2: [...rincian]
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 5)
      .map((r) => ({ nama: r.nama, co2: r.co2 })),
    penyumbangBiaya: [...rincian]
      .sort((a, b) => b.biaya - a.biaya)
      .slice(0, 5)
      .map((r) => ({ nama: r.nama, biaya: r.biaya })),
    sorotan,
  };
}

/* ============================================================
   2. Ingredient Property Predictor (pendekatan QSPR sederhana)
   ============================================================ */

export type MolekulRingkas = {
  karbon: number;
  oksigen: number;
  nitrogen: number;
  cincin: number;
  ikatanRangkap: number;
  aromatik: number;
  gugusAsam: number;
  gugusHidroksil: number;
  gugusAmina: number;
  bm: number;
  logp: number;
};

export function bacaSmiles(smiles: string): MolekulRingkas {
  const s = smiles.trim();
  const karbon = (s.match(/C(?![larou])/g) ?? []).length + (s.match(/c/g) ?? []).length;
  const oksigen = (s.match(/O/g) ?? []).length + (s.match(/o/g) ?? []).length;
  const nitrogen = (s.match(/N/g) ?? []).length + (s.match(/n/g) ?? []).length;
  const cincin = new Set(s.match(/\d/g) ?? []).size;
  const ikatanRangkap = (s.match(/=/g) ?? []).length;
  const aromatik = (s.match(/[cnos]/g) ?? []).length;
  const gugusAsam = (s.match(/C\(=O\)O/g) ?? []).length;
  const gugusHidroksil = Math.max(0, oksigen - gugusAsam * 2 - (s.match(/C\(=O\)/g) ?? []).length);
  const gugusAmina = nitrogen;
  const bm = Number(
    (
      karbon * 12.011 +
      oksigen * 15.999 +
      nitrogen * 14.007 +
      Math.max(0, karbon * 2 - ikatanRangkap * 2 + 2) * 1.008
    ).toFixed(1),
  );
  const logp = Number(
    (karbon * 0.52 - oksigen * 0.92 - nitrogen * 0.85 - gugusAsam * 0.6 + aromatik * 0.12).toFixed(
      2,
    ),
  );
  return {
    karbon,
    oksigen,
    nitrogen,
    cincin,
    ikatanRangkap,
    aromatik,
    gugusAsam,
    gugusHidroksil,
    gugusAmina,
    bm,
    logp,
  };
}

export type PrediksiSifat = {
  label: string;
  nilai: string;
  angka: number;
  skala: number;
  unit: string;
  keyakinan: number;
  catatan: string;
  tingkat: "aman" | "waspada" | "bahaya";
};

export type HasilPrediktor = {
  molekul: MolekulRingkas;
  sifat: PrediksiSifat[];
  radar: { sumbu: string; nilai: number }[];
  kelarutanKurva: { pelarut: string; kelarutan: number }[];
  ringkasan: string;
  miripDengan: { nama: string; kemiripan: number; golongan: string }[];
};

export function prediksiSifatBahan(input: {
  nama: string;
  smiles: string;
  kemurnian: number;
}): HasilPrediktor {
  const m = bacaSmiles(input.smiles || "CCO");
  const hlb = Math.max(
    0,
    Math.min(
      20,
      Number((20 * ((m.oksigen * 16 + m.nitrogen * 14) / Math.max(m.bm, 1))).toFixed(1)),
    ),
  );
  const kelarutanAir = Math.max(0, Math.min(100, Math.round(92 - m.logp * 18)));
  const viskositas = Math.round(
    Math.max(1, Math.pow(Math.max(m.karbon, 1), 1.7) * 0.9 + m.gugusHidroksil * 26),
  );
  const komedogenik = Math.max(
    0,
    Math.min(
      5,
      Number((m.logp * 0.42 + Math.max(0, m.karbon - 12) * 0.12 - m.oksigen * 0.18).toFixed(1)),
    ),
  );
  const iritasi = Math.max(
    0,
    Math.min(
      10,
      Number(
        (
          m.gugusAsam * 2.4 +
          m.gugusAmina * 1.4 +
          m.aromatik * 0.22 +
          Math.max(0, 3 - m.oksigen) * 0.5
        ).toFixed(1),
      ),
    ),
  );
  const penetrasi = Math.max(
    0,
    Math.min(100, Math.round(100 - Math.abs(m.logp - 2.5) * 16 - Math.max(0, m.bm - 500) * 0.06)),
  );
  const stabilitasOks = Math.max(
    0,
    Math.min(100, Math.round(95 - m.ikatanRangkap * 11 - m.gugusHidroksil * 3)),
  );

  const keyakinanDasar = Math.round(
    58 + Math.min(28, m.karbon * 1.3) + (input.kemurnian >= 98 ? 8 : 0),
  );
  const kep = (delta: number) => Math.max(42, Math.min(94, keyakinanDasar + delta));

  const sifat: PrediksiSifat[] = [
    {
      label: "Log P prediksi",
      nilai: String(m.logp),
      angka: m.logp,
      skala: Math.max(0, Math.min(100, (m.logp + 3) * 12)),
      unit: "",
      keyakinan: kep(6),
      catatan: "Nilai 1 sampai 3 umumnya ideal untuk penetrasi kulit.",
      tingkat: m.logp > 5 || m.logp < -2 ? "waspada" : "aman",
    },
    {
      label: "Bobot molekul",
      nilai: String(m.bm),
      angka: m.bm,
      skala: Math.max(0, Math.min(100, 100 - m.bm / 12)),
      unit: "g/mol",
      keyakinan: kep(10),
      catatan: "Di atas 500 g/mol penetrasi stratum korneum menurun tajam.",
      tingkat: m.bm > 500 ? "waspada" : "aman",
    },
    {
      label: "Nilai HLB",
      nilai: String(hlb),
      angka: hlb,
      skala: hlb * 5,
      unit: "",
      keyakinan: kep(-4),
      catatan:
        hlb >= 10
          ? "Cenderung larut air, cocok untuk sistem minyak dalam air."
          : "Cenderung larut minyak, cocok untuk sistem air dalam minyak.",
      tingkat: "aman",
    },
    {
      label: "Kelarutan dalam air",
      nilai: String(kelarutanAir),
      angka: kelarutanAir,
      skala: kelarutanAir,
      unit: "skor",
      keyakinan: kep(0),
      catatan: "Skor rendah berarti perlu kosolven atau solubilizer.",
      tingkat: kelarutanAir < 25 ? "waspada" : "aman",
    },
    {
      label: "Viskositas intrinsik",
      nilai: String(viskositas),
      angka: viskositas,
      skala: Math.min(100, viskositas / 30),
      unit: "cP",
      keyakinan: kep(-8),
      catatan: "Perkiraan pada 25 C untuk bahan murni.",
      tingkat: "aman",
    },
    {
      label: "Potensi komedogenik",
      nilai: String(komedogenik),
      angka: komedogenik,
      skala: komedogenik * 20,
      unit: "skala 0 sampai 5",
      keyakinan: kep(-6),
      catatan: "Nilai di atas 3 berisiko untuk produk kulit berjerawat.",
      tingkat: komedogenik >= 3 ? "bahaya" : komedogenik >= 2 ? "waspada" : "aman",
    },
    {
      label: "Risiko iritasi kulit",
      nilai: String(iritasi),
      angka: iritasi,
      skala: iritasi * 10,
      unit: "skala 0 sampai 10",
      keyakinan: kep(-10),
      catatan: "Nilai di atas 5 memerlukan uji tempel awal sebelum uji klinis.",
      tingkat: iritasi >= 5 ? "bahaya" : iritasi >= 3 ? "waspada" : "aman",
    },
    {
      label: "Penetrasi kulit",
      nilai: String(penetrasi),
      angka: penetrasi,
      skala: penetrasi,
      unit: "skor",
      keyakinan: kep(-6),
      catatan: "Skor tinggi berarti bahan mudah menembus lapisan tanduk.",
      tingkat: "aman",
    },
    {
      label: "Stabilitas oksidatif",
      nilai: String(stabilitasOks),
      angka: stabilitasOks,
      skala: stabilitasOks,
      unit: "skor",
      keyakinan: kep(-2),
      catatan: "Skor rendah menuntut antioksidan dan kemasan kedap udara.",
      tingkat: stabilitasOks < 55 ? "waspada" : "aman",
    },
  ];

  const radar = [
    { sumbu: "Kelarutan air", nilai: kelarutanAir },
    { sumbu: "Penetrasi", nilai: penetrasi },
    { sumbu: "Stabilitas", nilai: stabilitasOks },
    { sumbu: "Keamanan", nilai: Math.round(100 - iritasi * 10) },
    { sumbu: "Non komedogenik", nilai: Math.round(100 - komedogenik * 20) },
    { sumbu: "Kompatibilitas", nilai: Math.round(Math.max(20, 100 - Math.abs(hlb - 10) * 6)) },
  ];

  const kelarutanKurva = [
    { pelarut: "Air", kelarutan: kelarutanAir },
    {
      pelarut: "Gliserin",
      kelarutan: Math.max(0, Math.min(100, Math.round(kelarutanAir * 0.86 + 8))),
    },
    {
      pelarut: "Butilen glikol",
      kelarutan: Math.max(0, Math.min(100, Math.round(70 - m.logp * 6))),
    },
    { pelarut: "Etanol", kelarutan: Math.max(0, Math.min(100, Math.round(62 + m.logp * 5))) },
    {
      pelarut: "Kaprilik trigliserida",
      kelarutan: Math.max(0, Math.min(100, Math.round(20 + m.logp * 17))),
    },
    { pelarut: "Skualan", kelarutan: Math.max(0, Math.min(100, Math.round(12 + m.logp * 19))) },
  ];

  const miripDengan = BAHAN_LIBRARY.map((b) => {
    const beda = Math.abs(b.bm - m.bm) / 400;
    return {
      nama: b.name,
      golongan: b.golongan,
      kemiripan: Math.max(0, Math.round(100 - beda * 100)),
    };
  })
    .sort((a, b) => b.kemiripan - a.kemiripan)
    .slice(0, 5);

  const ringkasan =
    (input.nama || "Bahan uji") +
    " diperkirakan bersifat " +
    (m.logp > 3 ? "lipofilik" : m.logp < 0 ? "hidrofilik kuat" : "amfifilik seimbang") +
    " dengan HLB " +
    hlb +
    ". " +
    (iritasi >= 5
      ? "Risiko iritasi tinggi, lakukan uji tempel skala kecil sebelum membeli dalam jumlah besar."
      : komedogenik >= 3
        ? "Potensi komedogenik tinggi, hindari untuk kategori kulit berjerawat."
        : "Profil awal layak untuk skrining virtual lanjut dan pembelian sampel skala kecil.");

  return { molekul: m, sifat, radar, kelarutanKurva, ringkasan, miripDengan };
}

/* ============================================================
   3. Prediksi uji jangka panjang: oksidasi, umur simpan, stabilitas
   ============================================================ */

export type PrediksiJangkaPanjang = {
  umurSimpanBulan: number;
  paoBulan: number;
  tanggalKadaluarsa: string;
  energiAktivasi: number;
  kurva: {
    bulan: number;
    kadar25: number;
    kadar40: number;
    peroksida: number;
    deltaE: number;
    ph: number;
  }[];
  arrhenius: { suhu: string; lajuHarian: number; umurBulan: number }[];
  risiko: { label: string; skor: number; catatan: string }[];
  catatan: string[];
};

export function prediksiJangkaPanjang(bahan: Ingredient[]): PrediksiJangkaPanjang {
  const total = bahan.reduce((t, b) => t + b.percent, 0) || 100;
  const minyak = bahan
    .filter((b) => b.golongan.includes("Emolien") || ["jojoba", "squalane"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);
  const sensitifCahaya = bahan
    .filter((b) => ["retinol", "vitc", "laa", "retinal", "aha"].includes(b.id))
    .reduce((t, b) => t + b.percent, 0);
  const pengawet = bahan
    .filter((b) => b.golongan.toLowerCase().includes("pengawet"))
    .reduce((t, b) => t + b.percent, 0);
  const air = bahan.find((b) => b.id === "aqua")?.percent ?? 0;

  const lajuDasar = 0.00012 + sensitifCahaya * 0.00004 + minyak * 0.000012;
  const energiAktivasi = Number((78 - sensitifCahaya * 1.6 + pengawet * 2.1).toFixed(1));
  const faktor40 = Math.pow(2.4, 1.5);

  const kurva = [0, 1, 2, 3, 6, 9, 12, 18, 24].map((bulan) => {
    const hari = bulan * 30;
    const kadar25 = Number((100 * Math.exp(-lajuDasar * hari)).toFixed(1));
    const kadar40 = Number((100 * Math.exp(-lajuDasar * faktor40 * hari)).toFixed(1));
    const peroksida = Number(
      Math.min(30, (minyak / Math.max(total, 1)) * 100 * 0.06 * bulan + bulan * 0.12).toFixed(2),
    );
    const deltaE = Number(Math.min(12, (sensitifCahaya * 0.045 + 0.05) * bulan).toFixed(2));
    const ph = Number((5.5 - bulan * 0.008 - sensitifCahaya * 0.0009 * bulan).toFixed(2));
    return { bulan, kadar25, kadar40, peroksida, deltaE, ph };
  });

  const umurSimpanBulan = Math.max(1, Math.round(Math.log(100 / 90) / lajuDasar / 30));
  const pao = Math.max(
    3,
    Math.min(24, Math.round(umurSimpanBulan * (pengawet > 0.6 ? 0.75 : 0.5))),
  );
  const kadaluarsa = new Date();
  kadaluarsa.setMonth(kadaluarsa.getMonth() + umurSimpanBulan);

  const arrhenius = [
    { suhu: "4 C", faktor: 0.42 },
    { suhu: "25 C", faktor: 1 },
    { suhu: "37 C", faktor: 2.6 },
    { suhu: "40 C", faktor: faktor40 },
    { suhu: "45 C", faktor: 5.4 },
    { suhu: "50 C", faktor: 8.1 },
  ].map((x) => ({
    suhu: x.suhu,
    lajuHarian: Number((lajuDasar * x.faktor * 100).toFixed(3)),
    umurBulan: Math.max(0.5, Number((umurSimpanBulan / x.faktor).toFixed(1))),
  }));

  const risiko = [
    {
      label: "Oksidasi minyak",
      skor: Math.min(100, Math.round((minyak / Math.max(total, 1)) * 260)),
      catatan:
        "Nilai peroksida diprediksi mencapai " +
        kurva[kurva.length - 1]!.peroksida +
        " meq per kg pada bulan ke 24.",
    },
    {
      label: "Perubahan warna",
      skor: Math.min(100, Math.round(sensitifCahaya * 5 + 8)),
      catatan:
        "Delta E prediksi " + kurva[kurva.length - 1]!.deltaE + " pada penyimpanan suhu ruang.",
    },
    {
      label: "Penurunan kadar aktif",
      skor: Math.min(100, Math.round((100 - kurva[6]!.kadar25) * 6)),
      catatan: "Kadar aktif prediksi " + kurva[6]!.kadar25 + " persen pada bulan ke 12.",
    },
    {
      label: "Risiko mikroba",
      skor: Math.max(0, Math.min(100, Math.round(air * 0.7 - pengawet * 32))),
      catatan:
        pengawet > 0.6
          ? "Sistem pengawet memadai untuk sistem berair."
          : "Kadar pengawet rendah untuk sistem berair, jalankan uji tantangan mikroba.",
    },
    {
      label: "Pergeseran pH",
      skor: Math.min(100, Math.round(Math.abs(5.5 - kurva[kurva.length - 1]!.ph) * 60)),
      catatan: "pH prediksi " + kurva[kurva.length - 1]!.ph + " pada bulan ke 24.",
    },
  ];

  const catatan = [
    "Prediksi memakai model Arrhenius dengan energi aktivasi " +
      energiAktivasi +
      " kJ per mol dan faktor percepatan Q10 sebesar 2.4.",
    "Uji nyata tetap wajib: penyimpanan real time 12 bulan, accelerated 40 C selama 3 bulan, fotostabilitas, dan siklus beku cair.",
    "Gunakan prediksi ini untuk memilih kondisi uji dan kemasan sebelum uji panjang dijalankan.",
  ];

  return {
    umurSimpanBulan,
    paoBulan: pao,
    tanggalKadaluarsa: kadaluarsa.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    energiAktivasi,
    kurva,
    arrhenius,
    risiko,
    catatan,
  };
}

/* ============================================================
   4. Hands free voice logging: penstrukturan bahasa formulasi
   ============================================================ */

export type UcapanTerstruktur = {
  bahan: { nama: string; id: string | null; persen: number }[];
  parameter: { label: string; nilai: number; unit: string }[];
  observasi: string[];
  mentah: string;
};

const KATA_ANGKA: Record<string, number> = {
  nol: 0,
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
};

const PARAM_UCAP: { kunci: string[]; label: string; unit: string }[] = [
  { kunci: ["ph", "pe ha"], label: "pH", unit: "" },
  { kunci: ["viskositas", "kekentalan"], label: "Viskositas", unit: "cP" },
  { kunci: ["suhu", "temperatur"], label: "Suhu proses", unit: "°C" },
  { kunci: ["rpm", "putaran", "kecepatan"], label: "Kecepatan pengaduk", unit: "rpm" },
  { kunci: ["turbiditas", "kekeruhan"], label: "Turbiditas", unit: "NTU" },
  { kunci: ["densitas", "berat jenis"], label: "Densitas", unit: "g/mL" },
  { kunci: ["konduktivitas"], label: "Konduktivitas", unit: "µS/cm" },
  { kunci: ["droplet", "ukuran partikel"], label: "Ukuran droplet", unit: "µm" },
];

function keAngka(teks: string): number | null {
  const bersih = teks.replace(",", ".");
  const angka = Number(bersih);
  if (!Number.isNaN(angka)) return angka;
  const kata = KATA_ANGKA[bersih.toLowerCase()];
  return kata === undefined ? null : kata;
}

export function strukturkanUcapan(teks: string): UcapanTerstruktur {
  const kalimat = teks
    .toLowerCase()
    .split(/[,.;]|\bdan\b|\blalu\b|\bkemudian\b/)
    .map((s) => s.trim())
    .filter(Boolean);

  const bahan: UcapanTerstruktur["bahan"] = [];
  const parameter: UcapanTerstruktur["parameter"] = [];
  const observasi: string[] = [];

  for (const k of kalimat) {
    let tertangkap = false;

    const cocokBahan = k.match(
      /(?:tambah|tambahkan|masukkan|timbang|naikkan|turunkan)?\s*([\d.,]+|\w+)\s*(?:persen|%)\s*([a-z0-9\s-]+)/,
    );
    if (cocokBahan) {
      const nilai = keAngka(cocokBahan[1]!);
      const nama = (cocokBahan[2] ?? "").trim();
      if (nilai !== null && nama.length > 2) {
        const ref = BAHAN_LIBRARY.find(
          (b) =>
            b.name.toLowerCase().includes(nama) ||
            nama.includes(b.name.toLowerCase()) ||
            b.inci.toLowerCase().includes(nama),
        );
        bahan.push({ nama: ref?.name ?? nama, id: ref?.id ?? null, persen: nilai });
        tertangkap = true;
      }
    }

    for (const p of PARAM_UCAP) {
      if (tertangkap) break;
      const kunci = p.kunci.find((x) => k.includes(x));
      if (!kunci) continue;
      const sisa = k.slice(k.indexOf(kunci) + kunci.length);
      const cocok = sisa.match(/(-?[\d.,]+)/) ?? k.match(/(-?[\d.,]+)/);
      const nilai = cocok ? keAngka(cocok[1]!) : null;
      if (nilai !== null) {
        parameter.push({ label: p.label, nilai, unit: p.unit });
        tertangkap = true;
      }
    }

    if (!tertangkap && k.length > 3) observasi.push(k.charAt(0).toUpperCase() + k.slice(1));
  }

  return { bahan, parameter, observasi, mentah: teks.trim() };
}

/* ============================================================
   5. Analisis citra sampel untuk prediksi mikrostruktur
   ============================================================ */

export type AnalisaCitra = {
  homogenitas: number;
  estimasiDroplet: number;
  indeksPolidispersi: number;
  skorPemisahan: number;
  warna: { r: number; g: number; b: number };
  kecerahan: number;
  histogram: { bin: string; jumlah: number }[];
  distribusi: { ukuran: number; volume: number }[];
  kesimpulan: string;
};

export function analisaPiksel(
  data: Uint8ClampedArray,
  lebar: number,
  tinggi: number,
): AnalisaCitra {
  let r = 0;
  let g = 0;
  let b = 0;
  const abu: number[] = [];
  const bins = new Array(10).fill(0) as number[];

  for (let i = 0; i < data.length; i += 4) {
    const pr = data[i] ?? 0;
    const pg = data[i + 1] ?? 0;
    const pb = data[i + 2] ?? 0;
    r += pr;
    g += pg;
    b += pb;
    const nilai = (pr * 0.299 + pg * 0.587 + pb * 0.114) / 255;
    abu.push(nilai);
    bins[Math.min(9, Math.floor(nilai * 10))] =
      (bins[Math.min(9, Math.floor(nilai * 10))] ?? 0) + 1;
  }

  const n = abu.length || 1;
  const rata = abu.reduce((t, x) => t + x, 0) / n;
  const varians = abu.reduce((t, x) => t + (x - rata) * (x - rata), 0) / n;
  const sd = Math.sqrt(varians);

  let gradien = 0;
  for (let y = 1; y < tinggi; y += 2) {
    for (let x = 1; x < lebar; x += 2) {
      const i = y * lebar + x;
      const kiri = abu[i - 1] ?? 0;
      const atas = abu[i - lebar] ?? 0;
      gradien += Math.abs((abu[i] ?? 0) - kiri) + Math.abs((abu[i] ?? 0) - atas);
    }
  }
  const gradienRata = gradien / Math.max(1, (lebar * tinggi) / 4);

  const homogenitas = Math.max(0, Math.min(100, Math.round(100 - sd * 190 - gradienRata * 120)));
  const estimasiDroplet = Number(Math.max(0.4, 1.2 + gradienRata * 42 + sd * 9).toFixed(2));
  const indeksPolidispersi = Number(
    Math.max(0.05, Math.min(0.9, sd * 1.9 + gradienRata * 2.2)).toFixed(3),
  );

  const barisAtas =
    abu.slice(0, Math.floor(n / 4)).reduce((t, x) => t + x, 0) / Math.max(1, Math.floor(n / 4));
  const barisBawah =
    abu.slice(Math.floor((n * 3) / 4)).reduce((t, x) => t + x, 0) /
    Math.max(1, n - Math.floor((n * 3) / 4));
  const skorPemisahan = Math.max(
    0,
    Math.min(100, Math.round(Math.abs(barisAtas - barisBawah) * 260)),
  );

  const distribusi = Array.from({ length: 12 }, (_, i) => {
    const ukuran = Number((estimasiDroplet * (0.35 + i * 0.16)).toFixed(2));
    const lebarKurva = Math.max(0.15, indeksPolidispersi);
    const eksp = -Math.pow(Math.log(ukuran / estimasiDroplet), 2) / (2 * lebarKurva * lebarKurva);
    return { ukuran, volume: Number((Math.exp(eksp) * 100).toFixed(1)) };
  });

  const kesimpulan =
    homogenitas >= 75
      ? "Sampel tampak homogen, tidak terlihat indikasi pemisahan fase pada citra."
      : skorPemisahan > 45
        ? "Terdeteksi perbedaan kecerahan antara bagian atas dan bawah, indikasi awal krimming atau pemisahan fase."
        : "Tekstur citra kasar, kemungkinan agregat atau distribusi droplet lebar. Perpanjang homogenisasi lalu ulangi pencitraan.";

  return {
    homogenitas,
    estimasiDroplet,
    indeksPolidispersi,
    skorPemisahan,
    warna: { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) },
    kecerahan: Math.round(rata * 100),
    histogram: bins.map((jumlah, i) => ({ bin: i * 10 + " sampai " + (i * 10 + 10), jumlah })),
    distribusi,
    kesimpulan,
  };
}
