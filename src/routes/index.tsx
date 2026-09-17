import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/paralab/AppShell";
import { useSensors } from "@/hooks/use-sensors";
import { BAHAN_LIBRARY, SENSORS } from "@/lib/paralab/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "paralab.ai | Platform RnD Formulasi Berbasis AI dan Sensor" },
      {
        name: "description",
        content:
          "paralab.ai menyatukan jurnal praktikum elektronik, usulan formula AI, perkiraan HPP, status halal, dan pemantauan sensor laboratorium secara real time.",
      },
      {
        property: "og:title",
        content: "paralab.ai | Platform RnD Formulasi Berbasis AI dan Sensor",
      },
      {
        property: "og:description",
        content:
          "Dari brief produk sampai serah terima ke divisi terkait dalam satu alur penelitian yang terukur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Beranda,
});

const PANEL_SENSOR = ["suhu_reaktor", "ph", "viskositas", "ukuran_droplet"];
const FORMULA_PREVIEW = ["aqua", "glycerin", "niacinamide", "butylene", "hyaluronic"];

const CATATAN = [
  {
    judul: "Status halal menempel di bahan",
    teks: "Tiap bahan membawa sertifikasi, catatan syubhat, dan asal lot-nya sendiri, bukan hanya dicap di level produk.",
  },
  {
    judul: "Batas BPOM ikut terbaca",
    teks: "Kadar yang melewati batas regulasi ketahuan saat draf formula, bukan saat dokumen registrasi ditolak.",
  },
  {
    judul: "HPP dan potensi clash",
    teks: "Biaya per kemasan dan kombinasi bahan yang saling melemahkan muncul sebelum batch pertama ditimbang.",
  },
];

const ALUR = [
  {
    judul: "Brief produk",
    teks: "Kategori, target kulit, klaim, dan standar uji yang dipakai",
    pelaku: "peneliti" as const,
  },
  {
    judul: "Usulan formula",
    teks: "Resep, HPP, status halal, dan grafik prediksi keluar seketika",
    pelaku: "ai" as const,
  },
  {
    judul: "Cek gudang",
    teks: "Ketersediaan lot, asal bahan, dan nomor rak sebelum menimbang",
    pelaku: "peneliti" as const,
  },
  {
    judul: "Jurnal praktikum",
    teks: "Peneliti menguji ulang, nilai parameter diambil dari sensor",
    pelaku: "sensor" as const,
  },
  {
    judul: "Pemantauan",
    teks: "Foto sampel droplet tiap tiga hari, pengingat bila tertunda",
    pelaku: "sensor" as const,
  },
  {
    judul: "Evaluasi batch",
    teks: "Hasil dan umpan balik dibaca, rancangan berikutnya disusun",
    pelaku: "ai" as const,
  },
];

const PELAKU: Record<"ai" | "peneliti" | "sensor", { label: string; dot: string }> = {
  ai: { label: "Dikerjakan AI", dot: "bg-brand" },
  peneliti: { label: "Dikerjakan peneliti", dot: "bg-foreground/60" },
  sensor: { label: "Diisi sensor", dot: "bg-[var(--chart-1)]" },
};

const NADA_STATUS: Record<string, string> = {
  aman: "text-success",
  waspada: "text-warning",
  bahaya: "text-danger",
};

const NADA_HALAL: Record<string, string> = {
  halal: "bg-success-soft text-success",
  syubhat: "bg-warning-soft text-warning",
  haram: "bg-danger-soft text-danger",
};

