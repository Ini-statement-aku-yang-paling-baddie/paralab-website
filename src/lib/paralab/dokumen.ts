import { formatRupiah, hitungHpp, lengkapiBahan, type Batch, type Ingredient, type Project } from "./data";
import { PARAM_LIBRARY } from "./catalog";
import { deteksiClash, ringkasKepatuhan } from "./ai";
import { labelStandar, standarTerpilih } from "./standar";
import logoDark from "@/assets/paralab-logo-dark.png";

function li(items: string[]) {
  return items.map((t) => "<li>" + t + "</li>").join("");
}

function cek(rows: [string, string][]) {
  return (
    "<table><thead><tr><th>Pengecekan</th><th>Metode dan acuan</th><th>Hasil</th><th>Lolos</th><th>Catatan alat dan tanggal</th></tr></thead><tbody>" +
    rows.map(([a, b]) => "<tr><td>" + a + "</td><td>" + b + "</td><td></td><td></td><td></td></tr>").join("") +
    "</tbody></table>"
  );
}

function metode(id: string) {
  return PARAM_LIBRARY.find((p) => p.id === id)?.metode ?? "Metode internal laboratorium";
}

function fase(bahan: Ingredient[], kode: string) {
  return bahan.filter((b) => b.phase === kode);
}

const NAMA_FASE: Record<string, string> = {
  A: "Fase A, fase air",
  B: "Fase B, fase minyak",
  C: "Fase C, bahan aktif suhu rendah",
  D: "Fase D, pengawet dan penyesuai akhir",
};

