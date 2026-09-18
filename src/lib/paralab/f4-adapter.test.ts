import { describe, expect, it } from "vitest";
import {
  assertReviewableRecommendation,
  toF4Request,
  toF4RequestFromF3,
  toF4Checkpoint,
  scopedValueForBatch,
  type F4Recommendation,
} from "./f4-adapter";
import type { F3Abstain, F3Forecast } from "./f3";

const SCREENING = {
  rule_version: "v4",
  overall_status: "warning" as const,
  disclaimer: "Screening deterministik.",
  requires_human_signoff: true,
  results: [],
  derived_features: { electrolyte_thickener_risk: "high" },
};

const FORECAST: F3Forecast = {
  kind: "forecast",
  trialId: "serum-batch-2",
  keputusan: "flag_high_risk",
  risiko: 0.9965,
  band: "high",
  keyakinan: "high",
  mingguForecast: 4,
  horizon: "week_12",
  tindakan: "Mulai reformulasi paralel; uji stabilitas tetap berjalan penuh.",
  sinyal: [],
  batas: ["Forecast tidak menggantikan formal stability validation."],
  screening: SCREENING,
  modelVersion: "stability-sentinel-v1",
  dataOrigin: "synthetic_demo",
};

const ABSTAIN: F3Abstain = {
  kind: "abstain",
  sebab: "checkpoint",
  alasan: "Checkpoint belum cukup untuk diterbitkan forecast.",
  tindakan: "Selesaikan tinjauan manusia yang diminta.",
  screening: null,
  batas: ["Tidak ada forecast F3 diterbitkan sebelum checkpoint ditinjau."],
};

describe("toF4RequestFromF3", () => {
  it("meneruskan keluaran F3 asli apa adanya, tanpa mengarang band atau keyakinan", () => {
    expect(toF4RequestFromF3(FORECAST)).toEqual({
      f3_forecast: {
        decision: "flag_high_risk",
        risk_band: "high",
        confidence: "high",
        data_origin: "synthetic_demo",
        f2_screening: SCREENING,
        limitations: FORECAST.batas,
      },
      checkpoint: null,
    });
  });

  it("meneruskan abstain F3 sebagai abstain, bukan sebagai risiko tinggi", () => {
    expect(toF4RequestFromF3(ABSTAIN)).toEqual({
      f3_forecast: {
        decision: "abstain_human_review_required",
        reason: ABSTAIN.alasan,
        f2_screening: null,
        limitations: ABSTAIN.batas,
      },
      checkpoint: null,
    });
  });

  it("menjaga keputusan yang ditahan website tetap abstain", () => {
    // Website menahan forecast saat ada bahan tak dikenal; F4 harus melihat abstainnya.
    const ditahan: F3Abstain = { ...ABSTAIN, sebab: "f2" };
    const request = toF4RequestFromF3(ditahan);
    expect(request.f3_forecast["decision"]).toBe("abstain_human_review_required");
    expect(request.f3_forecast["risk_band"]).toBeUndefined();
  });

  it("meneruskan checkpoint yang dikonfirmasi saat diberikan", () => {
    const checkpoint = { measurements: { ph: 5.5 }, appearance: "uniform" };
    expect(toF4RequestFromF3(ABSTAIN, checkpoint).checkpoint).toEqual(checkpoint);
  });
});

describe("scopedValueForBatch", () => {
  it("does not expose a previous batch's F3 result to F4", () => {
    const f3ForBatchOne = { batchNomor: 1, value: FORECAST };

    expect(scopedValueForBatch(f3ForBatchOne, 2)).toBeNull();
    expect(scopedValueForBatch(f3ForBatchOne, 1)).toBe(FORECAST);
  });

  it("does not expose a previous batch's F2 or F4 state", () => {
    const stateForBatchOne = { batchNomor: 1, value: { source: "batch one" } };

    expect(scopedValueForBatch(stateForBatchOne, 2)).toBeNull();
  });
});

describe("toF4Request", () => {
  it("hanya meneruskan F3 terstruktur dan checkpoint opsional", () => {
    expect(toF4Request({ decision: "flag_high_risk" }, null)).toEqual({
      f3_forecast: { decision: "flag_high_risk" },
      checkpoint: null,
    });
  });
});

describe("toF4Checkpoint", () => {
  it("memetakan checkpoint terkonfirmasi terakhir ke kontrak F4", () => {
    const checkpoints = [
      { minggu: 1, ph: 5.4, viskositasCp: 6100, penampilan: "uniform", dikonfirmasi: true },
      { minggu: 4, ph: 5.7, viskositasCp: 5800, penampilan: "slight haze", dikonfirmasi: true },
      { minggu: 6, ph: 6.1, viskositasCp: 4200, penampilan: "separated", dikonfirmasi: false },
    ];

    expect(toF4Checkpoint(checkpoints)).toEqual({
      measurements: { ph: 5.7, viscosity_cp: 5800 },
      appearance: "slight haze",
    });
  });

  it("tidak meneruskan checkpoint yang belum dikonfirmasi", () => {
    expect(
      toF4Checkpoint([
        { minggu: 4, ph: 5.7, viskositasCp: 5800, penampilan: "hazy", dikonfirmasi: false },
      ]),
    ).toBeNull();
  });
});

describe("assertReviewableRecommendation", () => {
  const VALID: F4Recommendation = {
    recommendation_type: "next_validation_step",
    priority: "high",
    recommended_action: "Prioritaskan pengukuran ulang viskositas.",
    reason_codes: ["f3_high_risk"],
    required_inputs: ["viscosity_cp"],
    evidence_ids: [],
    data_origin: "synthetic_demo",
    requires_human_review: true,
    limitations: ["Heuristic prototype."],
  };

  it("meloloskan rekomendasi yang wajib direview", () => {
    expect(() => assertReviewableRecommendation(VALID)).not.toThrow();
  });

  it("menolak rekomendasi yang mengklaim tidak butuh human review", () => {
    expect(() =>
      assertReviewableRecommendation({ ...VALID, requires_human_review: false }),
    ).toThrow(/human review/i);
  });

  it("menolak rekomendasi tanpa aksi yang bisa dibaca", () => {
    expect(() => assertReviewableRecommendation({ ...VALID, recommended_action: "" })).toThrow(
      /action/i,
    );
  });
});
