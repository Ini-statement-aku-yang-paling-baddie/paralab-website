import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, CircleCheck, Waves } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { Card, CardTitle, Pill, Stat, StatStrip } from "@/components/paralab/ui";
import { SENSORS } from "@/lib/paralab/data";
import { useSensors } from "@/hooks/use-sensors";

export const Route = createFileRoute("/iot")({
  head: () => ({
    meta: [
      { title: "Monitoring IoT Laboratorium | paralab.ai" },
      {
        name: "description",
        content:
          "Pantau 22 kanal sensor laboratorium secara real time: suhu, kelembapan, pH, viskositas, droplet, gas, dan utilitas.",
      },
      { property: "og:title", content: "Monitoring IoT Laboratorium | paralab.ai" },
      {
        property: "og:description",
        content: "Data sensor laboratorium real time yang langsung menjadi parameter penelitian.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IotPage,
});

const GRUP = [
  "Lingkungan Lab",
  "Reaktor & Proses",
  "Kualitas Sampel",
  "Utilitas & Keselamatan",
] as const;

function IotPage() {
  const { readings, riwayat } = useSensors(45);
  const [pilih, setPilih] = useState("suhu_reaktor");

  const def = SENSORS.find((s) => s.id === pilih)!;
  const dataGrafik = riwayat.map((f) => ({ waktu: f.waktu, nilai: f.nilai[pilih] ?? 0 }));
  const alarm = readings.filter((r) => r.status !== "aman");

  return (
    <AppShell
      judul="Monitoring Laboratorium"
      deskripsi="Pembacaan sensor diperbarui otomatis setiap dua detik dan menjadi sumber data parameter penelitian."
    >
      <StatStrip>
        <Stat
          label="Kanal sensor"
          value={String(SENSORS.length)}
          hint="Empat kelompok pemantauan"
        />
        <Stat
          label="Status aman"
          value={String(readings.filter((r) => r.status === "aman").length)}
          hint="Berada di dalam jendela kerja"
        />
        <Stat
          label="Perlu perhatian"
          value={String(readings.filter((r) => r.status === "waspada").length)}
          hint="Mendekati ambang batas"
        />
        <Stat
          label="Di luar batas"
          value={String(readings.filter((r) => r.status === "bahaya").length)}
          hint="Butuh tindakan operator"
        />
      </StatStrip>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle
            title={"Riwayat langsung " + def.label}
            sub={"Jendela aman " + def.aman[0] + " sampai " + def.aman[1] + " " + def.unit}
            right={
              <select
                className="rounded-xl border border-input bg-card px-3 py-1.5 text-sm"
                value={pilih}
                onChange={(e) => setPilih(e.target.value)}
              >
                {SENSORS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            }
          />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dataGrafik}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="waktu" tick={{ fontSize: 10 }} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="nilai"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#grad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle title="Panel alarm" sub="Sensor yang keluar dari jendela aman" />
          {alarm.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl bg-success-soft px-3 py-4 text-sm font-medium text-success">
              <CircleCheck className="size-4" /> Seluruh kanal berada dalam kondisi aman.
            </p>
          ) : (
            <ul className="space-y-2">
              {alarm.map((a) => {
                const d = SENSORS.find((s) => s.id === a.id)!;
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <AlertTriangle
                        className={
                          a.status === "bahaya" ? "size-4 text-danger" : "size-4 text-warning"
                        }
                      />
                      {d.label}
                    </span>
                    <Pill variant={a.status === "bahaya" ? "bahaya" : "waspada"}>
                      {a.nilai} {d.unit}
                    </Pill>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {GRUP.map((grup) => (
        <div key={grup} className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Waves className="size-4 text-brand" /> {grup}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SENSORS.filter((s) => s.grup === grup).map((s) => {
              const r = readings.find((x) => x.id === s.id)!;
              const rentang = s.aman[1] - s.aman[0];
              const persen = Math.max(2, Math.min(100, ((r.nilai - s.aman[0]) / rentang) * 100));
              return (
                <button
                  key={s.id}
                  onClick={() => setPilih(s.id)}
                  className="surface-card p-4 text-left transition-colors hover:border-brand"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <span
                      className={
                        "mt-1 size-2 shrink-0 rounded-full " +
                        (r.status === "aman"
                          ? "bg-success"
                          : r.status === "waspada"
                            ? "bg-warning"
                            : "bg-danger")
                      }
                    />
                  </div>
                  <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
                    {r.nilai}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">
                      {s.unit}
                    </span>
                  </p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
                    <div
                      className={
                        "h-full rounded-full transition-all " +
                        (r.status === "aman"
                          ? "bg-success"
                          : r.status === "waspada"
                            ? "bg-warning"
                            : "bg-danger")
                      }
                      style={{ width: persen + "%" }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Aman {s.aman[0]} sampai {s.aman[1]} {s.unit}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </AppShell>
  );
}
