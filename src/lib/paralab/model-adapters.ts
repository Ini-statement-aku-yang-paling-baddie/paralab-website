/**
 * Adapter F2/F3: memetakan state jurnal lokal ke request gateway model.
 *
 * Prinsip: adapter tidak pernah mengarang nilai. Kalau data yang dibutuhkan F3
 * belum dikumpulkan UI, `missingF3Inputs` melaporkannya dan `toF3Request` menolak.
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

export type F3ProcessInput = {
  heating_temp_c?: number;
  homogenization_rpm?: number;
  mixing_time_min?: number;
};

export type F3ObservationInput = {
  week: number;
  ph: number;
  viscosity_cp: number;
  appearance?: string;
};

export type F3Inputs = {
  trialId?: string;
  formula?: { bahan: string; pct: number }[];
  process?: F3ProcessInput;
  storageTemperatureC?: number;
  landmarkWeek?: number;
  observations?: F3ObservationInput[];
};

export type F3Request = {
  trial_id: string;
  formula: { bahan: string; pct: number }[];
  process: { heating_temp_c: number; homogenization_rpm: number; mixing_time_min: number };
  storage_temperature_c: number;
  landmark_week: number;
  observations: { week: number; ph: number; viscosity_cp: number; appearance: string }[];
};

export function toF2Request(batch: F2BatchInput): F2Request {
  const phResult = batch.hasil.find((item) => item.paramId === "ph");
  return {
    formula: batch.bahan.map((item) => ({ bahan: item.name, pct: item.percent })),
    context: {},
    ph: typeof phResult?.nilai === "number" ? phResult.nilai : null,
  };
}

/** Nama field yang masih belum tersedia untuk F3. Daftar kosong berarti siap. */
export function missingF3Inputs(inputs: F3Inputs): string[] {
  const missing: string[] = [];

  if (typeof inputs.trialId !== "string" || inputs.trialId.trim().length === 0) {
    missing.push("trialId");
  }
  if (!inputs.formula || inputs.formula.length === 0) {
    missing.push("formula");
  }

  const process = inputs.process;
  if (!process) {
    missing.push("process");
  } else {
    if (typeof process.heating_temp_c !== "number") missing.push("process.heating_temp_c");
    if (typeof process.homogenization_rpm !== "number") missing.push("process.homogenization_rpm");
    if (typeof process.mixing_time_min !== "number") missing.push("process.mixing_time_min");
  }

  if (typeof inputs.storageTemperatureC !== "number") missing.push("storageTemperatureC");
  if (typeof inputs.landmarkWeek !== "number") missing.push("landmarkWeek");

  const observations = inputs.observations;
  if (!observations || observations.length === 0) {
    missing.push("observations");
  } else if (observations.length < 2) {
    // Baseline saja tidak cukup: F3 butuh baseline + checkpoint lanjutan.
    missing.push("observations.checkpoint");
  }

  return missing;
}

export function toF3Request(inputs: F3Inputs): F3Request {
  const missing = missingF3Inputs(inputs);
  if (missing.length > 0) {
    throw new Error(`F3 inputs incomplete: ${missing.join(", ")}`);
  }

  const process = inputs.process!;
  return {
    trial_id: inputs.trialId!,
    formula: inputs.formula!,
    process: {
      heating_temp_c: process.heating_temp_c!,
      homogenization_rpm: process.homogenization_rpm!,
      mixing_time_min: process.mixing_time_min!,
    },
    storage_temperature_c: inputs.storageTemperatureC!,
    landmark_week: inputs.landmarkWeek!,
    observations: inputs.observations!.map((item) => ({
      week: item.week,
      ph: item.ph,
      viscosity_cp: item.viscosity_cp,
      appearance: item.appearance ?? "uniform",
    })),
  };
}
