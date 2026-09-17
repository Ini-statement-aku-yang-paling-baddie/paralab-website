# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Menyambung ke arsitektur ParaLab

Website ini **tidak** menghitung risiko stabilitas sendiri. Panel F3 Stability
Sentinel memanggil API pada repository `paralab-architecture`, yang memuat model
hash-verified dan menjalankan F2 di sisi server.

Jalankan API-nya lebih dulu:

```sh
cd ../paralab-architecture
PARALAB_CORS_ORIGINS="http://localhost:3000" \
  .venv-f3/bin/python -m uvicorn api.app:app --host 127.0.0.1 --port 8000
```

Lalu salin `.env.example` menjadi `.env` bila alamatnya berbeda dari default
`http://127.0.0.1:8000`.

### Batas klaim yang dipegang website

Aturan berikut disalin dari `docs/architecture/architecture_v5.md` dan berlaku di
seluruh layar:

1. **Tidak ada early pass.** Keluaran F3 hanya `flag_high_risk`,
   `continue_observation`, atau abstain. Risiko rendah berarti lanjutkan
   observasi, bukan formula dinyatakan aman.
2. **Abstain lebih aman daripada menebak.** Bila kategori di luar domain yang
   didukung, checkpoint belum lengkap, ada bahan yang tidak dikenali F2, atau
   layanan F3 mati, panel menampilkan abstain beserta alasannya. Website tidak
   pernah mengganti forecast dengan angka heuristik.
3. **Manusia memegang keputusan akhir.** Sensor dan analisis citra hanya
   mengusulkan nilai. Hasil uji dan checkpoint baru sah setelah peneliti menekan
   Konfirmasi, dan hanya checkpoint terkonfirmasi yang dikirim ke F3.
4. **Rule dapat ditelusuri.** Setiap temuan guardrail membawa rule ID, versi
   rule, dan source ID. Status skrining memakai kosakata F2
   (`clear_for_current_screening`, `warning`, `blocked`, `unknown`) dan bukan
   vonis halal atau persetujuan BPOM.
5. **Setiap angka menyebutkan asalnya.** Komponen `BandProvenance` menempel pada
   kartu prediktif untuk memisahkan rule deterministik, pembacaan alat, prediksi
   synthetic-demo, estimasi heuristik, dan keputusan manusia.

Seluruh data dan model dalam prototipe ini berstatus `synthetic_demo` dan
`not_validated_for_production`.
