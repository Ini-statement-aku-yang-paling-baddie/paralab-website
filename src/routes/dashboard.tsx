import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Clock3, FlaskConical, NotebookPen, Radio, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { PrimaryButton, Stat, StatStrip } from "@/components/paralab/ui";
import { useAppState } from "@/lib/paralab/store";
import type { Project } from "@/lib/paralab/data";
import { fotoPeneliti } from "@/lib/paralab/researchers";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard RnD Lintas Peneliti | paralab.ai" },
      {
        name: "description",
        content:
          "Pantau seluruh penelitian formulasi aktif, progres tiap batch, dan capaian parameter target dalam satu dashboard.",
      },
      { property: "og:title", content: "Dashboard RnD Lintas Peneliti | paralab.ai" },
      {
        property: "og:description",
        content: "Grafik progres batch, tren parameter, dan status penelitian seluruh tim R&D.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const WARNA = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function capaian(p: Project, nomor: number) {
  const batch = p.batches.find((b) => b.nomor === nomor);
  if (!batch) return 0;
  if (batch.evaluasi) return batch.evaluasi.skorKesesuaian;
  const terisi = batch.hasil.filter((h) => h.nilai !== null);
  if (terisi.length === 0) return 0;
  let lolos = 0;
  for (const h of terisi) {
    const t = p.targets.find((x) => x.id === h.paramId);
    if (t && Math.abs((h.nilai ?? 0) - t.target) <= t.toleransi) lolos += 1;
  }
  return Math.round((lolos / p.targets.length) * 100);
}

