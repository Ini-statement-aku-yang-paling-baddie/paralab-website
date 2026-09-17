import { useState } from "react";
import { CircleCheck, CircleDashed, Radio, Trash2, UserCheck } from "lucide-react";
import type { Batch, Checkpoint, Project } from "@/lib/paralab/data";
import { actions } from "@/lib/paralab/store";
import { bacaSatuSensor } from "@/hooks/use-sensors";
import { MINGGU_LANDMARK } from "@/lib/paralab/f3";
import { Card, CardTitle, GhostButton, Pill, PrimaryButton, inputClass } from "./ui";
import { BandProvenance } from "./BandProvenance";

const PENAMPILAN = [
  "uniform",
  "creaming",
  "phase_separation",
  "heterogeneous",
  "color_shift",
] as const;

const LABEL_PENAMPILAN: Record<string, string> = {
  uniform: "Seragam",
  creaming: "Creaming",
  phase_separation: "Pemisahan fase",
  heterogeneous: "Heterogen",
  color_shift: "Pergeseran warna",
};

type Draft = { minggu: number; ph: string; viskositas: string; penampilan: string };

const DRAFT_KOSONG: Draft = { minggu: 0, ph: "", viskositas: "", penampilan: "uniform" };

/**
 * Perekam checkpoint longitudinal.
 *
 * Inilah gerbang konfirmasi manusia yang dituntut architecture v5 (aturan #5 dan
 * prinsip #6): sensor hanya boleh MENGUSULKAN nilai, peneliti yang menyatakan
 * sebuah checkpoint sah. Hanya checkpoint terkonfirmasi yang dikirim ke F3.
 */