export function buatDokumenHtml(proyek: Project, batchAsli: Batch) {
  const batch: Batch = { ...batchAsli, bahan: batchAsli.bahan.map(lengkapiBahan) };
  const hpp = hitungHpp(batch.bahan);
  const tanggal = new Date(batch.dibuat).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const kodeBatch = "PL-" + proyek.id.replace("prj-", "").toUpperCase().slice(0, 8) + "-B" + batch.nomor;
  const clash = deteksiClash(batch.bahan);
  const patuh = ringkasKepatuhan(batch.bahan);
  const pilihan = proyek.standar ?? "nasional";

  const barisBahan = batch.bahan
    .map(
      (b, i) =>
        "<tr><td>" +
        (i + 1) +
        "</td><td>" +
        b.name +
        "</td><td>" +
        b.inci +
        "</td><td>" +
        b.cas +
        "</td><td>" +
        b.rumus +
        "</td><td>" +
        (b.bm > 0 ? b.bm : "-") +
        "</td><td>" +
        b.phase +
        "</td><td>" +
        b.percent +
        "</td><td>" +
        b.dosis[0] +
        " sampai " +
        b.dosis[1] +
        "</td><td>" +
        b.fungsi +
        "</td></tr>",
    )
    .join("");

  const barisKimia = batch.bahan
    .map(
      (b) =>
        "<tr><td>" +
        b.name +
        "</td><td>" +
        b.golongan +
        "</td><td>" +
        b.kelarutan +
        "</td><td>" +
        b.phKerja[0] +
        " sampai " +
        b.phKerja[1] +
        "</td><td>" +
        b.suhuTambah +
        "</td><td>" +
        b.mekanisme +
        "</td><td>" +
        b.inkompatibel +
        "</td></tr>",
    )
    .join("");

  const barisMutu = batch.bahan
    .map(
      (b) =>
        "<tr><td>" +
        b.name +
        "</td><td>" +
        b.grade +
        "</td><td>" +
        b.spesifikasi +
        "</td><td>" +
        b.penyimpanan +
        "</td><td></td><td></td></tr>",
    )
    .join("");

  const barisRegulasi = batch.bahan
    .map(
      (b) =>
        "<tr><td>" +
        b.name +
        "</td><td>" +
        b.bpom +
        "</td><td>" +
        (b.batasBpom ?? "Tanpa batas khusus") +
        "</td><td>" +
        b.halal +
        "</td><td>" +
        b.catatanHalal +
        "</td></tr>",
    )
    .join("");

  const barisHasil = proyek.targets
    .map((t) => {
      const h = batch.hasil.find((x) => x.paramId === t.id);
      const nilai = h?.nilai ?? "";
      return (
        "<tr><td>" +
        t.label +
        "</td><td>" +
        metode(t.id) +
        "</td><td>" +
        t.target +
        " ± " +
        t.toleransi +
        " " +
        t.unit +
        "</td><td>" +
        nilai +
        "</td><td></td><td></td></tr>"
      );
    })
    .join("");

  const prosedurFase = ["A", "B", "C", "D"]
    .filter((k) => fase(batch.bahan, k).length > 0)
    .map(
      (k) =>
        "<li><strong>" +
        (NAMA_FASE[k] ?? "Fase " + k) +
        ":</strong> " +
        fase(batch.bahan, k)
          .map((b) => b.name + " " + b.percent + " persen")
          .join(", ") +
        "</li>",
    )
    .join("");

  const barisClash =
    clash.length === 0
      ? "<tr><td colspan='4'>Tidak ditemukan interaksi kritis antar bahan pada formula ini</td></tr>"
      : clash
          .map((c) => "<tr><td>" + c.a + "</td><td>" + c.b + "</td><td>" + c.tingkat + "</td><td>" + c.alasan + "</td></tr>")
          .join("");

  return [
    "<div class='doc-brand'><img src='" + logoDark + "' alt='paralab.ai, Electronic Lab Notebook Vinara R&amp;D'></div>",
    "<p class='doc-meta'><strong>Hari / Tanggal Praktikum:</strong> " + tanggal + "<br><strong>Peneliti:</strong> " + proyek.peneliti + "<br><strong>Nomor Dokumen:</strong> " + kodeBatch + "<br><strong>Status:</strong> " + batch.status + "</p>",
    "<p class='doc-module'>MODUL R&amp;D FORMULASI KOSMETIK</p>",
    "<h1>" + proyek.judul + "</h1>",
    "<p class='doc-subtitle'>Batch " + batch.nomor + " &middot; " + proyek.kategori + " &middot; Skala laboratorium 500 gram</p>",
    "<p class='doc-disclaimer'><strong>DATA SIMULASI.</strong> Dokumen demonstrasi ini tidak memuat formula, hasil uji, personel, atau data internal nyata Vinara maupun mereknya. Semua keputusan pengembangan wajib diverifikasi melalui metode tervalidasi, spesifikasi terkini, kajian keselamatan, dan persetujuan fungsi berwenang.</p>",

    "<h2>I. Identitas Penelitian dan Kendali Dokumen</h2>",
    "<table><tbody>" +
      "<tr><th>Nomor batch</th><td>" + kodeBatch + "</td><th>Skala</th><td>Skala laboratorium 500 gram</td></tr>" +
      "<tr><th>Kategori produk</th><td>" + proyek.kategori + "</td><th>Bentuk sediaan</th><td>Sesuai rancangan kategori</td></tr>" +
      "<tr><th>Peneliti utama</th><td>" + proyek.peneliti + "</td><th>Tim</th><td>" + proyek.tim + "</td></tr>" +
      "<tr><th>Tanggal pembuatan</th><td>" + tanggal + "</td><th>Status batch</th><td>" + batch.status + "</td></tr>" +
      "<tr><th>Perkiraan HPP</th><td>" + formatRupiah(hpp.total) + " per 50 ml</td><th>Jumlah bahan</th><td>" + batch.bahan.length + " bahan</td></tr>" +
      "</tbody></table>",

    "<h2>II. Latar Belakang dan Teori Dasar</h2><p>" + proyek.brief + "</p><p>Dasar ilmiah wajib ditinjau terhadap data pemasok, pustaka primer, persyaratan BPOM yang berlaku, dan profil keamanan setiap bahan. Klaim produk belum dapat disimpulkan hanya dari hasil batch laboratorium.</p>",

    "<h2>III. Tujuan Percobaan</h2><ul>" + li(batch.tujuan) + "</ul>",

    "<h2>IV. Hipotesis Kerja</h2><p>" + batch.hipotesis + "</p>",

    "<h2>V. Alat Laboratorium</h2><ul>" +
      li([
        "Timbangan analitik ketelitian 0.0001 gram dan timbangan teknis 0.01 gram",
        "Overhead stirrer dan homogenizer rotor stator dengan pengatur rpm",
        "Hot plate magnetic stirrer dan penangas air bersuhu terkontrol",
        "pH meter terkalibrasi dengan buffer 4.01, 7.00, dan 10.01",
        "Viskometer Brookfield dengan spindle dan kecepatan tercatat",
        "Mikroskop optik untuk pemeriksaan ukuran droplet dan kristal",
        "Sentrifus 3000 rpm, oven stabilitas 45 C, dan lemari pendingin 4 C",
        "Alat gelas bersih kering, sudip, dan wadah sampel kedap cahaya",
      ]) +
      "</ul>",

    "<h2>VI. Formula dan Data Bahan</h2>",
    "<p>Perkiraan harga pokok produksi batch ini " + formatRupiah(hpp.total) + " per kemasan 50 ml. Seluruh kadar dinyatakan dalam persen bobot per bobot.</p>",
    "<table><thead><tr><th>No</th><th>Bahan</th><th>Nama INCI</th><th>Nomor CAS</th><th>Rumus kimia</th><th>Bobot molekul</th><th>Fase</th><th>Kadar persen</th><th>Rentang lazim</th><th>Fungsi</th></tr></thead><tbody>" +
      barisBahan +
      "</tbody></table>",

    "<h2>VII. Karakter Kimia dan Penanganan Bahan</h2>",
    "<table><thead><tr><th>Bahan</th><th>Golongan</th><th>Kelarutan</th><th>Jendela pH</th><th>Titik penambahan</th><th>Mekanisme kerja</th><th>Inkompatibilitas</th></tr></thead><tbody>" +
      barisKimia +
      "</tbody></table>",

    "<h2>VIII. Kajian Kompatibilitas Formula</h2>",
    "<table><thead><tr><th>Bahan A</th><th>Bahan B</th><th>Tingkat risiko</th><th>Penjelasan dan mitigasi</th></tr></thead><tbody>" + barisClash + "</tbody></table>",
    "<p>Catatan pengaturan pH kerja: seluruh bahan aktif harus berada pada jendela pH yang saling beririsan. Bila tidak beririsan, pisahkan bahan ke fase berbeda atau gunakan bentuk derivat yang lebih stabil.</p>",

    "<h2>IX. Kajian Awal Regulasi dan Halal</h2>",
    "<p>Skrining rule prototipe versi " + patuh.ruleVersion + " menghasilkan status: " + patuh.label + ". Status ini berasal dari rule engine internal dan <strong>bukan</strong> persetujuan BPOM, MUI, atau keamanan. Bahan berstatus perlu verifikasi: " + (patuh.syubhat.length === 0 ? "tidak ada" : patuh.syubhat.map((b) => b.name).join(", ")) + ".</p>",
    "<table><thead><tr><th>Bahan</th><th>Status BPOM</th><th>Batas maksimal</th><th>Status halal</th><th>Catatan verifikasi</th></tr></thead><tbody>" + barisRegulasi + "</tbody></table>",

    "<h2>X. Kontrol Mutu Bahan Baku</h2>",
    "<table><thead><tr><th>Bahan</th><th>Grade</th><th>Spesifikasi kunci</th><th>Penyimpanan</th><th>Nomor lot</th><th>Tanggal kedaluwarsa</th></tr></thead><tbody>" +
      barisMutu +
      "</tbody></table>",

    "<h2>XI. Diagram Alir dan Prosedur Kerja</h2>",
    "<p>Susunan fase pada batch ini:</p><ul>" + prosedurFase + "</ul>",
    "<ol>" + li(batch.prosedur) + "</ol>",
    "<p>Kontrol dalam proses yang wajib dicatat: suhu tiap fase, kecepatan dan durasi homogenisasi, suhu saat penambahan aktif, pH sebelum dan sesudah penyesuaian, serta pengamatan visual saat pendinginan.</p>",

    "<h2>XII. Kontrol Dalam Proses dan Data Pengamatan</h2>",
    "<table><thead><tr><th>Tahap</th><th>Parameter dipantau</th><th>Rentang kendali</th><th>Nilai terukur</th><th>Waktu</th></tr></thead><tbody>" +
      "<tr><td>Pemanasan fase air</td><td>Suhu</td><td>73 sampai 77 C</td><td></td><td></td></tr>" +
      "<tr><td>Pemanasan fase minyak</td><td>Suhu</td><td>73 sampai 77 C</td><td></td><td></td></tr>" +
      "<tr><td>Homogenisasi</td><td>Kecepatan dan durasi</td><td>3000 sampai 3400 rpm, 8 menit</td><td></td><td></td></tr>" +
      "<tr><td>Penambahan aktif</td><td>Suhu campuran</td><td>Maksimal 40 C</td><td></td><td></td></tr>" +
      "<tr><td>Penyesuaian akhir</td><td>pH</td><td>Sesuai target formula</td><td></td><td></td></tr>" +
      "</tbody></table>",

    "<h2>XIII. Tabel Hasil Uji</h2>",
    "<table><thead><tr><th>Parameter</th><th>Metode uji</th><th>Target</th><th>Hasil</th><th>Lolos</th><th>Catatan</th></tr></thead><tbody>" + barisHasil + "</tbody></table>",

    "<h2>XIV. Daftar Pengecekan Mutu Batch</h2>",
    "<p>Daftar berikut wajib ditandai pada setiap batch. Isi kolom hasil dan keputusan lolos atau tidak lolos, sertakan nomor alat dan tanggal kalibrasi pada kolom catatan.</p>",

    "<h3>XIV.1 Fisik Dasar</h3>",
    cek([
      ["Penampilan visual", "Homogenitas, warna, kejernihan secara visual"],
      ["Warna instrumental", "Kolorimeter atau spektrofotometer CIELAB L a b dan delta E"],
      ["Bau", "Organoleptik panel internal"],
      ["pH", "pH meter terkalibrasi 25 C"],
      ["Viskositas titik tunggal", "Brookfield, catat spindle dan kecepatan"],
      ["Reologi penuh kurva alir", "Rheogram lintas shear rate, tentukan pseudoplastik atau tiksotropik"],
      ["Densitas atau berat jenis", "Piknometer 25 C"],
      ["Indeks bias", "Refraktometer, khusus sediaan bening seperti serum dan toner"],
    ]),

    "<h3>XIV.2 Karakterisasi Mikrostruktur</h3>",
    cek([
      ["Distribusi ukuran droplet", "Laser diffraction atau DLS, catat D10 D50 D90 dan polidispersitas"],
      ["Potensial zeta", "Zetasizer, khusus sistem nano dan vesikular"],
      ["Pengamatan mikroskopis", "Mikroskop optik struktur emulsi dan kristal"],
    ]),

    "<h3>XIV.3 Skrining Stabilitas Cepat</h3>",
    cek([
      ["Siklus beku cair", "Tiga siklus, catat pemisahan dan perubahan viskositas"],
      ["Sentrifugasi", "3000 rpm 30 menit"],
       ["Suhu tinggi bertahap", "Naik 5 °C per tahap sampai muncul tanda pemisahan"],
       ["Penyimpanan multi suhu paralel", "45 °C, 4 °C, dan −10 °C secara bersamaan"],
    ]),

    "<h3>XIV.4 Stabilitas Dipercepat dan Jangka Panjang</h3>",
    cek([
       ["Accelerated aging", "30, 37, 40, 45, atau 50 °C sesuai protokol"],
      ["Real time storage", "6 sampai 12 bulan suhu ruang terkendali"],
      ["Fotostabilitas", "Paparan cahaya dan UV"],
      ["Uji oksidatif", "Bilangan peroksida dan anisidin untuk minyak alami dan aktif sensitif"],
      ["Uji getaran", "Simulasi transportasi dan distribusi"],
      ["Susut bobot dan evaporasi", "Bahan volatil sekaligus cek integritas segel kemasan"],
    ]),

    "<h3>XIV.5 Kandungan dan Kemurnian Kimia</h3>",
    cek([
      ["Assay kadar bahan aktif", "HPLC, spektrofotometri, atau titrasi dibanding kadar teoretis"],
      ["Verifikasi CoA bahan masuk", "Incoming QC kemurnian bahan dari pemasok"],
    ]),

    "<h3>XIV.6 Mikrobiologi</h3>",
    cek([["Total plate count awal", "Skrining internal cepat sebelum uji tantang resmi ke laboratorium eksternal"]]),

    "<h3>XIV.7 Uji Fungsional Sesuai Kategori</h3>",
    cek([
      ["Tinggi dan stabilitas busa", "Khusus pembersih dan sampo"],
      ["Spreadability", "Khusus krim dan losion"],
      ["Pemulihan viskositas setelah shear", "Tiksotropi gel dan krim"],
      ["Adhesi dan pembentukan film", "Primer, maskara, dan sediaan sejenis"],
    ]),

    "<h3>XIV.8 Sensori dan Keamanan Awal</h3>",
    cek([
      ["Panel sensori internal", "Tekstur, penyerapan, kelengketan oleh panelis terlatih internal"],
      ["Skrining patch test internal", "Skala kecil sebelum HRIPT resmi melalui CRO eksternal"],
    ]),

    "<h3>XIV.9 Kompatibilitas</h3>",
    cek([
      ["Kompatibilitas antar bahan", "Aktif terhadap sistem lain dalam formula"],
      ["Kompatibilitas kemasan", "Migrasi dan interaksi formula dengan kemasan secara dipercepat"],
      ["Kompatibilitas aplikator", "Fungsi pompa, spray, dan dropper"],
    ]),

    "<h3>XIV.10 Verifikasi Scale Up</h3>",
    "<table><thead><tr><th>Tahap skala</th><th>Ukuran batch</th><th>pH</th><th>Viskositas</th><th>Densitas</th><th>Penampilan</th><th>Keseragaman pencampuran</th></tr></thead><tbody>" +
      "<tr><td>Skala lab</td><td>200 gram</td><td></td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Skala lab besar</td><td>1 sampai 4 kilogram</td><td></td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Pilot</td><td>20 sampai 50 kilogram</td><td></td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Produksi massal</td><td>Sesuai kapasitas reaktor</td><td></td><td></td><td></td><td></td><td></td></tr>" +
      "</tbody></table>",
    "<p>Kenaikan skala dilakukan bertahap 10 sampai 20 kali per tahap. Parameter dalam proses diukur ulang setiap kenaikan skala karena formula yang benar belum tentu konsisten ketika proses berubah.</p>",

    "<h2>XV. Protokol Uji Stabilitas</h2>",
    "<table><thead><tr><th>Kondisi</th><th>Durasi</th><th>Pengamatan</th><th>pH</th><th>Viskositas</th><th>Warna dan aroma</th></tr></thead><tbody>" +
      "<tr><td>Suhu ruang 25 C</td><td>28 hari</td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Oven 45 C</td><td>28 hari</td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Kulkas 4 C</td><td>28 hari</td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Siklus beku cair, 3 siklus</td><td>6 hari</td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Sentrifugasi 3000 rpm</td><td>30 menit</td><td></td><td></td><td></td><td></td></tr>" +
      "<tr><td>Paparan cahaya</td><td>7 hari</td><td></td><td></td><td></td><td></td></tr>" +
      "</tbody></table>",

    "<h3>XV.1 Jadwal Dokumentasi Foto Sampel Droplet Setiap Tiga Hari</h3>",
    "<p>Selama masa pemantauan stabilitas, sampel difoto pada perbesaran 400 kali setiap tiga hari. Bandingkan ukuran droplet dengan hari nol dan catat tanda krim, koalesens, atau pemisahan fase.</p>",
    "<table><thead><tr><th>Titik pengamatan</th><th>Tanggal</th><th>Ukuran droplet D50 mikron</th><th>Tanda pemisahan</th><th>Nama berkas foto</th><th>Paraf</th></tr></thead><tbody>" +
      [0, 3, 6, 9, 12, 15, 18, 21].map((h) => "<tr><td>Hari ke " + h + "</td><td></td><td></td><td></td><td></td><td></td></tr>").join("") +
      "</tbody></table>",

    "<h3>XV.2 Acuan Standar Pengujian yang Dipakai</h3>",
    "<p>Laporan ini disusun mengikuti " + labelStandar(pilihan).toLowerCase() + ".</p>",
    "<table><thead><tr><th>Kode standar</th><th>Nama</th><th>Lingkup</th><th>Cakupan pengujian</th><th>Kesesuaian</th></tr></thead><tbody>" +
      standarTerpilih(pilihan)
        .map((s) => "<tr><td>" + s.kode + "</td><td>" + s.nama + "</td><td>" + s.lingkup + "</td><td>" + s.cakupan + "</td><td></td></tr>")
        .join("") +
      "</tbody></table>",

    "<h2>XVI. Mikrobiologi dan Keamanan</h2>",
    "<table><thead><tr><th>Uji</th><th>Metode</th><th>Batas</th><th>Hasil</th></tr></thead><tbody>" +
      "<tr><td>Angka lempeng total</td><td>Hitungan cawan</td><td>Maksimal 1000 cfu per gram</td><td></td></tr>" +
      "<tr><td>Kapang dan khamir</td><td>Hitungan cawan</td><td>Maksimal 100 cfu per gram</td><td></td></tr>" +
      "<tr><td>Patogen spesifik</td><td>Uji kualitatif</td><td>Negatif untuk S aureus, P aeruginosa, C albicans</td><td></td></tr>" +
      "<tr><td>Uji tantangan pengawet</td><td>ISO 11930</td><td>Kriteria A</td><td></td></tr>" +
      "<tr><td>Uji iritasi tempel</td><td>Patch test 48 jam</td><td>Tidak ada reaksi derajat 2</td><td></td></tr>" +
      "</tbody></table>",

    "<h2>XVII. Kompatibilitas Kemasan</h2>",
    "<p>Catat jenis kemasan, bahan kontak, hasil uji kebocoran, perubahan bobot setelah 28 hari pada 45 C, dan tanda interaksi seperti perubahan warna kemasan atau penyerapan pengawet.</p>",

    "<h2>XVIII. Observasi Proses</h2><p>" +
      (batch.observasi || "Tulis pengamatan warna, aroma, tekstur, perilaku emulsi saat pendinginan, dan kejadian penting selama proses.") +
      "</p>",

    "<h2>XIX. Perhitungan dan Pembahasan</h2><p>Hubungkan komposisi kimia, parameter proses, dan hasil uji. Cantumkan contoh perhitungan kadar aktif, koreksi assay bahan baku, neraca massa, susut proses, dan HPP. Jelaskan penyebab bila ada parameter di luar target, misalnya pengaruh beban elektrolit terhadap viskositas, pengaruh pH terhadap stabilitas aktif, atau pengaruh laju pendinginan terhadap ukuran droplet.</p>",

    "<h2>XX. Kesimpulan Sementara</h2><p>Jawab tujuan percobaan berdasarkan data. Tuliskan deviasi, keputusan lanjut atau hentikan, dan rancangan penyesuaian untuk batch berikutnya.</p>",

    "<h2>XXI. Daftar Pustaka dan Dokumen Acuan</h2><ul>" +
      li([
        "Peraturan BPOM yang berlaku tentang persyaratan teknis bahan kosmetika dan CPKB",
        "ISO 11930:2019, Cosmetics, Microbiology, Evaluation of the antimicrobial protection of a cosmetic product",
        "ISO 24444:2019 untuk penetapan SPF secara in vivo dan ISO 24443:2021 untuk UVA photoprotection secara in vitro",
        "Personal Care Products Council, International Cosmetic Ingredient Dictionary",
        "Data pemasok berupa CoA, lembar data keselamatan, dan dokumen halal",
      ]) +
      "</ul>",

    "<h2>XXII. Tinjauan dan Pengesahan</h2><table><thead><tr><th>Peran</th><th>Nama</th><th>Keputusan</th><th>Tanda tangan dan tanggal</th></tr></thead><tbody><tr><td>Peneliti utama</td><td>" + proyek.peneliti + "</td><td>Disusun</td><td></td></tr><tr><td>Reviewer QA / Kepala Laboratorium</td><td></td><td>Setuju / Revisi / Tolak</td><td></td></tr><tr><td>Regulatory dan Halal</td><td></td><td>Setuju / Revisi / Tolak</td><td></td></tr><tr><td>Penanggung jawab scale-up</td><td></td><td>Setuju / Revisi / Tolak</td><td></td></tr></tbody></table>",
  ].join("");
}

export function hitungKata(html: string) {
  const teks = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .trim();
  return teks.length === 0 ? 0 : teks.split(/\s+/).length;
}
