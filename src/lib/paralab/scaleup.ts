import { formatRupiah, hitungHpp, type Batch, type Ingredient, type Project } from "./data";
import { ringkasKepatuhan } from "./ai";
import { hitungSustain } from "./prediksi";

export type RisikoParameter = {
  parameter: string;
  skor: number;
  arah: string;
  pemicu: string;
  pengawasan: string;
};

export type LaranganProduksi = {
  judul: string;
  isi: string;
};

export type ScaleUpBrief = {
  skor: number;
  tingkat: "rendah" | "sedang" | "tinggi";
  ringkasan: string;
  parameter: RisikoParameter[];
  tahapan: { skala: string; catatan: string }[];
  halal: string;
  klaim: string[];
  hpp: { label: string; nilai: string }[];
  larangan: LaranganProduksi[];
  rujukan: string[];
};

function punya(b: Ingredient[], kata: string[]) {
  return b.filter((x) => kata.some((k) => (x.golongan + " " + x.name + " " + x.fungsi + " " + x.inci).toLowerCase().includes(k)));
}

export function susunScaleUpBrief(proyek: Project, batch: Batch): ScaleUpBrief {
  const bahan = batch.bahan;
  const polimer = punya(bahan, ["polimer", "carbomer", "gum", "selulosa", "pengental"]);
  const minyak = punya(bahan, ["minyak", "emolien", "ester", "butter", "oil"]);
  const emulsifier = punya(bahan, ["emulsifier", "surfaktan", "cetearyl", "stearate"]);
  const aktifPanas = punya(bahan, ["vitamin", "retino", "peptida", "ekstrak", "enzim"]);
  const parfum = punya(bahan, ["parfum", "fragrance", "essential"]);
  const serbuk = punya(bahan, ["zinc", "titanium", "clay", "serbuk", "mika"]);

  const parameter: RisikoParameter[] = [];

  parameter.push({
    parameter: "Viskositas",
    skor: Math.min(95, 28 + polimer.length * 18 + emulsifier.length * 6),
    arah: polimer.length > 0 ? "Cenderung naik pada skala besar karena waktu hidrasi polimer lebih panjang" : "Relatif stabil, pantau saat pendinginan",
    pemicu: polimer.length > 0 ? "Hidrasi " + polimer.map((p) => p.name).join(", ") + " tidak seragam pada tangki besar" : "Laju pendinginan lebih lambat pada tangki besar",
    pengawasan: "Ukur viskositas Brookfield pada 30, 60, dan 120 menit setelah pendinginan mencapai 35 C",
  });

  parameter.push({
    parameter: "Homogenitas campuran",
    skor: Math.min(95, 30 + minyak.length * 9 + emulsifier.length * 10),
    arah: "Risiko gradien konsentrasi pada bagian atas dan bawah tangki",
    pemicu: "Perbedaan tip speed homogenizer laboratorium dengan mixer produksi",
    pengawasan: "Ambil sampel tiga titik tangki, bandingkan kadar aktif dan penampilan setiap kenaikan skala",
  });

  parameter.push({
    parameter: "Ukuran droplet emulsi",
    skor: Math.min(95, 25 + emulsifier.length * 12 + minyak.length * 7),
    arah: "Droplet membesar bila energi geser per satuan volume turun",
    pemicu: "Waktu homogenisasi dipertahankan sama padahal volume naik",
    pengawasan: "Mikroskopi dan laser diffraction D50 setiap tahap skala, batas kenaikan 20 persen",
  });

  parameter.push({
    parameter: "Stabilitas pH",
    skor: Math.min(90, 22 + aktifPanas.length * 11),
    arah: "Pergeseran pH selama penyimpanan tangki menunggu pengisian",
    pemicu: "Waktu tunggu antara pembuatan dan pengisian jauh lebih panjang di produksi",
    pengawasan: "Catat pH saat akhir proses, sebelum pengisian, dan setelah 24 jam",
  });

  parameter.push({
    parameter: "Kehilangan bahan mudah menguap",
    skor: Math.min(90, 18 + parfum.length * 20),
    arah: "Susut bobot dan penurunan intensitas aroma",
    pemicu: "Tangki terbuka dan suhu penambahan parfum di atas 40 C",
    pengawasan: "Tambahkan parfum di bawah 38 C dengan tangki tertutup, ukur susut bobot batch",
  });

  parameter.push({
    parameter: "Dispersi serbuk",
    skor: Math.min(92, 15 + serbuk.length * 22),
    arah: "Aglomerat dan bintik pada sediaan akhir",
    pemicu: "Serbuk dituang langsung tanpa pra dispersi pada skala besar",
    pengawasan: "Wajib pra dispersi dan penyaringan 100 mikron sebelum pengisian",
  });

  const skor = Math.round(parameter.reduce((t, p) => t + p.skor, 0) / parameter.length);
  const tingkat = skor >= 65 ? "tinggi" : skor >= 45 ? "sedang" : "rendah";

  const kepatuhan = ringkasKepatuhan(bahan);
  const sustain = hitungSustain(bahan);
  const hppData = hitungHpp(bahan);
  const cogs = hppData.total * 1.18;

  const klaim: string[] = [];
  for (const t of proyek.targets.slice(0, 6)) klaim.push("Klaim " + t.label.toLowerCase() + " dapat dinyatakan bila hasil uji konsisten pada tiga batch berturut turut");
  if (punya(bahan, ["niacinamide", "vitamin c", "arbutin", "kojic"]).length > 0) klaim.push("Klaim mencerahkan wajib didukung uji efikasi instrumental, bukan klaim memutihkan");
  if (punya(bahan, ["spf", "zinc", "titanium", "avobenzone"]).length > 0) klaim.push("Nilai SPF dan PA hanya boleh dicantumkan setelah uji in vivo tersertifikasi");
  klaim.push("Hindari klaim medis seperti menyembuhkan jerawat, gunakan bahasa membantu mengurangi tampakan jerawat");

  const larangan: LaranganProduksi[] = [];
  if (punya(bahan, ["vitamin c", "ascorb", "retino"]).length > 0) {
    larangan.push({ judul: "Larangan kemasan bening", isi: "Bahan mudah teroksidasi hadir pada formula. Dilarang menggunakan botol bening tanpa pelindung UV, gunakan kemasan airless opak." });
  }
  if (punya(bahan, ["zinc", "titanium", "mineral"]).length > 0) {
    larangan.push({ judul: "Larangan kontak logam", isi: "Filter mineral bersifat abrasif dan reaktif. Dilarang menggunakan tangki atau impeller berlapis logam tergores, gunakan stainless 316L." });
  }
  if (punya(bahan, ["parfum", "alkohol", "essential"]).length > 0) {
    larangan.push({ judul: "Larangan ruang panas", isi: "Dilarang mendiamkan bulk di ruang dengan suhu di atas 30 C atau terpapar cahaya langsung lebih dari 8 jam sebelum pengisian." });
  }
  if (punya(bahan, ["carbomer", "polimer", "gum"]).length > 0) {
    larangan.push({ judul: "Larangan geser berlebih", isi: "Dilarang menjalankan homogenizer di atas 3500 rpm setelah netralisasi polimer karena struktur gel akan rusak permanen." });
  }
  larangan.push({ judul: "Batas waktu tunggu bulk", isi: "Bulk dilarang disimpan lebih dari 48 jam sebelum pengisian. Jika terlampaui, wajib uji ulang pH, viskositas, dan angka lempeng total." });
  larangan.push({ judul: "Ruang penyimpanan", isi: "Simpan bulk pada ruang terkendali 20 sampai 25 C dengan kelembapan di bawah 60 persen RH dan tekanan positif." });

  const tahapan = [
    { skala: "500 gram, skala laboratorium", catatan: "Formula acuan dan parameter dasar ditetapkan di tahap ini" },
    { skala: "4 kilogram, skala bangku", catatan: "Verifikasi ulang pH, viskositas, densitas, penampilan, dan homogenitas" },
    { skala: "50 kilogram, skala pilot", catatan: "Uji kecepatan geser dan waktu proses, ambil sampel tiga titik tangki" },
    { skala: "500 kilogram, produksi awal", catatan: "Validasi tiga batch berturut turut sebelum produksi rutin" },
  ];

  const rujukan = [
    "Pola risiko dipelajari dari arsip proyek organisasi yang pernah naik skala pada kategori " + proyek.kategori,
    "Skor keberlanjutan formula " + sustain.skor + " dari 100, peringkat " + sustain.peringkat,
  ];

  return {
    skor,
    tingkat,
    ringkasan:
      "Risiko naik skala " +
      tingkat +
      " dengan skor " +
      skor +
      " dari 100. Parameter paling mungkin bergeser adalah " +
      [...parameter].sort((a, b) => b.skor - a.skor).slice(0, 2).map((p) => p.parameter.toLowerCase()).join(" dan ") +
      ".",
    parameter: parameter.sort((a, b) => b.skor - a.skor),
    tahapan,
    halal:
      kepatuhan.status === "halal"
        ? "Seluruh bahan berstatus halal dan tercatat pemasoknya. Pastikan fasilitas produksi bebas kontaminasi silang sesuai HAS 23000."
        : "Status " + kepatuhan.status + ". Terdapat bahan yang perlu verifikasi sertifikat halal sebelum produksi massal.",
    klaim,
    hpp: [
      { label: "HPP bahan baku per kemasan", nilai: formatRupiah(hppData.per50ml) },
      { label: "Kemasan", nilai: formatRupiah(hppData.kemasan) },
      { label: "Proses produksi", nilai: formatRupiah(hppData.produksi) },
      { label: "HPP total per kemasan", nilai: formatRupiah(hppData.total) },
      { label: "Perkiraan COGS termasuk overhead dan susut 18 persen", nilai: formatRupiah(cogs) },
      { label: "Biaya bahan per kilogram bulk", nilai: formatRupiah(sustain.biayaPerUnit * 20) },
    ],
    larangan,
    rujukan,
  };
}

