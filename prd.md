# PRD: Implementasi Arsitektur ParaLab di Website

> **Status:** siap dikerjakan
> **Repository:** `paralab-website`
> **Sumber kontrak:** `paralab-architecture`, dokumen [architecture v5](https://github.com/Ini-statement-aku-yang-paling-baddie/paralab-architecture/blob/main/docs/architecture/architecture_v5.md)
> **Cara kerja:** tiga workstream paralel di tiga branch, lalu digabung berurutan

---

## 1. Ringkasan

Website ParaLab saat ini hanya terhubung ke satu dari lima capability arsitektur. Dokumen ini menetapkan cara website menerapkan F1 sampai F5 secara utuh: panel mana memanggil endpoint mana, field apa yang dikirim dan dibaca, aturan tampilan apa yang mengikat tiap keluaran, dan bagaimana pekerjaan itu dibagi ke tiga jalur yang dapat berjalan bersamaan.

Ini bukan PRD untuk membangun model. Seluruh model, rule engine, dan artefak sudah ada di `paralab-architecture`. Yang dibangun di sini adalah lapisan yang membuat hasilnya sampai ke peneliti tanpa melanggar batas klaim arsitektur.

---

## 2. Titik awal

Website memiliki dua versi yang berbeda jauh, dan keduanya benar sebagian.

**Branch `master`** berisi pekerjaan UI terbaru: halaman spesimen akhir, uji sampel stabilitas, penyesuaian tabel, dan catatan rencana. Tetapi dari lima capability, hanya F3 yang benar-benar memanggil server. Sisanya berjalan sebagai heuristik lokal di browser: saran formula memakai tabel klaim ke bahan yang ditulis tangan di `src/lib/paralab/ai.ts`, pencatatan suara memakai Web Speech API tanpa ekstraksi model, dan analisis citra membaca piksel canvas.

**Branch `feat/model-integration`** sudah memanggil F1, F2, F4, dan F5 ke gateway, lengkap dengan adapter dan test. Tetapi branch itu bercabang sebelum pekerjaan UI terbaru masuk, sehingga ia tertinggal pada README, roadmap, `SpesimenAkhir.tsx`, `UjiSampelStabilitas.tsx`, `data.ts`, dan `styles.css`. Ia juga membawa kembali `package-lock.json` padahal `master` sudah pindah ke `bun.lock`.

Konsekuensinya: **kode integrasi yang dibutuhkan sudah ada dan tidak boleh ditulis ulang dari nol.** Pekerjaan sebenarnya adalah memindahkannya ke atas `master` yang sekarang, sambil memperbaiki empat celah yang ditemukan saat audit kontrak. Setiap workstream wajib membaca implementasi yang sudah ada lebih dulu:

```bash
git show origin/feat/model-integration:src/lib/paralab/model-adapters.ts
```

---

## 3. Tujuan dan non-tujuan

### Tujuan

1. Kelima capability arsitektur dapat dijalankan peneliti dari UI website.
2. Setiap angka di layar dapat ditelusuri asalnya: rule deterministik, pembacaan alat, prediksi synthetic-demo, estimasi heuristik, atau keputusan manusia.
3. Kegagalan layanan menghasilkan alasan yang terbaca, bukan angka pengganti.
4. Pekerjaan dapat dibagi ke tiga orang atau tiga agent tanpa saling menunggu.

### Non-tujuan

1. Membangun atau mengubah model, rule, dan feature schema. Seluruhnya milik `paralab-architecture`.
2. Authentication, database runtime, dan persistence audit event.
3. Mengintegrasikan CV ke pipeline utama. Analisis citra tetap lokal dan tetap berlabel `concept_only_synthetic_render_pilot`.
4. Mengganti heuristik lokal yang memang jujur dilabeli heuristik, misalnya estimasi HPP dan profil keberlanjutan.

---

## 4. Prinsip yang mengikat UI

Disalin dari architecture v5 pasal 3 dan pasal 13. Setiap workstream terikat seluruhnya, bukan hanya bagian yang ia kerjakan.

1. **Tidak ada early pass.** Risiko rendah ditampilkan sebagai lanjutkan observasi. Dilarang menulis kata aman, lolos, atau siap produksi pada keluaran F3.
2. **Abstain lebih aman daripada menebak.** Layanan mati, domain tidak didukung, atau checkpoint kurang menghasilkan pesan abstain yang menyebut data apa yang hilang.
3. **Jangan pernah mengganti keluaran model dengan perhitungan lokal.** Bila fallback lokal dipakai, ia wajib ditandai di UI sebagai jawaban lokal, seperti yang sudah dilakukan `DocCopilot` lewat flag `lokal`.
4. **Tidak ada tulisan ke jurnal tanpa konfirmasi manusia.** Berlaku mutlak untuk F5 dan analisis citra.
5. **Setiap angka menyebutkan asalnya.** Pakai `BandProvenance` dengan `variant` dari `LAPIS` di `src/lib/paralab/kontrak.ts`, dan `DaftarBatas` untuk limitasi.
6. **Kosakata mengikuti arsitektur.** Status F2 memakai `clear_for_current_screening`, `warning`, `blocked`, `unknown`. Keputusan F3 memakai `flag_high_risk`, `continue_observation`, `abstain_human_review_required`. Jangan menerjemahkan istilah ini menjadi vonis halal, aman, atau disetujui BPOM.

---

## 5. Peta integrasi

| Capability | Panel di website | Endpoint | Sifat |
|---|---|---|---|
| F1 Evidence Retrieval | Panel AI Copilot Jurnal di halaman dokumen | `POST /v1/f1/query` | Retrieval + model bahasa |
| F2 Formulation Guardrail | Kartu skrining formula di halaman jurnal | `POST /v1/f2/health-check` | Deterministik |
| F3 Stability Sentinel | Panel Sentinel di halaman jurnal | `POST /v1/f3/forecasts` | Model tabular |
| F4 Next Validation Step | Kartu langkah validasi di halaman jurnal | `POST /v1/f4/next-validation` | Deterministik |
| F5 Structured Logging | Tombol mikrofon di halaman dokumen | `POST /v1/f5/transcribe-draft` | Model bahasa |

Seluruh endpoint dilayani satu proses gateway. Karena itu `VITE_MODEL_API_BASE` dan `VITE_PARALAB_F3_URL` harus diisi origin yang sama.

---

## 6. Kontrak klien per capability

Bagian ini menetapkan apa yang dikirim dan dibaca website. Nama field tidak boleh diubah sepihak, karena sisi server memetakannya langsung ke fungsi Python yang sudah ada.

### 6.1 F1, Evidence Copilot

Kirim `{ query: string }`. Baca:

```ts
type F1QueryResponse = {
  query: string;
  evidence_status: string;                 // "sufficient" | "insufficient"
  evidence: {
    source_id: string;
    hybrid_score?: number;
    outcome?: string;
    failure_mode?: string;
    journal_title?: string;
  }[];
  answer: { summary: string; limitations: string } | null;
  requires_human_review?: boolean;
  limitations?: string[];
};
```

Aturan tampilan:

1. `answer` bernilai `null` adalah keadaan normal, bukan error. Artinya evidence tidak cukup sehingga server sengaja tidak memanggil model. Tampilkan daftar `evidence` apa adanya beserta keterangan bahwa ringkasan tidak diterbitkan.
2. Setiap `source_id` ditampilkan sebagai sumber yang dapat dibaca peneliti, bukan disembunyikan di balik prosa.
3. `answer.limitations` dan `limitations` wajib ikut tampil. Jangan diringkas atau dihilangkan.
4. Bila gateway tidak menjawab, fallback rule lokal boleh dipakai tetapi **wajib ditandai** sebagai jawaban lokal dan tidak boleh menampilkan `evidence` palsu.

### 6.2 F2, Formulation Guardrail

Kirim:

```ts
type F2Request = {
  formula: { bahan: string; pct: number }[];
  context: Record<string, string>;   // wajib berisi konteks proyek, lihat perbaikan 7.3
  ph: number | null;
};
```

Baca delapan field: `screened_at`, `rule_version`, `overall_status`, `disclaimer`, `results`, `derived_features`, `model_coverage`, `requires_human_signoff`. Bentuk ini sama persis dengan nilai balik `screen_formula()` di sisi arsitektur.

Aturan tampilan:

1. Setiap rule yang menyala menampilkan `rule_id`, `rule_version`, dan `source_id`. Tanpa itu, hasil tidak dapat diaudit dan tidak boleh ditampilkan sebagai hasil rule.
2. `overall_status` bernilai `unknown` berarti ada bahan yang tidak dapat dipetakan. Perlakukan sebagai penghenti, bukan sebagai peringatan ringan.
3. Pre-check lokal `CLASH_RULES` yang sudah ada di `src/lib/paralab/data.ts` tetap dipertahankan, tetapi labelnya harus jelas bahwa ia pemeriksaan cepat sisi klien, bukan hasil F2 server.
4. `disclaimer` dari server wajib ditampilkan.

### 6.3 F3, Stability Sentinel

Sudah berjalan lewat `src/lib/paralab/f3.ts` dan tidak perlu diubah, kecuali penyeragaman base URL pada perbaikan 7.1. Seluruh perilaku abstain di dalamnya sudah benar dan tidak boleh dilemahkan.

Perhatian khusus: penjaga sisi klien pada `f3.ts` yang menahan forecast ketika F2 mengembalikan bahan berstatus `unknown` **harus dipertahankan**. Penjaga itu menutupi bug urutan status di sisi server yang belum diperbaiki.

### 6.4 F4, Next Validation Step

Kirim:

```ts
type F4Request = {
  f3_forecast: Record<string, unknown>;   // dibentuk dari hasil F3 yang benar-benar diterima
  checkpoint: Record<string, unknown> | null;
};
```

`f3_forecast` disusun oleh `toF4RequestFromF3()` dan memuat `decision`, `risk_band`, `confidence`, `data_origin`, `f2_screening`, `limitations`. Hasil yang ditahan website, misalnya abstain karena bahan tak dikenal, tetap dikirim sebagai abstain supaya F4 tidak menyusun langkah di atas forecast yang sengaja tidak diterbitkan.

Baca sembilan field: `recommendation_type`, `priority`, `recommended_action`, `reason_codes`, `required_inputs`, `evidence_ids`, `data_origin`, `requires_human_review`, `limitations`.

Aturan tampilan: rekomendasi yang datang tanpa `requires_human_review` bernilai `true` **wajib ditolak** dan tidak boleh dirender. Validasi ini sudah ada sebagai `assertReviewableRecommendation()`.

### 6.5 F5, Voice Log

Kirim `{ selected_trial_id: string; transcript: string }`. Transkripsi tetap dilakukan browser lewat Web Speech API, gateway hanya melakukan ekstraksi terstruktur.

Baca:

```ts
type F5Draft = {
  trial_id: string;
  proposed_checkpoint_patch: {
    measurements: Record<string, number | null>;
    observations: Record<string, string | null>;
  };
  requires_confirmation: boolean;
};
```

Aturan tampilan:

1. `trial_id` selalu berasal dari halaman jurnal yang sedang dibuka, tidak pernah dari hasil transkrip.
2. Draft yang datang tanpa `requires_confirmation` bernilai `true` wajib ditolak lewat `assertConfirmable()`.
3. Draft ditampilkan sebagai usulan yang dapat diedit. Peneliti menekan konfirmasi sebelum ada satu pun nilai masuk ke jurnal.
4. Field yang tidak disebut penutur tetap kosong. Jangan mengisi nilai tebakan agar tampilan terlihat lengkap.

> **Catatan keputusan.** Sisi server semula dirancang menerima berkas audio dan menjalankan Whisper. Website mengirim transkrip teks. PRD ini memilih pendekatan website: gateway menerima transkrip, Whisper tidak perlu dimuat, dan VRAM 6 GB pada host sepenuhnya untuk Qwen. Konsekuensinya pencatatan suara hanya berfungsi di Chrome dan Edge. Bila akurasi Bahasa Indonesia ternyata tidak memadai, jalur audio dapat ditambahkan kemudian tanpa membatalkan jalur ini.

---

## 7. Perbaikan yang wajib ikut

Empat celah ini ditemukan saat mencocokkan kontrak kedua repository. Masing-masing sudah ditugaskan ke workstream pada bagian 9.

### 7.1 Dua base URL untuk satu gateway

`src/lib/paralab/api.ts` memakai `VITE_MODEL_API_BASE` dengan default `http://localhost:7860`, sedangkan `src/lib/paralab/f3.ts` memakai `VITE_PARALAB_F3_URL` dengan default `http://127.0.0.1:8000`. Karena satu proses melayani semuanya, konfigurasi yang hanya mengisi salah satu membuat panel F3 abstain terus sementara panel lain normal. Gejala ini sangat membingungkan saat demo.

Perbaikan: jadikan `VITE_PARALAB_F3_URL` opsional yang jatuh ke `MODEL_API_BASE` bila tidak diisi, dan dokumentasikan keduanya di `.env.example`.

### 7.2 Website tidak pernah mengirim `checkpoint` ke F4

`toF4RequestFromF3()` menerima argumen kedua `checkpoint`, tetapi pemanggilnya tidak pernah mengisinya. Akibatnya F4 tidak dapat menunjuk `ph`, `viscosity_cp`, atau `appearance` yang belum terisi, padahal kemampuan itu sudah ada di sisi server.

Perbaikan: kirim checkpoint terkonfirmasi terakhir dari batch yang sedang dibuka.

### 7.3 F2 dipanggil dengan `context` kosong

`toF2Request()` selalu mengirim `context: {}`, sedangkan `f3.ts` mengirim `{ target_skin: "oily" }`. Formula yang sama karena itu dapat menghasilkan status berbeda antara kartu skrining dan panel Sentinel pada halaman yang sama.

Perbaikan: isi `context` dengan konteks proyek yang sama seperti yang dipakai jalur F3.

### 7.4 Heuristik lokal yang menyamar sebagai keluaran model

Pada `master`, `src/lib/paralab/ai.ts` menghasilkan saran formula dari tabel klaim ke bahan yang ditulis tangan, tetapi sebagian UI menyebutnya hasil AI. Setelah F1 aktif, penyebutan itu harus dipisahkan dengan tegas.

Perbaikan: setiap keluaran `ai.ts` yang tetap dipakai ditandai dengan `BandProvenance` bervarian `heuristik`.

---

## 8. Fondasi yang sudah disiapkan

Agar ketiga workstream tidak membuat lapisan transport masing-masing, berkas berikut sudah berada di `master` sebelum pekerjaan dimulai:

| Berkas | Isi |
|---|---|
| `src/lib/paralab/api.ts` | `MODEL_API_BASE`, `postJson()`, dan `ModelApiError` |
| `src/vite-env.d.ts` | Tipe untuk kedua variabel `VITE_` |
| `vitest.config.ts` | Lingkungan `jsdom`, alias `@`, pola `src/**/*.test.{ts,tsx}` |
| `package.json` | Skrip `test` dan dependency vitest, jsdom, testing-library |
| `.env.example` | Kedua base URL beserta penjelasan keterkaitannya |

Jangan membuat ulang atau menggandakan berkas ini. Bila `postJson()` kurang, perluas berkas yang ada dan sebutkan di deskripsi merge.

---

## 9. Pembagian kerja

Tiga workstream berjalan paralel dari `master`. Pembagian dilakukan menurut **kepemilikan berkas**, bukan menurut lapisan, supaya dua jalur tidak pernah menyunting berkas yang sama kecuali pada satu berkas yang sudah diatur khusus.

### WS-1, branch `feat/f2-f4-journal`

Cakupan: F2 dan F4, keduanya hidup di halaman jurnal.

Berkas yang dimiliki penuh:

```text
src/lib/paralab/model-adapters.ts        (baru, port dari feat/model-integration)
src/lib/paralab/f4-adapter.ts            (baru, port)
src/components/paralab/FormulaScreeningCard.tsx   (baru, port)
src/components/paralab/NextValidationCard.tsx     (baru, port)
src/routes/journal.$id.tsx               (ubah, pemilik tunggal)
```

Termasuk perbaikan 7.2 dan 7.3. Port juga berkas test yang sudah ada pada branch lama untuk keempat berkas pertama.

### WS-2, branch `feat/f1-copilot`

Cakupan: F1 Evidence Copilot.

```text
src/components/paralab/DocCopilot.tsx    (ubah, port + gabung dengan versi master)
src/routes/doc.$id.tsx                   (ubah, HANYA blok copilot)
```

Versi `master` dan versi branch lama dari `DocCopilot.tsx` sama-sama berubah, jadi ini penggabungan, bukan penyalinan. Pertahankan fungsi `jawab()` sebagai fallback lokal beserta penandanya.

### WS-3, branch `feat/f5-voicelog`

Cakupan: F5 Voice Log dan perbaikan 7.1.

```text
src/lib/paralab/f5-adapter.ts            (baru, port)
src/components/paralab/VoiceLog.tsx      (ubah, port + gabung dengan versi master)
src/lib/paralab/f3.ts                    (ubah kecil, perbaikan 7.1 saja)
src/routes/doc.$id.tsx                   (ubah, HANYA blok voice log)
```

### Aturan anti-konflik

1. **Jangan menyentuh berkas milik workstream lain.** Bila butuh perubahan di sana, tulis di deskripsi merge, jangan kerjakan sendiri.
2. `src/routes/doc.$id.tsx` dipakai WS-2 dan WS-3. Keduanya hanya boleh menambah import miliknya sendiri dan menyunting blok JSX miliknya sendiri. Dilarang memformat ulang berkas, mengurutkan ulang import, atau merapikan kode di luar blok sendiri.
3. Dilarang menjalankan `prettier --write .` pada seluruh proyek. Format hanya berkas yang memang disunting.
4. Dilarang menambahkan `package-lock.json`. Repository ini memakai `bun.lock`.
5. Dilarang mengubah `package.json`, `vitest.config.ts`, `vite.config.ts`, `tsconfig.json`, dan `.env.example`. Semua sudah disiapkan pada bagian 8.
6. Satu workstream, satu branch, beberapa commit kecil yang dapat dibaca. Jangan satu commit raksasa.

---

## 10. Standar kode

1. **TypeScript ketat.** `tsconfig.json` mengaktifkan `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, dan `noPropertyAccessFromIndexSignature`. Akses field dari tipe indeks memakai kurung siku, contohnya `data["decision"]`, dan hasil indeks array harus diperlakukan mungkin `undefined`.
2. **Bahasa.** Nama fungsi dan komentar mengikuti gaya yang sudah ada, yaitu Bahasa Indonesia untuk domain dan komentar penjelas. Komentar hanya ditulis bila menjelaskan alasan, bukan mengulang isi kode.
3. **Tanpa em dash** pada teks yang tampil di UI.
4. **Tanpa emoji** kecuali diminta.
5. **Test.** Setiap adapter baru membawa test unit. Jalankan `npx vitest run` sebelum menyatakan selesai.
6. **Lint.** Jalankan `npx eslint` pada berkas yang disentuh dan pastikan bersih.

> **Catatan lingkungan.** Repository memakai `bun.lock`, tetapi `bun` belum terpasang di semua mesin. Bila `bun` tidak tersedia, pasang dependency dengan `npm install --no-package-lock` supaya `package-lock.json` tidak ikut terbentuk, lalu pakai `npx`. `bun.lock` tidak boleh disunting tangan.

---

## 11. Definition of done per workstream

### WS-1

```text
[ ] Tombol periksa formula memanggil /v1/f2/health-check dan merender rule_id, rule_version, source_id
[ ] overall_status unknown ditampilkan sebagai penghenti, bukan peringatan ringan
[ ] context yang dikirim F2 sama dengan yang dipakai jalur F3, bukan objek kosong
[ ] Kartu langkah validasi memanggil /v1/f4/next-validation dan menolak rekomendasi tanpa requires_human_review
[ ] checkpoint terkonfirmasi terakhir ikut dikirim ke F4
[ ] Gateway mati menghasilkan pesan yang terbaca pada kedua kartu, bukan kartu kosong
[ ] Test unit untuk model-adapters dan f4-adapter lulus
```

### WS-2

```text
[ ] Copilot memanggil /v1/f1/query dan menampilkan daftar evidence beserta source_id
[ ] answer bernilai null dirender sebagai keadaan normal dengan keterangan evidence tidak cukup
[ ] limitations dari server selalu tampil
[ ] Fallback lokal tetap ada dan ditandai jelas sebagai jawaban lokal
[ ] Perubahan UI terbaru dari master pada halaman dokumen tidak hilang
[ ] Test unit DocCopilot lulus
```

### WS-3

```text
[ ] Tombol mikrofon menghasilkan draft dari /v1/f5/transcribe-draft
[ ] Draft tanpa requires_confirmation ditolak dan tidak dirender
[ ] trial_id pada request berasal dari halaman jurnal yang dibuka
[ ] Tidak ada nilai yang masuk jurnal sebelum peneliti menekan konfirmasi
[ ] VITE_PARALAB_F3_URL yang kosong jatuh ke MODEL_API_BASE
[ ] Test unit f5-adapter dan VoiceLog lulus
```

---

## 12. Rencana penggabungan

Digabung berurutan, bukan bersamaan, supaya konflik muncul satu per satu dan mudah ditelusuri.

```text
1. feat/f2-f4-journal   →  master     pemilik tunggal journal.$id.tsx, paling sedikit risiko
2. feat/f1-copilot      →  master     konflik yang mungkin: blok import doc.$id.tsx
3. feat/f5-voicelog     →  master     konflik yang mungkin: blok import dan JSX doc.$id.tsx
```

Setelah setiap penggabungan: jalankan test, lint, dan build. Jangan menggabungkan jalur berikutnya sebelum yang sebelumnya hijau.

Setelah ketiganya masuk, jalankan uji ujung ke ujung berikut dengan gateway hidup:

```text
[ ] Buka jurnal, periksa formula, lihat rule F2 lengkap dengan versinya
[ ] Jalankan Panel Sentinel, lihat alert atau lanjutkan observasi, tidak pernah lolos lebih awal
[ ] Matikan gateway, pastikan seluruh panel menampilkan alasan kegagalan, bukan angka pengganti
[ ] Minta langkah validasi berikutnya, pastikan bertanda wajib review manusia
[ ] Tanya copilot, pastikan jawabannya membawa sumber dan limitasi
[ ] Rekam catatan suara, pastikan draft harus dikonfirmasi sebelum masuk jurnal
```

---

## 13. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Penggabungan menghapus pekerjaan UI terbaru di `master` | Halaman spesimen dan uji stabilitas mundur | Port ke atas `master`, jangan merge branch lama secara utuh |
| Dua workstream menyunting `doc.$id.tsx` | Konflik saat merge | Kepemilikan blok diatur pada bagian 9, urutan merge ditetapkan pada bagian 12 |
| `package-lock.json` ikut terbawa dari branch lama | Dua lockfile yang bertengkar | Dilarang eksplisit pada bagian 9 |
| Gateway belum menyediakan F1, F2, dan F5 saat website siap | Tombol gagal saat demo | Seluruh panel wajib menampilkan abstain yang menjelaskan diri, sehingga website tetap layak didemokan |
| Fallback lokal disangka keluaran model | Klaim melampaui bukti | Penandaan wajib pada prinsip 3 di bagian 4 |
