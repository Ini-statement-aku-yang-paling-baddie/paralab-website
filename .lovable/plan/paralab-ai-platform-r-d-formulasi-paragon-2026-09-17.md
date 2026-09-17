# paralab.ai — Platform R&D Formulasi Paragon

Aplikasi web ringan untuk peneliti R&D: homepage, login, dashboard R&D lintas peneliti, monitoring IoT laboratorium real time, dan jurnal praktikum elektronik yang dibantu AI dari batch ke batch.

## Alur utama

```text
Homepage  ->  Login  ->  Dashboard R&D (3 grafik + daftar batch)
                              |
                              +-> Monitoring IoT Lab (sensor real time)
                              +-> Logbook / ELN
                              +-> Tambah Jurnal Baru
                                    1. Input brief produk + target parameter
                                    2. AI usul formula: resep, HPP, status halal,
                                       clash bahan, grafik prediksi, riset serupa
                                    3. Researcher revisi (tambah/kurangi zat, ubah
                                       kadar, tambah parameter target)
                                    4. Setuju -> AI buat jurnal praktikum kosong
                                       (tujuan, hipotesis, prosedur, tabel kosong)
                                    5. Researcher isi hasil uji (nilai dari sensor)
                                    6. Tombol "RnD Batch N Selesai"
                                    7. AI + feedback peneliti -> evaluasi batch,
                                       kekurangan, rekomendasi, rancangan batch N+1
                                    8. Jika sesuai standar -> Kirim ke divisi terkait
```

## Halaman yang dibuat

1. **Homepage** — hero produk, ringkasan nilai, CTA masuk.
2. **Login** — form peneliti (demo, tanpa server).
3. **Dashboard R&D** — tiga grafik: progres batch per proyek, tren parameter kunci lintas batch, distribusi status/kategori produk. Daftar proyek lintas peneliti + drill-down ke daftar batch tiap proyek.
4. **Monitoring IoT Lab** — kartu sensor live yang terus bergerak: suhu ruang, kelembapan, pH, viskositas, konduktivitas, TVOC, partikel udara (PM2.5), tekanan, suhu reaktor, kecepatan pengaduk, turbiditas, aliran air, suhu chiller, CO2, cahaya UV, kebisingan. Grafik garis bergulir, ambang batas aman, dan panel alarm.
5. **Jurnal Baru (wizard)** — langkah 1-4 di alur atas, termasuk panel revisi formula.
6. **Jurnal Praktikum / ELN** — halaman jurnal per batch: tujuan, bahan dengan badge clash/halal, tabel hasil uji yang otomatis mengambil nilai sensor, grafik instan, catatan observasi, tanda tangan & timestamp, tombol selesai batch.
7. **Evaluasi Batch** — hasil analisis AI, perbandingan antar batch, rancangan penelitian batch berikutnya.
8. **Logbook Laboratorium** — daftar entri kronologis ala electronic lab notebook: waktu, peneliti, aksi, batch terkait, nilai sensor saat itu.
9. **Kirim ke Divisi** — ringkasan handover (formula final, HPP, kepatuhan, lampiran batch) dan pilihan divisi tujuan.

## Desain

- Tema warna Paragon: biru tua korporat sebagai primer, aksen biru terang, latar terang bersih, kartu lembut membulat, sidebar ikon kiri seperti referensi dashboard yang dilampirkan.
- Tipografi dan komponen kustom, bukan tampilan template standar. Tanpa em dash di seluruh teks.
- Semua warna dan gaya lewat token desain terpusat agar ringan dan konsisten.

## Catatan teknis

- Prototipe front end: data proyek, batch, formula, dan sensor memakai data dummy realistis di dalam aplikasi, sesuai batasan PRD. Sensor disimulasikan dengan interval timer sehingga terlihat real time tanpa backend.
- Grafik memakai Recharts, ringan dan sudah tersedia.
- Aksi AI (usul formula, jurnal kosong, evaluasi batch) memakai generator deterministik dari data dummy agar halaman tetap cepat; struktur kode disiapkan supaya nanti mudah disambungkan ke model AI sungguhan.
- Login bersifat demo di sisi klien. Bila nanti diperlukan akun asli, database, dan penyimpanan jurnal permanen, itu ditambahkan pada tahap berikutnya.
