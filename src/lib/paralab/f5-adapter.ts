/**
 * Adapter F5: draft dari gateway model tetap harus dikonfirmasi manusia.
 *
 * `trial_id` selalu berasal dari UI (halaman jurnal), bukan dari hasil transkrip
 * atau prediksi model. Draft tidak pernah ditulis ke jurnal oleh modul ini.
 */
import type { UcapanTerstruktur } from "./prediksi";

export type F5CheckpointPatch = {
  measurements: Record<string, number | null>;
  observations: Record<string, string | null>;
};

export type F5Draft = {
  trial_id: string;
  proposed_checkpoint_patch: F5CheckpointPatch;
  requires_confirmation: boolean;
};

export type F5Request = {
  selected_trial_id: string;
  transcript: string;
};

const PARAMETER_LABEL: Record<string, { label: string; unit: string }> = {
  ph: { label: "pH", unit: "" },
  viscosity_cp: { label: "Viskositas", unit: "cP" },
  temperature_c: { label: "Suhu proses", unit: "°C" },
  droplet_um: { label: "Ukuran droplet", unit: "µm" },
  turbidity_ntu: { label: "Turbiditas", unit: "NTU" },
  conductivity_us_cm: { label: "Konduktivitas", unit: "µS/cm" },
};

export function toF5Request(selectedTrialId: string, transcript: string): F5Request {
  return { selected_trial_id: selectedTrialId, transcript };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validasi runtime untuk respons gateway yang tidak dapat dipercaya oleh TypeScript. */
export function parseF5Draft(value: unknown): F5Draft {
  if (
    !isRecord(value) ||
    typeof value.trial_id !== "string" ||
    !isRecord(value.proposed_checkpoint_patch)
  ) {
    throw new Error("Kontrak draft F5 tidak valid.");
  }

  const { measurements, observations } = value.proposed_checkpoint_patch;
  if (
    !isRecord(measurements) ||
    !isRecord(observations) ||
    typeof value.requires_confirmation !== "boolean" ||
    Object.values(measurements).some(
      (measurement) => measurement !== null && typeof measurement !== "number",
    ) ||
    Object.values(observations).some(
      (observation) => observation !== null && typeof observation !== "string",
    )
  ) {
    throw new Error("Kontrak draft F5 tidak valid.");
  }

  return {
    trial_id: value.trial_id,
    proposed_checkpoint_patch: { measurements, observations },
    requires_confirmation: value.requires_confirmation,
  };
}

/** Safety: draft tanpa permintaan konfirmasi tidak boleh dipakai UI. */
export function assertConfirmable(draft: F5Draft): void {
  if (draft.requires_confirmation !== true) {
    throw new Error("Draft F5 harus meminta konfirmasi sebelum masuk ke jurnal");
  }
}

export function toUcapanTerstruktur(draft: F5Draft, mentah: string): UcapanTerstruktur {
  const measurements = draft.proposed_checkpoint_patch?.measurements ?? {};
  const observations = draft.proposed_checkpoint_patch?.observations ?? {};

  return {
    bahan: [],
    parameter: Object.entries(measurements)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number")
      .map(([key, nilai]) => {
        const meta = PARAMETER_LABEL[key] ?? { label: key, unit: "" };
        return { label: meta.label, nilai, unit: meta.unit };
      }),
    observasi: Object.entries(observations)
      .filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" && entry[1].trim().length > 0,
      )
      .map(([key, nilai]) => `${key}: ${nilai}`),
    mentah,
  };
}
