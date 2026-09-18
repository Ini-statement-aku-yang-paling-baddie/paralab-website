import { ShieldCheck, TriangleAlert } from "lucide-react";
import { assertReviewableRecommendation, type F4Recommendation } from "@/lib/paralab/f4-adapter";
import { Card, CardTitle, GhostButton, Pill } from "./ui";

type Props = {
  recommendation: F4Recommendation | null;
  loading: boolean;
  error: string | null;
};

function priorityVariant(priority: string): "bahaya" | "waspada" | "aman" {
  if (priority === "high") return "bahaya";
  if (priority === "medium") return "waspada";
  return "aman";
}

export function NextValidationCard({ recommendation, loading, error }: Props) {
  let reviewError: string | null = null;
  if (recommendation && !loading) {
    try {
      assertReviewableRecommendation(recommendation);
    } catch (cause) {
      reviewError = cause instanceof Error ? cause.message : "Rekomendasi tidak valid.";
    }
  }

  const failure = error ?? reviewError;
  const siap = Boolean(recommendation) && !failure && !loading;

  return (
    <Card className="mt-5">
      <CardTitle
        title="Langkah validasi berikutnya"
        sub="Rekomendasi F4 dari sinyal risiko F2/F3, bukan instruksi reformulasi."
        right={
          siap ? (
            <Pill variant={priorityVariant(recommendation!.priority)}>
              {recommendation!.priority}
            </Pill>
          ) : undefined
        }
      />

      {loading && <p className="text-sm text-muted-foreground">Menyiapkan langkah validasi…</p>}

      {!loading && failure && (
        <p className="flex items-center gap-2 text-sm font-medium text-danger">
          <TriangleAlert className="size-4 shrink-0" />
          Langkah validasi belum tersedia: {failure}
        </p>
      )}

      {!loading && !failure && !recommendation && (
        <p className="text-sm text-muted-foreground">
          Belum ada langkah validasi. Muat rekomendasi dari gateway model untuk batch ini.
        </p>
      )}

      {siap && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-foreground">
            {recommendation!.recommended_action}
          </p>

          {recommendation!.required_inputs.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Perlu diukur atau dikonfirmasi
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {recommendation!.required_inputs.map((input) => (
                  <li
                    key={input}
                    className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {input}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation!.reason_codes.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Alasan
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                {recommendation!.reason_codes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="flex items-center gap-2 text-xs font-semibold text-warning">
            <ShieldCheck className="size-3.5 shrink-0" />
            Butuh review manusia
          </p>

          {recommendation!.limitations.length > 0 && (
            <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
              {recommendation!.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          )}

          <GhostButton>{"Tandai untuk review"}</GhostButton>
        </div>
      )}
    </Card>
  );
}