export function DashboardPage() {
  const { projects, user } = useAppState();
  const tamuDemo = user?.peran === "Pengamat";

  const maksBatch = Math.max(1, ...projects.map((p) => p.batches.length));
  const dataTren = Array.from({ length: maksBatch }, (_, i) => {
    const row: Record<string, string | number> = { batch: "Batch " + (i + 1) };
    for (const p of projects.slice(0, 4)) {
      row[p.judul.split(" ")[0]!] = capaian(p, i + 1);
    }
    return row;
  });

  const totalBatch = projects.reduce((t, p) => t + p.batches.length, 0);
  const aktif = projects.filter((p) => p.status !== "Selesai").length;
  const tinjauan = projects.filter((p) => p.status === "Menunggu Tinjauan");
  const dipantau = projects.filter((p) => p.batches.some((b) => b.status === "pemantauan"));

  function statusClass(status: Project["status"]) {
    if (status === "Selesai") return "bg-success text-success";
    if (status === "Menunggu Tinjauan") return "bg-warning text-warning";
    if (status === "Sedang Berjalan") return "bg-brand text-brand";
    return "bg-muted-foreground text-muted-foreground";
  }

  return (
    <AppShell
      judul="Dashboard RnD"
      deskripsi="Kendali penelitian formulasi, aktivitas batch, dan kondisi laboratorium."
      aksi={
        tamuDemo ? undefined : (
          <Link to="/journal/new">
            <PrimaryButton>
              <NotebookPen className="size-4" /> Tambah Jurnal Baru
            </PrimaryButton>
          </Link>
        )
      }
    >
      {tamuDemo && (
        <div className="mb-4 border-l-2 border-brand bg-brand-soft/50 p-3 text-sm text-foreground">
          <p className="font-semibold">Mode contoh, lihat saja</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Dashboard dan pemantauan lab dapat ditinjau, tetapi jurnal dan data penelitian tidak tersedia
            untuk tamu.
          </p>
        </div>
      )}
      <p className="mb-4 text-xs text-muted-foreground">
        Simulasi profesional untuk alur kerja laboratorium, bukan formula komersial atau data
        internal Vinara.
      </p>

      <StatStrip>
        <Stat label="Penelitian aktif" value={String(aktif)} hint="lintas kategori" />
        <Stat label="Batch tercatat" value={String(totalBatch)} hint="seluruh siklus" />
        <Stat label="Perlu ditinjau" value={String(tinjauan.length)} hint="menunggu keputusan" />
        <Stat label="Kanal sensor" value="22" hint="pembaruan 2 detik" />
      </StatStrip>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="border border-border bg-card">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 className="font-display text-base font-semibold text-foreground">
                Tren kesesuaian parameter
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Persentase hasil dalam rentang target per batch
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground">0–100%</span>
          </div>
          <div className="h-52 px-3 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTren} margin={{ left: -20, right: 12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="batch"
                  tick={{ fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} />
                <Tooltip />
                {projects.slice(0, 4).map((p, i) => (
                  <Line
                    key={p.id}
                    type="linear"
                    dataKey={p.judul.split(" ")[0]!}
                    stroke={WARNA[i % WARNA.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-3">
            {projects.slice(0, 4).map((p, i) => (
              <span key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <i className="size-2" style={{ background: WARNA[i % WARNA.length] }} />
                {p.judul.split(" ")[0]}
              </span>
            ))}
          </div>
        </section>

        <aside className="border border-border bg-card">
          <div className="border-b border-border px-4 py-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Antrean tindakan
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Pekerjaan yang memerlukan respons</p>
          </div>
          <div className="divide-y divide-border">
            {tinjauan.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                to="/journal/$id"
                params={{ id: p.id }}
                className="group block px-4 py-3 hover:bg-secondary"
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-warning">
                  <TriangleAlert className="size-3.5" /> Tinjau hasil batch
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{p.judul}</p>
                <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  Buka penelitian{" "}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
            {dipantau.slice(0, 2).map((p) => (
              <Link
                key={p.id}
                to="/journal/$id"
                params={{ id: p.id }}
                className="group block px-4 py-3 hover:bg-secondary"
              >
                <p className="flex items-center gap-2 text-xs font-semibold text-brand">
                  <Clock3 className="size-3.5" /> Jadwal foto droplet
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{p.judul}</p>
              </Link>
            ))}
          </div>
          <div className="border-t border-border bg-secondary px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-success">
              <Radio className="size-3.5" /> 22 kanal sensor aktif
            </p>
          </div>
        </aside>
      </div>

      <section className="mt-5 border border-border bg-card">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-foreground">
              Daftar penelitian R&D
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {projects.length} proyek, diurutkan berdasarkan aktivitas terbaru
            </p>
          </div>
          <FlaskConical className="size-5 shrink-0 text-brand" />
        </div>
        <div className="overflow-x-auto">
          <table className="table-clear min-w-[940px] w-full text-left text-sm">
            <thead className="bg-secondary">
              <tr className="text-xs font-semibold uppercase text-muted-foreground">
                <th className="px-4 py-3">Penelitian</th>
                <th className="px-4 py-3">Peneliti</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Batch aktif</th>
                <th className="px-4 py-3">Capaian</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const batch = p.batches.at(-1);
                const skor = batch ? capaian(p, batch.nomor) : 0;
                return (
                  <tr key={p.id} className="hover:bg-secondary/60">
                    <td className="max-w-sm px-4 py-3">
                      {tamuDemo ? (
                        <span className="font-semibold text-foreground">{p.judul}</span>
                      ) : (
                        <Link
                          to="/journal/$id"
                          params={{ id: p.id }}
                          className="font-semibold text-foreground hover:text-brand"
                        >
                          {p.judul}
                        </Link>
                      )}
                      <p className="mt-1 truncate text-xs text-muted-foreground">{p.tim}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {fotoPeneliti(p.peneliti) ? (
                          <img
                            src={fotoPeneliti(p.peneliti)}
                            alt=""
                            className="size-8 shrink-0 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                            {p.peneliti[0]}
                          </span>
                        )}
                        <span className="whitespace-nowrap text-xs font-medium text-foreground">
                          {p.peneliti}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.kategori}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {batch ? `B-${String(batch.nomor).padStart(2, "0")}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 bg-secondary">
                          <div className="h-full bg-brand" style={{ width: `${skor}%` }} />
                        </div>
                        <span className="font-mono text-xs text-foreground">{skor}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-foreground">
                        <i className={`size-2 ${statusClass(p.status).split(" ")[0]}`} />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
