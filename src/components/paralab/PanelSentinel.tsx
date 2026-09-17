import { useCallback, useEffect, useState } from "react";
import { Activity, CircleHelp, Loader2, ShieldAlert, Telescope } from "lucide-react";
import type { Batch, Project } from "@/lib/paralab/data";
import {
  F3_BASE_URL,
  cekDomain,
  cekKesehatanF3,
  jalankanF3,
  siapkanObservasi,
  type F3Hasil,
} from "@/lib/paralab/f3";
import { BATAS_F3 } from "@/lib/paralab/kontrak";
import { actions } from "@/lib/paralab/store";
import { Card, CardTitle, Pill, PrimaryButton } from "./ui";
import { BandProvenance, DaftarBatas, JejakRule } from "./BandProvenance";

const SEBAB_JUDUL: Record<string, string> = {
  domain: "Di luar domain yang didukung",
  checkpoint: "Checkpoint belum cukup",
  f2: "Ditahan guardrail F2",
  api: "Layanan F3 tidak tersedia",
  kontrak: "Kontrak tidak cocok",
};

/**
 * Panel F3 Stability Sentinel.
 *
 * Panel ini tidak pernah menghitung risiko sendiri; ia memanggil API F3 pada
 * repository paralab-architecture. Keluarannya satu sisi: alert risiko tinggi
 * atau lanjutkan observasi. Tidak ada early pass, dan setiap jalur gagal
 * berakhir sebagai abstain yang menyebutkan alasannya.
 */
