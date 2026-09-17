import { useEffect, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Clock } from "lucide-react";
import type { Batch, Project } from "@/lib/paralab/data";
import { jadwalFotoDroplet, statusPemantauan } from "@/lib/paralab/pemantauan";

export function PanelPemantauan({ proyek, batch }: { proyek: Project; batch: Batch }) {
  const [sekarang, setSekarang] = useState<number | null>(null);
  useEffect(() => setSekarang(Date.now()), [proyek.id, batch.nomor]);
  if (sekarang === null) return null;

  const status = statusPemantauan(proyek, batch, sekarang);
  const jadwal = jadwalFotoDroplet(batch, sekarang);
  const warna = status.terhenti ? "border-warning bg-warning-soft" : "border-border bg-card";

  return (
    <section className={"surface-card mb-5 border p-5 " + warna}>
      <div className="flex items-start gap-3">
        {status.terhenti ? <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" /> : <Clock className="mt-0.5 size-5 shrink-0 text-brand" />}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground">
            {status.terhenti ? "Penelitian tertunda" : "Tahap " + status.tahap}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{status.pesan}</p>
        </div>
      </div>

      {status.tugas.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {status.tugas.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Camera className="size-4 text-brand" /> Instruksi foto sampel droplet setiap tiga hari
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ambil foto sampel pada perbesaran 400 kali, unggah pada bagian uji berbasis citra di editor jurnal agar perubahan ukuran droplet terekam.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {jadwal.map((t) => (
            <div
              key={t.hari}
              className={
                "rounded-lg border p-2.5 text-xs " +
                (t.status === "selesai"
                  ? "border-success/40 bg-success-soft text-success"
                  : t.status === "hari ini"
                    ? "border-warning/50 bg-warning-soft text-warning"
                    : "border-border text-muted-foreground")
              }
            >
              <p className="flex items-center gap-1.5 font-bold">
                {t.status === "selesai" && <CheckCircle2 className="size-3.5" />} Hari ke {t.hari}
              </p>
              <p className="mt-0.5">{t.tanggal}</p>
              <p className="mt-0.5 capitalize">{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