function PanelSensor() {
  const { readings } = useSensors(2);

  return (
    <figure className="surface-card overflow-hidden">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-secondary px-4 py-2.5">
        <span className="font-mono text-xs font-semibold text-foreground">
          B-04 · Serum Niacinamide
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
          Terhubung
        </span>
      </figcaption>
      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        {PANEL_SENSOR.map((id) => {
          const def = SENSORS.find((s) => s.id === id)!;
          const baca = readings.find((r) => r.id === id)!;
          return (
            <div key={id} className="p-4">
              <p className="text-xs text-muted-foreground">{def.label}</p>
              <p className="mt-1 flex items-baseline gap-1 font-display text-2xl font-semibold tabular-nums text-foreground">
                {baca.nilai.toFixed(def.desimal)}
                <span className="text-sm font-medium text-muted-foreground">{def.unit}</span>
              </p>
              <p
                className={
                  "mt-1.5 text-[11px] font-semibold tabular-nums " + NADA_STATUS[baca.status]
                }
              >
                {def.aman[0]} sampai {def.aman[1]} {def.unit}
              </p>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-2.5 text-[11px] text-muted-foreground">
        Pembacaan diperbarui tiap dua detik dan langsung mengisi parameter di jurnal praktikum.
      </p>
    </figure>
  );
}

function Beranda() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-5">
            <Link
              to="/iot"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Monitoring lab
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-lab absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <div className="lg:col-span-6">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              <span className="h-px w-8 bg-brand" aria-hidden="true" />
              Riset formulasi, tim R&amp;D Paragon
            </p>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl">
              Asisten riset yang paham ritme kerja laboratorium.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
              Usulan formula, pengujian di lab, evaluasi batch, sampai serah terima ke divisi
              terkait berjalan di satu alur dengan satu catatan.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand"
              >
                Mulai penelitian <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/iot"
                className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Lihat monitoring lab
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-4 border-t border-border pt-5">
              {[
                ["22", "kanal sensor"],
                ["6", "tahap per batch"],
                ["5", "divisi penerima"],
              ].map(([angka, label]) => (
                <div key={label}>
                  <dt className="font-display text-xl font-semibold tabular-nums text-foreground">
                    {angka}
                  </dt>
                  <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            <PanelSensor />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Usulan formula
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Brief: serum pencerah, kulit berminyak, klaim niacinamide
                  </p>
                </div>
                <span className="rounded-md bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand-ink">
                  draf AI
                </span>
              </div>
              <ul>
                {FORMULA_PREVIEW.map((id) => {
                  const b = BAHAN_LIBRARY.find((x) => x.id === id)!;
                  return (
                    <li
                      key={id}
                      className="flex items-baseline gap-4 border-b border-border/70 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{b.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {b.inci} · {b.fungsi}
                        </p>
                      </div>
                      <span
                        className={
                          "shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize " +
                          NADA_HALAL[b.halal]
                        }
                      >
                        {b.halal}
                      </span>
                      <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
                        {b.percent}%
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="bg-warning-soft px-5 py-3.5">
                <p className="text-xs leading-relaxed text-foreground">
                  <span className="font-semibold text-warning">Perlu dicek: </span>
                  {BAHAN_LIBRARY.find((x) => x.id === "hyaluronic")!.catatanHalal}.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground">
              Keputusan yang mahal muncul sebelum menimbang
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kesalahan formulasi paling mahal biasanya ketahuan di akhir. paralab.ai menariknya ke
              depan, saat resep masih berupa draf.
            </p>
            <dl className="mt-8">
              {CATATAN.map((c) => (
                <div key={c.judul} className="border-t border-border py-4">
                  <dt className="text-sm font-semibold text-foreground">{c.judul}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.teks}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Alur kerja satu batch
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Enam tahap yang dilewati tiap batch, dari brief produk sampai siap diserahkan ke tim
              produksi.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            {(["ai", "sensor", "peneliti"] as const).map((k) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              >
                <span className={"size-2 rounded-full " + PELAKU[k].dot} aria-hidden="true" />
                {PELAKU[k].label}
              </span>
            ))}
          </div>

          <ol className="relative mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[7px] hidden h-px bg-border lg:block"
            />
            {ALUR.map((a, i) => (
              <li key={a.judul} className="relative">
                <span
                  className={
                    "relative z-10 block size-3.5 rounded-full ring-4 ring-card " +
                    PELAKU[a.pelaku].dot
                  }
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  <span className="tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {a.judul}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{a.teks}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid gap-8 border-t border-border pt-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-display text-base font-semibold text-foreground">
                Setelah evaluasi batch
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Hasil uji dibandingkan dengan standar yang dipilih sejak brief, lalu alurnya
                bercabang.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
              <div className="border-l-2 border-warning pl-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                  Belum sesuai
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  Rancangan batch berikutnya terbentuk beserta usulan penyesuaian kadar bahan.
                </p>
              </div>
              <div className="border-l-2 border-success pl-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-success">
                  Sudah sesuai
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  Laporan praktikum final dan scale up risk brief terbit untuk tim produksi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>paralab.ai, ruang kerja penelitian dan pengembangan produk.</p>
          <p>Prototipe internal tim R&amp;D Paragon</p>
        </div>
      </footer>
    </main>
  );
}
