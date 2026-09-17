import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Leaf, Wallet } from "lucide-react";
import { hitungSustain } from "@/lib/paralab/prediksi";
import { formatRupiah, type Ingredient } from "@/lib/paralab/data";

export function PanelSustain({ bahan }: { bahan: Ingredient[] }) {
  const s = useMemo(() => hitungSustain(bahan), [bahan]);

  const warnaSkor = s.skor >= 80 ? "text-success" : s.skor >= 65 ? "text-brand" : s.skor >= 50 ? "text-warning" : "text-danger";

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Wallet className="size-4 text-brand" /> Estimasi biaya per unit
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{formatRupiah(s.biayaPerUnit)}</p>
        <p className="text-xs text-muted-foreground">Bahan {formatRupiah(s.biayaBahan)} per 50 ml, diperbarui setiap komposisi berubah.</p>
      </div>

      <div className="border-t border-border pt-3">
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Leaf className="size-4 text-success" /> Skor keberlanjutan
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={"text-2xl font-bold tracking-tight " + warnaSkor}>{s.skor}</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">{s.peringkat}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-success" style={{ width: s.skor + "%" }} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-secondary p-2.5">
          <dt className="text-muted-foreground">Biodegradabilitas</dt>
          <dd className="mt-0.5 text-base font-bold text-foreground">{s.biodegRata} persen</dd>
        </div>
        <div className="rounded-xl bg-secondary p-2.5">
          <dt className="text-muted-foreground">Sumber terbarukan</dt>
          <dd className="mt-0.5 text-base font-bold text-foreground">{s.porsiTerbarukan} persen</dd>
        </div>
        <div className="rounded-xl bg-secondary p-2.5">
          <dt className="text-muted-foreground">Jejak karbon</dt>
          <dd className="mt-0.5 text-base font-bold text-foreground">{s.co2PerUnit} g CO2e</dd>
        </div>
        <div className="rounded-xl bg-secondary p-2.5">
          <dt className="text-muted-foreground">Kebutuhan air</dt>
          <dd className="mt-0.5 text-base font-bold text-foreground">{s.airPerUnit} ml</dd>
        </div>
      </dl>

      {s.penyumbangCo2.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Penyumbang karbon terbesar</p>
          <div className="mt-2 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.penyumbangCo2} layout="vertical" margin={{ left: 4, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="nama" width={96} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => v + " g CO2e"} />
                <Bar dataKey="co2" radius={[0, 6, 6, 0]}>
                  {s.penyumbangCo2.map((_, i) => (
                    <Cell key={i} fill={"var(--chart-" + ((i % 5) + 1) + ")"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <ul className="space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        {s.sorotan.map((x, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="text-brand">•</span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
