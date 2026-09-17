/**
 * Adapter F2: memetakan state jurnal lokal ke request screening formula.
 *
 * F3 sengaja tidak ada di sini: `src/lib/paralab/f3.ts` sudah menangani F3
 * Stability Sentinel secara lengkap, termasuk abstain dan kontrak checkpoint.
 */

export type F2BatchInput = {
  bahan: { name: string; percent: number }[];
  hasil: { paramId: string; nilai: number | null }[];
};

export type F2Request = {
  formula: { bahan: string; pct: number }[];
  context: Record<string, string>;
  ph: number | null;
};

export type F2RuleFired = {
  rule_id: string;
  rule_version: string;
  severity: string;
  source_id: string;
  rationale: string;
  requires_human_review: boolean;
};

export type F2IngredientResult = {
  input: string;
  ingredient_id?: string;
  inci_name?: string;
  status: string;
  rules_fired: F2RuleFired[];
  requires_human_review: boolean;
};

export type F2Screening = {
  screened_at: string;
  rule_version: string;
  overall_status: string;
  disclaimer: string;
  results: F2IngredientResult[];
  derived_features: Record<string, unknown>;
  model_coverage?: { status: string; reason: string };
  requires_human_signoff: boolean;
};

export function toF2Request(batch: F2BatchInput): F2Request {
  const phResult = batch.hasil.find((item) => item.paramId === "ph");
  return {
    formula: batch.bahan.map((item) => ({ bahan: item.name, pct: item.percent })),
    context: {},
    ph: typeof phResult?.nilai === "number" ? phResult.nilai : null,
  };
}
