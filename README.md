# ParaLab AI Studio

aku ingin workflow nya kamu rubah sedikit, dimana diawali dari halaman homepage dan login dashboard dari rnd yang sedang dilakukan oleh researcher lain / researcher saya, menggunakan three graph yang bisa liat juga batch batch dari rnd nya. aku ingin juga ada real time iot yang mendukung untuk rnd atau keadaan laboratorium, aku ingin sensornya lengkap.

peneliti bisa melakukan tambah jurnal baru peneliti input data dan penelitian yang ingin dilakukan untuk developing produk baru setelah itu ai akan menghasilkan formula beserta grafik grafik fitur yang sudah aku sebutkan sebelumnya yang sudah pernah dilakukan oleh paragon sebelumnya atau benar benar formula yang works secara LLM /  jurnal. dimana hasil outputnya adalah resep / formula/ hpp/ perkiraan halal/haram ,apakah ada clash dll serta fitur fitur yang sudah saya lampirkan di prompt sebelumnya. output tersebut bisa di review ulang oleh researcher seperti mengurangkan atau melebihkan suatu formula, menambahkan zat, mengurangkan zat , menambah parameter produk yang diinginkan dll.

apabila researcher setuju dengan summary diatas, ai akan membuat rancangan penelitian kosong , seperti output, tujuan penelitian, dll. aku ingin bentuknya seperti jurnal praktikum kosong. jurnal praktikum kosong adalah metode yang tetap mementingkan urgensi dari researcher, dimana researcher perlu menguji ulang resep yang telah dibuat oleh AI tersebut. setelah jurnal praktikum selesai dibuat, researcher bisa pencet tulisan RnD batch 1 selesai, setelah itu ai ditambah dengan feedback peneliti akan menganalisis dari jurnal praktikum tersebut kekurangan, rekomendasi, formula dan ide yang akhirnya membuat rancangan penelitian evaluasi untuk batch selanjutnya.

apabila peneliti sudah menghasilkan penelitian yang sesuai dengan standard output dll, aku ingin ada fitur dimana peneliti bisa mengirimkan ke divisi terkait.

aku ingin semua penelitiannya menggunakan parameter parameter yang ditangkap oleh sensor.

aku ingin logbook laboratorium seperti electronik lab notebook bentuknya

aku ingin kamu membuat custom ui/ux tanpa menggunakan emdash, dengan color theme paragon.

dengan referensi design seperti gambar diatas, dan ide pada pdf diatas. aku ingin membuat halaman website yang ringan

untuk namanya adalah paralab.ai

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smart-lab-assist.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7a286d8a-f054-4fa4-9bcd-04f3bf73e9ed).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deployment API configuration

The production browser bundle uses the same-origin path `/api` by default.
Configure the public reverse proxy to forward `/api/*` to the separately
deployed ParaLab backend while preserving the rest of the website origin. The
proxy must remove the `/api` prefix before it forwards requests, because the
backend routes begin at `/v1/*` and `/health`.

No frontend API URL is required for that setup. To use a different **public**
API origin, set `VITE_MODEL_API_BASE` at build time, for example:

```sh
VITE_MODEL_API_BASE=https://api.example.com npm run build
```

`VITE_PARALAB_F3_URL` is optional and should normally remain unset because F3
uses the same gateway. If it is set, use a public origin. Production
`localhost` and `127.0.0.1` values are ignored in favor of `/api` so a local
development setting cannot be shipped accidentally. For local development,
put `VITE_MODEL_API_BASE=http://localhost:7860` in untracked `.env.local`.

Only values prefixed with `VITE_` are exposed to the browser. Never put API
keys, credentials, or backend-only secrets in these variables.
