import { describe, expect, it } from "vitest";
import {
  assertReviewableRecommendation,
  toF4Request,
  type F4Recommendation,
} from "./f4-adapter";

const VALID_RECOMMENDATION: F4Recommendation = {
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

describe("toF4Request", () => {
  it("hanya meneruskan F3 terstruktur dan checkpoint opsional", () => {
    expect(toF4Request({ decision: "flag_high_risk" }, null)).toEqual({
      f3_forecast: { decision: "flag_high_risk" },
      checkpoint: null,
    });
  });

  it("meneruskan checkpoint saat tersedia", () => {
    const checkpoint = { measurements: { ph: 5.5 }, appearance: "uniform" };
    expect(toF4Request({ decision: "abstain_human_review_required" }, checkpoint)).toEqual({
      f3_forecast: { decision: "abstain_human_review_required" },
      checkpoint,
    });
  });

  it("tidak menyalin F3 menjadi nilai default saat payload kosong", () => {
    expect(toF4Request({}, null)).toEqual({ f3_forecast: {}, checkpoint: null });
  });
});

describe("assertReviewableRecommendation", () => {
  it("lolos saat backend menandai human review wajib", () => {
    expect(() => assertReviewableRecommendation(VALID_RECOMMENDATION)).not.toThrow();
  });

  it("menolak rekomendasi yang mengklaim tidak butuh human review", () => {
    expect(() =>
      assertReviewableRecommendation({ ...VALID_RECOMMENDATION, requires_human_review: false }),
    ).toThrow(/human review/i);
  });

  it("menolak rekomendasi tanpa aksi yang bisa dibaca", () => {
    expect(() =>
      assertReviewableRecommendation({ ...VALID_RECOMMENDATION, recommended_action: "" }),
    ).toThrow(/action/i);
  });
});