export function PanelCheckpoint({
  proyek,
  batch,
  peneliti,
}: {
  proyek: Project;
  batch: Batch;
  peneliti: string;
}) {
  const [draft, setDraft] = useState<Draft>(DRAFT_KOSONG);
  const checkpoints = [...(batch.checkpoints ?? [])].sort((a, b) => a.minggu - b.minggu);
  const terkonfirmasi = checkpoints.filter((c) => c.dikonfirmasi).length;

  const mingguTerpakai = new Set(checkpoints.map((c) => c.minggu));
  const mingguTersedia = MINGGU_LANDMARK.filter((m) => !mingguTerpakai.has(m));

  function ambilSensor() {
    const ph = bacaSatuSensor("ph");
    const viskositas = bacaSatuSensor("viskositas");
    setDraft((d) => ({
      ...d,
      ph: ph === null ? d.ph : String(ph),
      viskositas: viskositas === null ? d.viskositas : String(viskositas),
    }));
  }

  function simpan(langsungKonfirmasi: boolean) {
    const ph = Number(draft.ph);
    const viskositas = Number(draft.viskositas);
    if (!Number.isFinite(ph) || !Number.isFinite(viskositas) || viskositas <= 0) return;

    const baru: Checkpoint = {
      minggu: draft.minggu,
      ph,
      viskositasCp: viskositas,
      penampilan: draft.penampilan,
      sumber: "manual",
      dikonfirmasi: langsungKonfirmasi,
      dikonfirmasiOleh: langsungKonfirmasi ? peneliti : undefined,
      waktu: new Date().toISOString(),
    };

    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      checkpoints: [...(b.checkpoints ?? []).filter((c) => c.minggu !== baru.minggu), baru],
    }));
    actions.catat(
      peneliti,
      proyek.judul,
      langsungKonfirmasi ? "Checkpoint dikonfirmasi" : "Checkpoint draft",
      "Minggu ke-" +
        baru.minggu +
        " batch " +
        batch.nomor +
        ": pH " +
        ph +
        ", viskositas " +
        viskositas +
        " cP, penampilan " +
        (LABEL_PENAMPILAN[baru.penampilan] ?? baru.penampilan),
    );
    setDraft({ ...DRAFT_KOSONG, minggu: mingguTersedia.find((m) => m !== draft.minggu) ?? 0 });
  }

  function konfirmasi(minggu: number) {
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      checkpoints: (b.checkpoints ?? []).map((c) =>
        c.minggu === minggu
          ? {
              ...c,
              dikonfirmasi: true,
              dikonfirmasiOleh: peneliti,
              waktu: new Date().toISOString(),
            }
          : c,
      ),
    }));
    actions.catat(
      peneliti,
      proyek.judul,
      "Checkpoint dikonfirmasi",
      "Peneliti mengesahkan checkpoint minggu ke-" + minggu + " batch " + batch.nomor,
    );
  }

  function hapus(minggu: number) {
    actions.simpanBatch(proyek.id, batch.nomor, (b) => ({
      ...b,
      checkpoints: (b.checkpoints ?? []).filter((c) => c.minggu !== minggu),
    }));
  }

  return (
    <Card className="mt-5">
      <CardTitle
        title="Checkpoint stabilitas"
        sub={
          terkonfirmasi +
          " dari " +
          checkpoints.length +
          " checkpoint dikonfirmasi peneliti. Hanya yang terkonfirmasi yang dibaca F3."
        }
        right={<Pill variant={terkonfirmasi >= 2 ? "aman" : "netral"}>{terkonfirmasi} sah</Pill>}
      />

      <BandProvenance
        lapis="manusia"
        tambahan="Sensor mengisi kolom sebagai usulan. Checkpoint baru berlaku setelah ditekan Konfirmasi."
      />

      <div className="overflow-x-auto">
        <table className="table-clear w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3">Minggu</th>
              <th className="py-2 pr-3">pH</th>
              <th className="py-2 pr-3">Viskositas</th>
              <th className="py-2 pr-3">Penampilan</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {checkpoints.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-sm text-muted-foreground">
                  Belum ada checkpoint. F3 membutuhkan baseline minggu 0 dan minimal satu titik
                  landmark setelahnya sebelum dapat menerbitkan forecast.
                </td>
              </tr>
            )}
            {checkpoints.map((c) => (
              <tr key={c.minggu} className="border-b border-border/70">
                <td className="py-2.5 pr-3 font-semibold tabular-nums">
                  {c.minggu === 0 ? "0 (baseline)" : c.minggu}
                </td>
                <td className="py-2.5 pr-3 tabular-nums">{c.ph}</td>
                <td className="py-2.5 pr-3 tabular-nums">{c.viskositasCp} cP</td>
                <td className="py-2.5 pr-3">{LABEL_PENAMPILAN[c.penampilan] ?? c.penampilan}</td>
                <td className="py-2.5 pr-3">
                  {c.dikonfirmasi ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                      <CircleCheck className="size-3.5" /> {c.dikonfirmasiOleh ?? "terkonfirmasi"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                      <CircleDashed className="size-3.5" /> draft, belum sah
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  <span className="inline-flex gap-2">
                    {!c.dikonfirmasi && (
                      <GhostButton onClick={() => konfirmasi(c.minggu)}>
                        <UserCheck className="size-3.5" /> Konfirmasi
                      </GhostButton>
                    )}
                    <GhostButton onClick={() => hapus(c.minggu)}>
                      <Trash2 className="size-3.5" />
                    </GhostButton>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-5">
        <label className="block">
          <span className="text-xs font-semibold text-foreground">Minggu ke</span>
          <select
            className={inputClass + " mt-1"}
            value={draft.minggu}
            onChange={(e) => setDraft({ ...draft, minggu: Number(e.target.value) })}
          >
            {MINGGU_LANDMARK.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? "0 (baseline)" : m}
                {mingguTerpakai.has(m) ? " · timpa" : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-foreground">pH</span>
          <input
            type="number"
            step="0.01"
            className={inputClass + " mt-1"}
            value={draft.ph}
            placeholder="5.40"
            onChange={(e) => setDraft({ ...draft, ph: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-foreground">Viskositas (cP)</span>
          <input
            type="number"
            step="1"
            className={inputClass + " mt-1"}
            value={draft.viskositas}
            placeholder="6400"
            onChange={(e) => setDraft({ ...draft, viskositas: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-foreground">Penampilan</span>
          <select
            className={inputClass + " mt-1"}
            value={draft.penampilan}
            onChange={(e) => setDraft({ ...draft, penampilan: e.target.value })}
          >
            {PENAMPILAN.map((p) => (
              <option key={p} value={p}>
                {LABEL_PENAMPILAN[p]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <GhostButton onClick={ambilSensor} className="w-full">
            <Radio className="size-3.5" /> Usulkan dari sensor
          </GhostButton>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={() => simpan(true)} disabled={!draft.ph || !draft.viskositas}>
          <UserCheck className="size-4" /> Simpan dan konfirmasi
        </PrimaryButton>
        <GhostButton onClick={() => simpan(false)}>Simpan sebagai draft</GhostButton>
        <span className="text-xs text-muted-foreground">
          Checkpoint draft tidak dikirim ke F3 sampai dikonfirmasi.
        </span>
      </div>
    </Card>
  );
}
