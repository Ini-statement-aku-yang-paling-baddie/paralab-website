import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { F2Screening } from "@/lib/paralab/model-adapters";
import { Card, CardTitle, Pill } from "./ui";

type Props = {
  screening: F2Screening | null;
  loading: boolean;
  error: string | null;
};

function statusVariant(status: string): "bahaya" | "waspada" | "aman" | "netral" {
  if (status === "blocked" || status === "unknown") return "bahaya";
  if (status === "warning") return "waspada";
  if (status === "clear_for_current_screening") return "aman";
  return "netral";
}

export function FormulaScreeningCard({ screening, loading, error }: Props) {
  const flagged = screening?.results.filter((item) => item.rules_fired.length > 0) ?? [];
  const features = Object.entries(screening?.derived_features ?? {});

  return (
    <Card className="mt-5">
      <CardTitle
        title="Screening formula"
        sub="Guardrail deterministik dari gateway model, bukan penilaian stabilitas."
        right={screening ? <Pill variant={statusVariant(screening.overall_status)}>{screening.overall_status}</Pill> : undefined}
      />

      {loading && <p className="text-sm text-muted-foreground">Menjalankan screening formula…</p>}

      {!loading && error && (
        <p className="flex items-center gap-2 text-sm font-medium text-danger">
          <TriangleAlert className="size-4 shrink-0" />
          Screening formula belum tersedia: {error}
        </p>
      )}

      {!loading && !error && !screening && (
        <p className="text-sm text-muted-foreground">
          Belum ada screening. Jalankan pemeriksaan formula untuk batch ini.
        </p>
      )}

      {!loading && !error && screening && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{screening.disclaimer}</p>

          {screening.overall_status === "unknown" && (
            <p className="border-l-2 border-danger bg-danger-soft/40 p-3 text-sm font-semibold text-foreground">
              Screening dihentikan: satu atau lebih bahan tidak dapat dipetakan oleh F2. Minta
              tinjauan formulator sebelum melanjutkan.
            </p>
          )}

          {flagged.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tidak ada aturan yang terpicu pada screening ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {flagged.map((item) => (
                <li key={item.input} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {item.inci_name ?? item.input}
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {item.rules_fired.map((rule) => (
                      <li key={rule.rule_id + rule.source_id}>
                        <p className="text-xs font-semibold text-warning">
                          {rule.rule_id} · {rule.severity}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          rule {rule.rule_version} · source {rule.source_id}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{rule.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          {features.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Derived feature untuk F3
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {features.map(([key, value]) => (
                  <li key={key}>
                    {key}: {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {screening.requires_human_signoff && (
            <p className="flex items-center gap-2 text-xs font-semibold text-warning">
              <ShieldCheck className="size-3.5 shrink-0" />
              Butuh sign-off manusia sebelum keputusan lanjutan
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