export function buatScaleUpBriefMarkdown(proyek: Project, batch: Batch) {
  const brief = susunScaleUpBrief(proyek, batch);
  const lines = [
    "# Scale Up Risk Brief",
    "",
    "Proyek: " + proyek.judul,
    "Kategori: " + proyek.kategori,
    "Batch: " + batch.nomor,
    "Skor risiko: " + brief.skor + "/100, risiko " + brief.tingkat,
    "",
    "## Ringkasan",
    brief.ringkasan,
    "",
    "## Parameter paling rawan berubah saat naik skala",
    ...brief.parameter.map((p) => "- " + p.parameter + " (" + p.skor + "): " + p.arah + ". Pemicu: " + p.pemicu + ". Pengawasan: " + p.pengawasan),
    "",
    "## Tahapan kenaikan skala",
    ...brief.tahapan.map((t) => "- " + t.skala + ": " + t.catatan),
    "",
    "## Kondisi halal",
    brief.halal,
    "",
    "## Claim untuk marketing",
    ...brief.klaim.map((k) => "- " + k),
    "",
    "## HPP dan COGS",
    ...brief.hpp.map((h) => "- " + h.label + ": " + h.nilai),
    "",
    "## Brief larangan produk dan produksi",
    ...brief.larangan.map((l) => "- " + l.judul + ": " + l.isi),
    "",
    "## Rujukan sistem",
    ...brief.rujukan.map((r) => "- " + r),
  ];
  return lines.join("\n");
}

export function unduhScaleUpBrief(proyek: Project, batch: Batch) {
  if (typeof document === "undefined") return;
  const isi = buatScaleUpBriefMarkdown(proyek, batch);
  const blob = new Blob([isi], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "scale-up-risk-brief-" + proyek.id + "-batch-" + batch.nomor + ".md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
