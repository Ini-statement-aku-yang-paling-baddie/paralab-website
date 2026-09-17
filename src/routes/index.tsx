import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowDown, ArrowRight, BookOpen, FlaskConical, LineChart, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/paralab/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "paralab.ai | Platform RnD Formulasi Berbasis AI dan Sensor" },
      {
        name: "description",
        content: "paralab.ai menyatukan jurnal praktikum elektronik, usulan formula AI, perkiraan HPP, status halal, dan pemantauan sensor laboratorium secara real time.",
      },
      { property: "og:title", content: "paralab.ai | Platform RnD Formulasi Berbasis AI dan Sensor" },
      { property: "og:description", content: "Dari brief produk sampai serah terima ke divisi terkait dalam satu alur penelitian yang terukur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beranda,
});

const FITUR = [
  { icon: Sparkles, judul: "Usulan formula AI", teks: "Masukkan brief produk, dapatkan resep lengkap dengan fungsi tiap bahan dan rujukan penelitian terdahulu." },
  { icon: ShieldCheck, judul: "Halal dan batas BPOM", teks: "Setiap bahan ditandai status halal, syubhat, serta batas kadar regulasi sebelum masuk laboratorium." },
  { icon: LineChart, judul: "Perkiraan HPP dan clash", teks: "Biaya per kemasan dan potensi interaksi antar bahan terlihat sebelum batch pertama dibuat." },
  { icon: Activity, judul: "Sensor laboratorium", teks: "Dua puluh dua kanal sensor memasok parameter penelitian secara langsung ke jurnal praktikum." },
  { icon: BookOpen, judul: "Jurnal praktikum kosong", teks: "AI menyiapkan kerangka penelitian, peneliti tetap wajib menguji ulang dan mencatat observasi." },
  { icon: FlaskConical, judul: "Evaluasi antar batch", teks: "Tutup batch, dapatkan kekurangan, rekomendasi, dan rancangan penelitian untuk batch berikutnya." },
];

const ALUR = [
  { judul: "Brief produk", teks: "Peneliti mengisi kategori, target kulit, klaim, dan standar uji yang dipakai" },
  { judul: "Usulan formula AI", teks: "Resep, HPP, status halal, potensi clash, dan grafik prediksi keluar seketika" },
  { judul: "Cek gudang bahan", teks: "Ketersediaan lot, asal bahan, kuantitas, dan nomor rak diperiksa sebelum menimbang" },
  { judul: "Jurnal praktikum", teks: "Jurnal kosong terbentuk, peneliti menguji ulang dan mengambil nilai dari sensor" },
  { judul: "Pemantauan stabilitas", teks: "Foto sampel droplet setiap tiga hari, aplikasi mengingatkan bila penelitian tertunda" },
  { judul: "Evaluasi batch", teks: "AI membaca hasil dan umpan balik, lalu menyusun rancangan batch berikutnya" },
];

function Beranda() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Link to="/login" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand">
          Masuk dashboard
        </Link>
      </header>

      <section className="relative overflow-hidden">
        <div className="grid-lab absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-brand">
            <Sparkles className="size-3.5" /> Riset formulasi kosmetik untuk tim Paragon
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Experience having a research assistant this advanced!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            paralab.ai memandu peneliti melewati setiap batch penelitian: usulan formula, pengujian laboratorium, evaluasi otomatis, hingga serah terima ke divisi terkait.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand">
              Mulai penelitian
            </Link>
            <Link to="/iot" className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
              Lihat monitoring laboratorium
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FITUR.map((f) => (
            <article key={f.judul} className="surface-card p-5">
              <f.icon className="size-5 text-brand" />
              <h2 className="mt-3 text-base font-bold text-foreground">{f.judul}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.teks}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Diagram alur kerja penelitian</h2>
        <p className="mt-1 text-sm text-muted-foreground">Setiap kotak adalah satu tahap kerja, panah menunjukkan arah perpindahan pekerjaan.</p>

        <ol className="mt-6 grid gap-0 md:grid-cols-2 lg:grid-cols-3">
          {ALUR.map((a, i) => (
            <li key={a.judul} className="relative flex items-stretch pb-8 lg:pb-10">
              <div className="surface-card relative z-10 flex w-full gap-3 p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-ink">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-foreground">{a.judul}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{a.teks}</p>
                </div>
              </div>
              {i < ALUR.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 z-20 hidden size-5 -translate-y-1/2 text-brand md:block lg:[li:nth-child(3n)_&]:hidden" aria-hidden="true" />
              )}
              {i < ALUR.length - 1 && (
                <ArrowDown className="absolute bottom-1 left-1/2 size-5 -translate-x-1/2 text-brand md:hidden" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>

        <div className="surface-card mt-6 p-5">
          <p className="text-sm font-bold text-foreground">Percabangan keputusan setelah evaluasi batch</p>
          <div className="mt-4 flex flex-col items-stretch gap-3 text-sm md:flex-row md:items-center">
            <div className="rounded-xl border border-border bg-secondary px-4 py-3 text-center font-semibold text-foreground">Hasil batch dibandingkan standar</div>
            <ArrowRight className="mx-auto hidden size-5 text-brand md:block" aria-hidden="true" />
            <ArrowDown className="mx-auto size-5 text-brand md:hidden" aria-hidden="true" />
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-warning/50 bg-warning-soft px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-warning">Belum sesuai standar</p>
                <p className="mt-1 text-xs text-foreground">Sistem membuat rancangan batch baru beserta usulan penyesuaian kadar bahan</p>
              </div>
              <div className="rounded-xl border border-success/50 bg-success-soft px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-success">Sudah sesuai standar</p>
                <p className="mt-1 text-xs text-foreground">Laporan praktikum final dan scale up risk brief untuk tim produksi diterbitkan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        paralab.ai, ruang kerja penelitian dan pengembangan produk.
      </footer>
    </main>
  );
}