export function PanelSentinel({
  proyek,
  batch,
  peneliti,
}: {
  proyek: Project;
  batch: Batch;
  peneliti: string;
}) {
  const [hasil, setHasil] = useState<F3Hasil | null>(null);
  const [memuat, setMemuat] = useState(false);
  const [layanan, setLayanan] = useState<"memeriksa" | "hidup" | "mati">("memeriksa");
  const [modelVersion, setModelVersion] = useState<string>("");

  useEffect(() => {
    let batal = false;
    cekKesehatanF3().then((r) => {
      if (batal) return;
      setLayanan(r.ok ? "hidup" : "mati");
      if (r.ok) setModelVersion(r.modelVersion);
    });
    return () => {
      batal = true;
    };
  }, []);

  const domain = cekDomain(proyek.kategori, batch.bahan);
  const observasi = siapkanObservasi(batch);

  const jalankan = useCallback(async () => {
    setMemuat(true);
    const r = await jalankanF3(proyek, batch);
    setHasil(r);
    setMemuat(false);
    actions.catat(
      peneliti,
      proyek.judul,
      r.kind === "forecast" ? "Forecast F3" : "F3 abstain",
      r.kind === "forecast"
        ? "Batch " +
            batch.nomor +
            " minggu ke-" +
            r.mingguForecast +
            ": " +
            (r.keputusan === "flag_high_risk" ? "risiko tinggi ditandai" : "lanjutkan observasi")
        : "Batch " + batch.nomor + ": " + r.alasan,
    );
  }, [proyek, batch, peneliti]);

  const siap = domain.didukung && observasi.siap && layanan !== "mati";

  return (
    <Card className="mt-5">
      <CardTitle
        title="F3 Stability Sentinel"
        sub={
          "Deteksi dini risiko kegagalan sebelum minggu ke-12. Keluaran hanya alert atau lanjutkan observasi."
        }
        right={
          <Pill variant={layanan === "hidup" ? "aman" : layanan === "mati" ? "bahaya" : "netral"}>
            {layanan === "hidup" ? "API tersambung" : layanan === "mati" ? "API mati" : "memeriksa"}
          </Pill>
        }
      />

      <BandProvenance
        lapis="prediksi"
        tambahan={
          modelVersion
            ? "Model " + modelVersion + " dimuat dari artifact hash-verified."
            : "Model dimuat dari artifact hash-verified pada layanan F3."
        }
      />

      <dl className="mb-4 grid gap-3 text-xs sm:grid-cols-2">
        <div className="border border-border p-3">
          <dt className="font-semibold text-foreground">Gerbang domain</dt>
          <dd className="mt-1 text-muted-foreground">
            {domain.didukung ? "Didukung. " : "Tidak didukung. "}
            {domain.alasan}
          </dd>
        </div>
        <div className="border border-border p-3">
          <dt className="font-semibold text-foreground">Kesiapan checkpoint</dt>
          <dd className="mt-1 text-muted-foreground">
            {observasi.siap
              ? "Baseline dan landmark minggu ke-" +
                observasi.landmark +
                " tersedia dan terkonfirmasi."
              : observasi.alasan}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton onClick={jalankan} disabled={memuat}>
          {memuat ? <Loader2 className="size-4 animate-spin" /> : <Telescope className="size-4" />}
          Jalankan F3
        </PrimaryButton>
        {!siap && (
          <span className="text-xs text-muted-foreground">
            {layanan === "mati"
              ? "Jalankan API F3 di " + F3_BASE_URL + " lebih dulu."
              : "Panel tetap dapat dijalankan; hasilnya akan berupa abstain beserta alasannya."}
          </span>
        )}
      </div>

      {hasil?.kind === "forecast" && (
        <div className="mt-4">
          <div
            className={
              "border-l-2 p-4 " +
              (hasil.keputusan === "flag_high_risk"
                ? "border-l-danger bg-danger-soft/40"
                : "border-l-[var(--chart-1)] bg-secondary/60")
            }
          >
            <p className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              {hasil.keputusan === "flag_high_risk" ? (
                <ShieldAlert className="size-5 text-danger" />
              ) : (
                <Activity className="size-5 text-muted-foreground" />
              )}
              {hasil.keputusan === "flag_high_risk"
                ? "Risiko tinggi ditandai"
                : "Lanjutkan observasi"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{hasil.tindakan}</p>
            {hasil.keputusan === "continue_observation" && (
              <p className="mt-2 text-xs font-semibold text-warning">
                Ini bukan pernyataan lolos. Uji stabilitas tetap berjalan penuh sesuai protokol.
              </p>
            )}
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <div>
                <dt className="inline font-semibold text-foreground">Skor risiko: </dt>
                <dd className="inline tabular-nums">{(hasil.risiko * 100).toFixed(1)}%</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">Band: </dt>
                <dd className="inline">{hasil.band}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">Keyakinan: </dt>
                <dd className="inline">{hasil.keyakinan}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">Landmark: </dt>
                <dd className="inline">minggu ke-{hasil.mingguForecast}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">Horizon: </dt>
                <dd className="inline">{hasil.horizon}</dd>
              </div>
            </dl>
          </div>

          {hasil.sinyal.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Sinyal utama
              </p>
              <ul className="mt-1.5 space-y-1.5 text-sm">
                {hasil.sinyal.map((s, i) => (
                  <li key={i} className="border border-border px-3 py-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {s.feature}
                    </span>{" "}
                    <span className="tabular-nums">{String(s.value)}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.interpretation}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ScreeningF2 hasil={hasil} />
          <DaftarBatas
            judul="Batas keluaran F3"
            batas={hasil.batas.length > 0 ? hasil.batas : BATAS_F3}
          />
        </div>
      )}

      {hasil?.kind === "abstain" && (
        <div className="mt-4 border-l-2 border-l-warning bg-warning-soft/40 p-4">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <CircleHelp className="size-5 text-warning" />
            Abstain, tinjauan manusia diperlukan
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-warning">
            {SEBAB_JUDUL[hasil.sebab] ?? hasil.sebab}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{hasil.alasan}</p>
          <p className="mt-2 text-sm text-muted-foreground">{hasil.tindakan}</p>
          <p className="mt-3 text-xs font-semibold text-foreground">
            Abstain bukan hasil buruk. Sistem memilih diam daripada mengarang angka.
          </p>
          <ScreeningF2 hasil={hasil} />
          <DaftarBatas
            judul="Batas keluaran F3"
            batas={hasil.batas.length > 0 ? hasil.batas : BATAS_F3}
          />
        </div>
      )}
    </Card>
  );
}

/** Hasil F2 dari server, lengkap dengan rule ID, versi, dan sumbernya. */
function ScreeningF2({ hasil }: { hasil: F3Hasil }) {
  const s = hasil.screening;
  if (!s) return null;
  const berbunyi = s.results.filter((r) => r.rules_fired.length > 0 || r.status === "unknown");

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Guardrail F2 dari server
        </p>
        <span className="flex items-center gap-2">
          <Pill
            variant={
              s.overall_status === "clear_for_current_screening"
                ? "aman"
                : s.overall_status === "blocked" || s.overall_status === "unknown"
                  ? "bahaya"
                  : "waspada"
            }
          >
            {s.overall_status}
          </Pill>
          <span className="font-mono text-[10px] text-muted-foreground">
            rule v{s.rule_version}
          </span>
        </span>
      </div>

      {s.requires_human_signoff && (
        <p className="mt-2 text-xs font-semibold text-warning">
          Formula ini menuntut tanda tangan manusia sebelum dipakai.
        </p>
      )}

      {berbunyi.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Tidak ada rule yang aktif pada skrining ini. Bukan approval regulasi, halal, atau
          keamanan.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {berbunyi.map((r, i) => (
            <li key={i} className="border border-border px-3 py-2 text-xs">
              <p className="font-semibold text-foreground">
                {r.input} <span className="font-normal text-muted-foreground">({r.status})</span>
              </p>
              {r.rationale && <p className="mt-0.5 text-muted-foreground">{r.rationale}</p>}
              {r.rules_fired.map((f) => (
                <p key={f.rule_id} className="mt-1">
                  <span className="text-muted-foreground">{f.rationale}</span>{" "}
                  <JejakRule
                    ruleId={f.rule_id}
                    ruleVersion={f.rule_version}
                    sourceId={f.source_id}
                  />
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}

      {s.disclaimer && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{s.disclaimer}</p>
      )}
    </div>
  );
}
