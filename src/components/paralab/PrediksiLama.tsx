import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, FlaskConical } from "lucide-react";
import { prediksiJangkaPanjang } from "@/lib/paralab/prediksi";
import type { Ingredient } from "@/lib/paralab/data";

export function PrediksiLama({ bahan }: { bahan: Ingredient[] }) {
  const p = useMemo(() => prediksiJangkaPanjang(bahan), [bahan]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Kotak
          label="Umur simpan prediksi"
          nilai={p.umurSimpanBulan + " bulan"}
          sub={"Kedaluwarsa sekitar " + p.tanggalKadaluarsa}
        />
        <Kotak
          label="Masa pakai setelah dibuka"
          nilai={p.paoBulan + " bulan"}
          sub="Usulan penandaan PAO pada kemasan"
        />
        <Kotak
          label="Energi aktivasi"
          nilai={p.energiAktivasi + " kJ/mol"}
          sub="Dasar perhitungan model Arrhenius"
        />
        <Kotak
          label="Kadar aktif bulan ke 12"
          nilai={p.kurva[6]!.kadar25 + " persen"}
          sub="Penyimpanan suhu ruang 25 C"
        />
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <FlaskConical className="size-4 text-brand" /> Prediksi penurunan kadar aktif dan oksidasi
        </p>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={p.kurva} margin={{ left: -12, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="bulan" tickFormatter={(v) => "B" + v} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(v) => "Bulan ke " + v} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="kadar25"
                name="Kadar aktif 25 C"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="kadar40"
                name="Kadar aktif 40 C"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="peroksida"
                name="Nilai peroksida meq/kg"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="deltaE"
                name="Delta E warna"
                stroke="var(--chart-4)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            <CalendarClock className="size-4 text-brand" /> Umur simpan menurut suhu penyimpanan
          </p>
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-muted-foreground">
                <th className="py-1">Suhu</th>
                <th className="py-1">Laju degradasi harian</th>
                <th className="py-1">Umur simpan</th>
              </tr>
            </thead>
            <tbody>
              {p.arrhenius.map((a) => (
                <tr key={a.suhu} className="border-t border-border">
                  <td className="py-1.5 font-medium text-foreground">{a.suhu}</td>
                  <td className="py-1.5 text-muted-foreground">{a.lajuHarian} persen</td>
                  <td className="py-1.5 font-semibold text-brand">{a.umurBulan} bulan</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <p className="text-sm font-bold text-foreground">Peta risiko uji jangka panjang</p>
          <ul className="mt-2 space-y-2.5">
            {p.risiko.map((r) => (
              <li key={r.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{r.label}</span>
                  <span className="text-muted-foreground">{r.skor} dari 100</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={
                      "h-full rounded-full " +
                      (r.skor >= 65 ? "bg-danger" : r.skor >= 40 ? "bg-warning" : "bg-success")
                    }
                    style={{ width: Math.max(4, r.skor) + "%" }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.catatan}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        {p.catatan.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

function Kotak({ label, nilai, sub }: { label: string; nilai: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground">{nilai}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
