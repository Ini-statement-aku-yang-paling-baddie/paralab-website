import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Download, Send, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/paralab/AppShell";
import { Card, CardTitle, Field, GhostButton, Pill, PrimaryButton, Stat, inputClass } from "@/components/paralab/ui";
import { DIVISI, formatRupiah, hitungHpp } from "@/lib/paralab/data";
import { ringkasKepatuhan } from "@/lib/paralab/ai";
import { actions, useAppState, useProject } from "@/lib/paralab/store";
import { unduhScaleUpBrief } from "@/lib/paralab/scaleup";

export const Route = createFileRoute("/handoff/$id")({
  head: () => ({
    meta: [
      { title: "Kirim Hasil Penelitian ke Divisi | paralab.ai" },
      { name: "description", content: "Ringkasan serah terima formula final, HPP, status halal, dan hasil parameter sensor untuk divisi produksi, regulatori, dan pemasaran." },
      { property: "og:title", content: "Kirim Hasil Penelitian ke Divisi | paralab.ai" },
      { property: "og:description", content: "Serah terima hasil riset formulasi antar divisi dalam satu berkas ringkas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HandoffPage,
});

function HandoffPage() {
  const { id } = Route.useParams();
  const proyek = useProject(id);
  const { user } = useAppState();
  const [divisi, setDivisi] = useState(DIVISI[0] ?? "");
  const [pesan, setPesan] = useState("");
  const [terkirim, setTerkirim] = useState(false);

  if (!proyek) {
    return (
      <AppShell judul="Penelitian tidak ditemukan" deskripsi="Berkas serah terima tidak tersedia.">
        <Card>
          <Link to="/dashboard" className="text-sm font-semibold text-brand">
            Kembali ke dashboard
          </Link>
        </Card>
      </AppShell>
    );
  }

  const batchTerakhir = proyek.batches[proyek.batches.length - 1]!;
  const hpp = hitungHpp(batchTerakhir.bahan);
  const kepatuhan = ringkasKepatuhan(batchTerakhir.bahan);
  const skor = batchTerakhir.evaluasi?.skorKesesuaian ?? 0;
  const lolos = proyek.targets.filter((t) => {
    const h = batchTerakhir.hasil.find((x) => x.paramId === t.id);
    return h?.nilai != null && Math.abs(h.nilai - t.target) <= t.toleransi;
  }).length;

  function kirim() {
    const tujuan = divisi;
    actions.perbaruiProyek(proyek!.id, (p) => ({ ...p, status: "Menunggu Tinjauan", dikirimKe: tujuan, update: new Date().toISOString() }));
    actions.catat(user?.nama ?? proyek!.peneliti, proyek!.judul, "Serah terima", "Hasil batch " + batchTerakhir.nomor + " dikirim ke " + tujuan);
    setTerkirim(true);
  }

  return (
    <AppShell judul="Kirim ke divisi terkait" deskripsi={"Serah terima hasil penelitian " + proyek.judul}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Batch terakhir" value={"Batch " + batchTerakhir.nomor} hint={batchTerakhir.status} />
        <Stat label="Skor kesesuaian" value={skor + " persen"} hint="Terhadap standar output" />
        <Stat label="Parameter lolos" value={lolos + " dari " + proyek.targets.length} hint="Diverifikasi sensor laboratorium" />
        <Stat label="HPP final" value={formatRupiah(hpp.total)} hint="Per kemasan 50 ml" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle title="Ringkasan serah terima" sub="Berkas ini otomatis disusun dari jurnal praktikum dan pembacaan sensor." />
          <div className="space-y-4 text-sm">
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Formula final</p>
              <ul className="mt-1.5 space-y-1">
                {batchTerakhir.bahan.map((b) => (
                  <li key={b.id} className="flex items-center justify-between border-b border-border pb-1.5">
                    <span>
                      {b.name} <span className="text-xs text-muted-foreground">{b.inci}</span>
                    </span>
                    <span className="font-semibold">{b.percent}%</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Hasil parameter</p>
              <ul className="mt-1.5 space-y-1">
                {proyek.targets.map((t) => {
                  const h = batchTerakhir.hasil.find((x) => x.paramId === t.id);
                  const ok = h?.nilai != null && Math.abs(h.nilai - t.target) <= t.toleransi;
                  return (
                    <li key={t.id} className="flex items-center justify-between border-b border-border pb-1.5">
                      <span>{t.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          target {t.target} {t.unit}
                        </span>
                        <span className="font-semibold">{h?.nilai ?? "kosong"}</span>
                        {ok ? <Pill variant="aman">sesuai</Pill> : <Pill variant="waspada">tinjau</Pill>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kepatuhan</p>
              <p className="mt-1.5 flex items-center gap-2">
                <ShieldCheck className="size-4 text-success" /> Status {kepatuhan.status}. Seluruh bahan tercatat lengkap dengan sertifikat dan batas regulasi.
              </p>
            </section>
            {batchTerakhir.evaluasi && (
              <section>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Catatan evaluasi</p>
                <p className="mt-1.5">{batchTerakhir.evaluasi.ringkasan}</p>
              </section>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle title="Tujuan pengiriman" sub="Pilih divisi penerima dan tambahkan pesan." />
          {terkirim ? (
            <div className="rounded-xl bg-success-soft p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-success">
                <CheckCircle2 className="size-4" /> Berkas terkirim
              </p>
              <p className="mt-1.5 text-sm text-foreground">
                Penelitian ini berstatus menunggu tinjauan {proyek.dikirimKe}. Notifikasi sudah tercatat pada logbook laboratorium.
              </p>
              <Link to="/dashboard" className="mt-3 inline-block text-sm font-semibold text-brand">
                Kembali ke dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Divisi penerima">
                <select className={inputClass} value={divisi} onChange={(e) => setDivisi(e.target.value)}>
                  {DIVISI.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <p className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">Berkas dikirim ke {divisi} beserta lampiran formula, hasil sensor, dan catatan kepatuhan.</p>
              <GhostButton onClick={() => unduhScaleUpBrief(proyek, batchTerakhir)}>
                <Download className="size-4" /> Download Scale Up Risk Brief
              </GhostButton>
              <Field label="Pesan untuk divisi">
                <textarea className={inputClass + " min-h-24"} value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Contoh: mohon verifikasi kelayakan produksi skala 500 kg." />
              </Field>
              <PrimaryButton onClick={kirim} disabled={skor < 70}>
                <Send className="size-4" /> Kirim berkas penelitian
              </PrimaryButton>
              {skor < 70 && <p className="text-xs text-muted-foreground">Selesaikan dan evaluasi batch hingga skor kesesuaian minimal 70 persen sebelum mengirim.</p>}
            </div>
          )}
        </Card>
      </div>

    </AppShell>
  );
}
