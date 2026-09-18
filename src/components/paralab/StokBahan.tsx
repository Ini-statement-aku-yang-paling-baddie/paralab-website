import { Boxes, X } from "lucide-react";
import type { Ingredient } from "@/lib/paralab/data";
import { Molekul2D } from "@/components/paralab/Molekul2D";
import { kebutuhanBahan, lotBahan, ringkasStok } from "@/lib/paralab/warehouse";

export function StokPill({
  bahanId,
  persen,
  onClick,
}: {
  bahanId: string;
  persen: number;
  onClick: () => void;
}) {
  const s = ringkasStok(bahanId);
  if (!s) return null;
  const cukup = s.total * 1000 >= kebutuhanBahan(persen);
  const nada =
    !cukup || s.status === "Karantina"
      ? "bg-danger-soft text-danger"
      : s.status === "Tersedia"
        ? "bg-success-soft text-success"
        : "bg-warning-soft text-warning";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
        nada
      }
    >
      <Boxes className="size-3" /> Gudang {s.total} {s.satuan} · rak {s.rakUtama}
    </button>
  );
}

export function DialogStok({ bahan, onTutup }: { bahan: Ingredient; onTutup: () => void }) {
  const lots = lotBahan(bahan.id);
  const butuh = kebutuhanBahan(bahan.percent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onTutup}
    >
      <div className="surface-card my-8 w-full max-w-4xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">{bahan.name}</h2>
            <p className="text-sm text-muted-foreground">
              {bahan.inci} · {bahan.golongan} · grade {bahan.grade}
            </p>
          </div>
          <button
            onClick={onTutup}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-[260px_1fr]">
          <div className="space-y-3">
            <Molekul2D bahan={bahan} />
            <div className="rounded-xl border border-border p-3 text-xs">
              <p className="font-bold text-foreground">Data kimia</p>
              <p className="mt-1 text-muted-foreground">CAS {bahan.cas}</p>
              <p className="text-muted-foreground">Kelarutan {bahan.kelarutan}</p>
              <p className="text-muted-foreground">
                pH kerja {bahan.phKerja[0]} sampai {bahan.phKerja[1]}
              </p>
              <p className="text-muted-foreground">Penyimpanan {bahan.penyimpanan}</p>
              <p className="text-muted-foreground">Inkompatibel {bahan.inkompatibel}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-foreground">
              Kebutuhan batch laboratorium 500 gram pada kadar {bahan.percent} persen adalah{" "}
              <span className="font-bold">{butuh} gram</span>.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Lot bahan</th>
                    <th className="py-2 pr-3">Asal dan pemasok</th>
                    <th className="py-2 pr-3">Kuantitas</th>
                    <th className="py-2 pr-3">Rak</th>
                    <th className="py-2 pr-3">Kedaluwarsa</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((l) => (
                    <tr key={l.kode} className="border-b border-border/70 align-top">
                      <td className="py-2 pr-3">
                        <p className="font-semibold text-foreground">{l.kode}</p>
                        <p className="text-muted-foreground">{l.coa}</p>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        <p>{l.asal}</p>
                        <p>{l.pemasok}</p>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-foreground">
                        {l.kuantitas} {l.satuan}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        <p>{l.rak}</p>
                        <p>{l.zona}</p>
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        <p>{l.kadaluarsa}</p>
                        <p>diterima {l.diterima}</p>
                      </td>
                      <td className="py-2 font-semibold text-foreground">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
              Kondisi penyimpanan gudang {lots[0]?.suhuSimpan ?? bahan.penyimpanan}. Gunakan lot
              dengan kedaluwarsa terdekat lebih dahulu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
