import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Boxes, Search } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { Card, CardTitle, Pill, Stat, inputClass } from "@/components/paralab/ui";
import { BAHAN_LIBRARY } from "@/lib/paralab/data";
import { DialogStok } from "@/components/paralab/StokBahan";
import { SEMUA_LOT, lotBahan, ringkasStok } from "@/lib/paralab/warehouse";

export const Route = createFileRoute("/warehouse")({
  head: () => ({
    meta: [
      { title: "Gudang Bahan Baku | paralab.ai" },
      { name: "description", content: "Ketersediaan bahan baku laboratorium lengkap dengan asal bahan, nomor lot, kuantitas, nomor rak, dan tanggal kedaluwarsa." },
      { property: "og:title", content: "Gudang Bahan Baku | paralab.ai" },
      { property: "og:description", content: "Pantau stok, lot, dan posisi rak bahan baku sebelum memulai batch penelitian." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GudangPage,
});

function GudangPage() {
  const [cari, setCari] = useState("");
  const [golongan, setGolongan] = useState("Semua golongan");
  const [dipilih, setDipilih] = useState<string | null>(null);

  const golonganOpsi = useMemo(() => ["Semua golongan", ...new Set(BAHAN_LIBRARY.map((b) => b.golongan))], []);

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return BAHAN_LIBRARY.filter((b) => {
      const cocokGol = golongan === "Semua golongan" || b.golongan === golongan;
      const cocokCari = q.length === 0 || (b.name + " " + b.inci + " " + b.cas).toLowerCase().includes(q);
      return cocokGol && cocokCari;
    });
  }, [cari, golongan]);

  const totalLot = SEMUA_LOT.length;
  const karantina = SEMUA_LOT.filter((l) => l.status === "Karantina").length;
  const menipis = SEMUA_LOT.filter((l) => l.status === "Stok menipis").length;
  const bahanDipilih = BAHAN_LIBRARY.find((b) => b.id === dipilih) ?? null;

  return (
    <AppShell judul="Gudang bahan baku" deskripsi="Ketersediaan bahan, asal bahan, nomor lot, kuantitas, dan posisi rak di gudang laboratorium.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Jenis bahan" value={String(BAHAN_LIBRARY.length)} hint="Terdaftar pada katalog bahan" />
        <Stat label="Lot aktif" value={String(totalLot)} hint="Seluruh zona penyimpanan" />
        <Stat label="Lot karantina" value={String(karantina)} hint="Menunggu hasil pemeriksaan mutu" />
        <Stat label="Lot stok menipis" value={String(menipis)} hint="Perlu pengajuan pembelian" />
      </div>

      <Card className="mt-5">
        <CardTitle title="Daftar ketersediaan bahan" sub="Tekan satu bahan untuk melihat lot, rak, asal bahan, dan struktur 2D molekulnya." />
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-60 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className={inputClass + " pl-9"} placeholder="Cari nama bahan, INCI, atau nomor CAS" value={cari} onChange={(e) => setCari(e.target.value)} />
          </div>
          <select className={inputClass + " max-w-64"} value={golongan} onChange={(e) => setGolongan(e.target.value)}>
            {golonganOpsi.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Bahan</th>
                <th className="py-2 pr-3">Golongan</th>
                <th className="py-2 pr-3">Stok siap pakai</th>
                <th className="py-2 pr-3">Lot</th>
                <th className="py-2 pr-3">Rak utama</th>
                <th className="py-2 pr-3">Asal</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((b) => {
                const s = ringkasStok(b.id);
                if (!s) return null;
                return (
                  <tr key={b.id} className="cursor-pointer border-b border-border/70 hover:bg-secondary" onClick={() => setDipilih(b.id)}>
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold text-foreground">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.inci}</p>
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{b.golongan}</td>
                    <td className="py-2.5 pr-3 font-semibold text-foreground">
                      {s.total} {s.satuan}
                    </td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{s.jumlahLot} lot</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{s.rakUtama}</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{s.asalUtama}</td>
                    <td className="py-2.5">
                      <Pill variant={s.status === "Tersedia" ? "aman" : s.status === "Karantina" ? "bahaya" : "waspada"}>{s.status}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-5">
        <CardTitle title="Lot terbaru diterima" sub="Sepuluh penerimaan bahan terakhir beserta sertifikat analisisnya." />
        <ul className="space-y-2 text-sm">
          {[...SEMUA_LOT]
            .sort((a, b) => b.diterima.localeCompare(a.diterima))
            .slice(0, 10)
            .map((l) => (
              <li key={l.kode} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
                <span className="flex items-center gap-2">
                  <Boxes className="size-4 text-brand" />
                  <span className="font-semibold text-foreground">{l.nama}</span>
                  <span className="text-xs text-muted-foreground">{l.kode}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {l.kuantitas} {l.satuan} · rak {l.rak} · {l.asal} · diterima {l.diterima} · {l.coa}
                </span>
              </li>
            ))}
        </ul>
      </Card>

      {bahanDipilih && <DialogStok bahan={bahanDipilih} onTutup={() => setDipilih(null)} />}
      <p className="mt-4 text-xs text-muted-foreground">Total {lotBahan(BAHAN_LIBRARY[0]!.id).length > 0 ? SEMUA_LOT.length : 0} lot tercatat pada sistem gudang simulasi.</p>
    </AppShell>
  );
}
