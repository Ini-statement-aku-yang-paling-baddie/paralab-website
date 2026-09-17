import { AlertOctagon, Factory, Megaphone, ShieldCheck, Wallet } from "lucide-react";
import { Card, CardTitle, Pill } from "@/components/paralab/ui";
import type { Batch, Project } from "@/lib/paralab/data";
import { susunScaleUpBrief } from "@/lib/paralab/scaleup";

export function ScaleUpBrief({ proyek, batch }: { proyek: Project; batch: Batch }) {
  const b = susunScaleUpBrief(proyek, batch);

  return (
    <Card>
      <CardTitle
        title="Scale up risk brief untuk tim produksi"
        sub="Disusun dari pola proyek organisasi yang pernah naik skala pada kategori sejenis."
        right={<Pill variant={b.tingkat === "tinggi" ? "bahaya" : b.tingkat === "sedang" ? "waspada" : "aman"}>Risiko {b.tingkat} {b.skor}/100</Pill>}
      />
      <p className="text-sm text-foreground">{b.ringkasan}</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3">Parameter</th>
              <th className="py-2 pr-3">Skor</th>
              <th className="py-2 pr-3">Arah perubahan</th>
              <th className="py-2 pr-3">Pemicu</th>
              <th className="py-2">Yang harus diawasi</th>
            </tr>
          </thead>
          <tbody>
            {b.parameter.map((p) => (
              <tr key={p.parameter} className="border-b border-border/70 align-top">
                <td className="py-2 pr-3 font-semibold text-foreground">{p.parameter}</td>
                <td className="py-2 pr-3">
                  <Pill variant={p.skor >= 65 ? "bahaya" : p.skor >= 45 ? "waspada" : "aman"}>{p.skor}</Pill>
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{p.arah}</td>
                <td className="py-2 pr-3 text-muted-foreground">{p.pemicu}</td>
                <td className="py-2 text-muted-foreground">{p.pengawasan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Factory className="size-4 text-brand" /> Tahapan kenaikan skala
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {b.tahapan.map((t) => (
              <li key={t.skala}>
                <span className="font-semibold text-foreground">{t.skala}.</span> {t.catatan}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Wallet className="size-4 text-brand" /> HPP dan COGS
          </p>
          <dl className="mt-2 space-y-1 text-xs">
            {b.hpp.map((h) => (
              <div key={h.label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{h.label}</dt>
                <dd className="font-semibold text-foreground">{h.nilai}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="size-4 text-success" /> Kondisi halal
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{b.halal}</p>
        </section>

        <section className="rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Megaphone className="size-4 text-brand" /> Klaim untuk pemasaran
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
            {b.klaim.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-danger/30 bg-danger-soft/40 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-danger">
          <AlertOctagon className="size-4" /> Brief larangan produksi
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground">
          {b.larangan.map((l) => (
            <li key={l.judul}>
              <span className="font-bold">{l.judul}.</span> {l.isi}
            </li>
          ))}
        </ul>
      </section>

      <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
        {b.rujukan.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </Card>
  );
}
