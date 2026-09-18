/**
 * Adapter F4: membentuk request dan memvalidasi rekomendasi dari gateway.
 *
 * F4 selalu berupa langkah validasi/observasi yang wajib direview manusia.
 * Modul ini tidak boleh menurunkan atau mengarang tingkat risiko.
 */
import type { Checkpoint } from "./data";
import type { F3Hasil } from "./f3";

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

/** Nilai gateway hanya dapat dipakai pada batch yang menghasilkan nilai tersebut. */
export type BatchScoped<T> = { batchNomor: number; value: T };

export function scopedValueForBatch<T>(state: BatchScoped<T> | null, batchNomor: number): T | null {
  return state?.batchNomor === batchNomor ? state.value : null;
}

export function toF4Request(
  f3Forecast: Record<string, unknown>,
  checkpoint: Record<string, unknown> | null,
): F4Request {
  return { f3_forecast: f3Forecast, checkpoint };
}

export type F4CheckpointInput = Pick<
  Checkpoint,
  "minggu" | "ph" | "viskositasCp" | "penampilan" | "dikonfirmasi"
>;

/** Hanya checkpoint yang telah disahkan peneliti boleh menjadi konteks F4. */
export function toF4Checkpoint(
  checkpoints: F4CheckpointInput[] | undefined,
): Record<string, unknown> | null {
  const terakhir = (checkpoints ?? [])
    .filter((checkpoint) => checkpoint.dikonfirmasi)
    .sort((a, b) => a.minggu - b.minggu)
    .at(-1);

  if (!terakhir) return null;

  return {
    measurements: {
      ph: terakhir.ph,
      viscosity_cp: terakhir.viskositasCp,
    },
    appearance: terakhir.penampilan,
  };
}

/**
 * Menyusun request F4 dari hasil F3 yang benar-benar diterima website.
 *
 * Sumbernya `jalankanF3` (repository paralab-architecture), bukan payload contoh.
 * Hasil yang sudah ditahan website — misalnya abstain karena ada bahan tak
 * dikenal F2 — tetap dikirim sebagai abstain, supaya F4 tidak pernah menyusun
 * langkah lanjutan di atas forecast yang sengaja tidak diterbitkan.
 */
export function toF4RequestFromF3(
  hasil: F3Hasil,
  checkpoint: Record<string, unknown> | null = null,
): F4Request {
  if (hasil.kind === "forecast") {
    return {
      f3_forecast: {
        decision: hasil.keputusan,
        risk_band: hasil.band,
        confidence: hasil.keyakinan,
        data_origin: hasil.dataOrigin,
        f2_screening: hasil.screening,
        limitations: hasil.batas,
      },
      checkpoint,
    };
  }

  return {
    f3_forecast: {
      decision: "abstain_human_review_required",
      reason: hasil.alasan,
      f2_screening: hasil.screening,
      limitations: hasil.batas,
    },
    checkpoint,
  };
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
