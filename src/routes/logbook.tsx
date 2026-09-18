import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Filter, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { Card, CardTitle, Pill, inputClass } from "@/components/paralab/ui";
import { useAppState } from "@/lib/paralab/store";
import { SENSORS } from "@/lib/paralab/data";

export const Route = createFileRoute("/logbook")({
  head: () => ({
    meta: [
      { title: "Logbook Laboratorium Elektronik | paralab.ai" },
      {
        name: "description",
        content:
          "Catatan kronologis seluruh aktivitas laboratorium: siapa, kapan, penelitian apa, dan nilai sensor saat kejadian.",
      },
      { property: "og:title", content: "Logbook Laboratorium Elektronik | paralab.ai" },
      {
        property: "og:description",
        content: "Electronic lab notebook dengan jejak audit tiap entri penelitian.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LogbookPage,
});

function LogbookPage() {
  const { logbook } = useAppState();
  const [cari, setCari] = useState("");
  const [peneliti, setPeneliti] = useState("semua");

  const daftarPeneliti = useMemo(
    () => Array.from(new Set(logbook.map((l) => l.peneliti))),
    [logbook],
  );

  const hasil = logbook.filter((l) => {
    const cocokCari = (l.detail + l.proyek + l.aksi).toLowerCase().includes(cari.toLowerCase());
    const cocokPeneliti = peneliti === "semua" || l.peneliti === peneliti;
    return cocokCari && cocokPeneliti;
  });

  return (
    <AppShell
      judul="Logbook Laboratorium"
      deskripsi="Buku catatan elektronik dengan jejak audit setiap aktivitas riset dan pembacaan sensor."
    >
      <Card>
        <CardTitle
          title="Entri kronologis"
          sub={hasil.length + " entri tercatat"}
          right={
            <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <ShieldCheck className="size-4" /> Tidak dapat diubah setelah tersimpan
            </span>
          }
        />
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex min-w-56 flex-1 items-center gap-2">
            <Filter className="size-4 shrink-0 text-muted-foreground" />
            <input
              className={inputClass}
              placeholder="Cari aktivitas, penelitian, atau catatan"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
            />
          </div>
          <select
            className={inputClass + " max-w-52"}
            value={peneliti}
            onChange={(e) => setPeneliti(e.target.value)}
          >
            <option value="semua">Semua peneliti</option>
            {daftarPeneliti.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <ol className="relative space-y-3 border-l border-border pl-5">
          {hasil.map((l) => {
            const sensor = l.sensor ? SENSORS.find((s) => s.id === l.sensor) : undefined;
            return (
              <li key={l.id} className="relative rounded-xl border border-border bg-card p-4">
                <span className="absolute -left-[26px] top-6 size-2.5 rounded-full bg-brand" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <BookOpen className="size-4 text-brand" /> {l.aksi}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.waktu).toLocaleString("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">{l.detail}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill>{l.peneliti}</Pill>
                  <Pill variant="brand">{l.proyek}</Pill>
                  {sensor && <Pill variant="aman">Sensor {sensor.label}</Pill>}
                </div>
              </li>
            );
          })}
          {hasil.length === 0 && (
            <li className="py-6 text-sm text-muted-foreground">
              Tidak ada entri yang cocok dengan filter.
            </li>
          )}
        </ol>
      </Card>
    </AppShell>
  );
}
