# Rencana penyempurnaan workflow R&D bertahap

## Tujuan
Membuat alur penelitian terasa berurutan dan terkontrol oleh peneliti: formula disimpan, parameter ditetapkan, pre-check berjalan, jurnal diisi, spesimen akhir disimpan, uji timeframe dijalankan, lalu evaluasi lengkap menentukan batch lanjutan atau keluaran final.

## Perubahan yang akan dibuat

### 1. Penyusunan jurnal baru
- Rata tengah judul kolom dan isi tabel secara konsisten, termasuk tabel formula, hasil uji, checkpoint, dan evaluasi.
- Setelah formula AI tampil, tambahkan aksi **Simpan formula**.
- Sembunyikan blok parameter sampai formula disimpan.
- Setelah parameter disimpan, tampilkan animasi analisis AI sederhana sebelum **Prediktif pre-check kompatibilitas** muncul.
- Tahan pratinjau jurnal dan pembuatan dokumen sampai urutan tersebut selesai.

### 2. Editor jurnal praktikum
- Tambahkan tombol gambar pada toolbar untuk menyisipkan foto sampel di posisi kursor, lengkap dengan pratinjau yang menyatu dengan dokumen.
- Ganti pengujian berbasis citra pada penutupan menjadi **Tambah gambar spesimen akhir** tanpa metrik citra lama.
- Simpan gambar spesimen akhir bersama feedback peneliti ke data batch agar tampil kembali pada dashboard proyek.
- Ganti aksi **Selesaikan praktikum batch N** menjadi **Uji timeframe sampel**.
- Jangan tampilkan evaluasi dan rekomendasi AI langsung di editor setelah feedback disimpan.

### 3. Satu blok uji stabilitas prediktif
- Satukan proses uji sampel, F3 Stability Sentinel, dan checkpoint stabilitas dalam satu blok kerja.
- Alurnya: unggah gambar pengamatan, jalankan **Mulai uji prediktif stabilitas**, tampilkan animasi analisis, lalu tampilkan prediksi shelf life, interaksi bahan aktif, risiko pecah emulsi, dan perubahan warna.
- Hasil prediksi mengisi checkpoint sebagai usulan otomatis. Peneliti tetap mengonfirmasi checkpoint sebelum dianggap sah.
- Pertahankan jadwal pengamatan berkala dan riwayat gambar agar prediksi dapat dibandingkan dari waktu ke waktu.

### 4. Dashboard proyek dan siklus batch
- Hapus blok **Penutupan RnD batch N** dan **Evaluasi AI dan rancangan batch berikutnya** yang lama.
- Setelah uji timeframe selesai, tampilkan status standar dengan kalimat: **Penelitian Anda belum sesuai standar, silakan lanjutkan penelitian ke batch N+1** bila belum lolos.
- Tambahkan satu aksi analisis akhir dengan animasi sederhana yang membaca data proyek, hasil uji, feedback, gambar spesimen, checkpoint, serta isi laporan praktikum.
- Setelah analisis selesai, tampilkan evaluasi lengkap: akar masalah, hubungan dengan formula dan proses, risiko, mitigasi, perubahan formula, prioritas uji, serta rancangan batch selanjutnya.
- Siklus dapat diulang untuk batch berikutnya sampai standar tercapai.
- Tombol unduh ringkasan, Scale-Up Risk Brief, dan kirim ke direktorat hanya tersedia ketika batch telah sesuai standar.

## Teknis dan validasi
- Perluas data batch untuk menyimpan gambar spesimen akhir, status tahap workflow, hasil prediksi stabilitas, dan status analisis akhir.
- Pertahankan data lama agar proyek contoh tetap dapat dibuka.
- Gunakan navigasi internal tanpa membuka tab browser baru.
- Validasi alur lengkap dari pembuatan jurnal sampai batch berikutnya, termasuk unggah gambar, penyimpanan feedback, checkpoint otomatis, dan kondisi tombol keluaran final.
- Periksa tampilan desktop dan viewport yang sedang digunakan agar tabel serta kontrol tidak bertumpuk.
