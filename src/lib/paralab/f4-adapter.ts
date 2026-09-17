/**
 * Adapter F4: membentuk request dan memvalidasi rekomendasi dari gateway.
 *
 * F4 selalu berupa langkah validasi/observasi yang wajib direview manusia.
 * Modul ini tidak boleh menurunkan atau mengarang tingkat risiko.
 */
export type F4Request = {
  f3_forecast: Record<string, unknown>;
  checkpoint: Record<string, unknown> | null;
};

export type F4Recommendation = {
  recommendation_type: string;
  priority: string;
  recommended_action: string;
  reason_codes: string[];
  required_inputs: string[];
  evidence_ids: string[];
  data_origin: string;
  requires_human_review: boolean;
  limitations: string[];
};

export function toF4Request(
  f3Forecast: Record<string, unknown>,
  checkpoint: Record<string, unknown> | null,
): F4Request {
  return { f3_forecast: f3Forecast, checkpoint };
}

/**
 * Gagal keras bila gateway mengirim rekomendasi yang tidak bisa direview manusia.
 * Safety event: UI tidak boleh menampilkan langkah tanpa jejak review.
 */
export function assertReviewableRecommendation(recommendation: F4Recommendation): void {
  if (!recommendation || recommendation.requires_human_review !== true) {
    throw new Error("F4 recommendation must require human review");
  }
  if (
    typeof recommendation.recommended_action !== "string" ||
    recommendation.recommended_action.trim().length === 0
  ) {
    throw new Error("F4 recommendation must include a readable action");
  }
}
