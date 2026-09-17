/**
 * Klien F3 Stability Sentinel.
 *
 * Website tidak menghitung risiko stabilitas sendiri. Seluruh keluaran F3 berasal
 * dari `POST /v1/f3/forecasts` pada repository paralab-architecture, yang memuat
 * model hash-verified dan menjalankan F2 + feature engineering di sisi server.
 *
 * Aturan yang dipegang berkas ini (architecture v5 §8):
 *   1. Keluaran hanya `flag_high_risk`, `continue_observation`, atau abstain.
 *   2. Tidak ada early pass. Risiko rendah berarti lanjutkan observasi.
 *   3. Bila domain tidak didukung, checkpoint kurang, atau API tidak tersedia,
 *      hasilnya abstain. Tidak pernah angka tebakan.
 */

import type { Batch, Ingredient, Project } from "./data";
import { kategoriDef } from "./catalog";
import { DOMAIN_DIDUKUNG } from "./kontrak";

const BASE_URL =
  (import.meta.env["VITE_PARALAB_F3_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

/**
 * Header tambahan yang aman dikirim ke backend manapun.
 *
 * `ngrok-skip-browser-warning` hanya berarti sesuatu kalau BASE_URL adalah
 * tunnel ngrok gratis: tanpa ini, ngrok menyisipkan halaman peringatan HTML
 * sebelum permintaan API tembus, dan fetch akan gagal parse JSON. Backend
 * lain (Render, Cloud Run, lokal) mengabaikan header yang tidak dikenal ini.
 */
const HEADER_TAMBAHAN = { "ngrok-skip-browser-warning": "true" } as const;

/* ============================================================
   Kontrak permintaan, sama persis dengan ForecastRequest di api/app.py
   ============================================================ */

export type F3FormulaItem = { bahan: string; pct: number };

export type F3Process = {
  heating_temp_c: number;
  homogenization_rpm: number;
  mixing_time_min: number;
};

export type F3Observation = {
  week: number;
  ph: number;
  viscosity_cp: number;
  appearance: string;
};

export type F3Request = {
  trial_id: string;
  formula: F3FormulaItem[];
  process: F3Process;
  storage_temperature_c: number;
  landmark_week: number;
  observations: F3Observation[];
  context?: Record<string, string>;
};

/* ============================================================
   Kontrak jawaban
   ============================================================ */

export type F3Signal = {
  feature: string;
  value: number | string;
  source?: string;
  interpretation: string;
};

export type F3RuleHit = {
  rule_id: string;
  rule_version: string;
  severity: string;
  source_id: string;
  rationale: string;
  requires_human_review: boolean;
};

export type F3Screening = {
  rule_version: string;
  overall_status: "clear_for_current_screening" | "warning" | "blocked" | "unknown";
  disclaimer: string;
  requires_human_signoff: boolean;
  results: {
    input: string;
    status: string;
    rationale?: string;
    requires_human_review: boolean;
    rules_fired: F3RuleHit[];
  }[];
  derived_features?: Record<string, string>;
};

/** Keluaran normal F3: satu sisi, alert atau lanjutkan observasi. */
export type F3Forecast = {
  kind: "forecast";
  trialId: string;
  keputusan: "flag_high_risk" | "continue_observation";
  risiko: number;
  band: string;
  keyakinan: string;
  mingguForecast: number;
  horizon: string;
  tindakan: string;
  sinyal: F3Signal[];
  batas: string[];
  screening: F3Screening | null;
  modelVersion: string;
  dataOrigin: string;
};

/** Semua jalur yang berakhir tanpa forecast. Selalu punya alasan yang bisa dibaca. */
export type F3Abstain = {
  kind: "abstain";
  /** dari mana abstain berasal, untuk membedakan "data kurang" dan "sistem mati" */
  sebab: "domain" | "checkpoint" | "f2" | "api" | "kontrak";
  alasan: string;
  tindakan: string;
  screening: F3Screening | null;
  batas: string[];
};

export type F3Hasil = F3Forecast | F3Abstain;

/* ============================================================
   Gerbang domain: F2/F3 hanya berlaku untuk satu product family
   ============================================================ */

const EMULSIFIER = ["cetearyl", "gms"];

export type CekDomain = { didukung: boolean; alasan: string };

/**
 * Arsitektur v5 hanya mendukung moisturizer gel-cream O/W kulit berminyak.
 * Di luar itu F3 wajib abstain, bukan memberi angka yang terdengar meyakinkan.
 */
export function cekDomain(kategori: string, bahan: Ingredient[]): CekDomain {
  const def = kategoriDef(kategori);
  const ids = new Set(bahan.map((b) => b.id));
  const adaAir = ids.has("aqua");
  const adaEmulsifier = EMULSIFIER.some((id) => ids.has(id));

  if (def.bentuk !== "Pelembap") {
    return {
      didukung: false,
      alasan:
        "Kategori " +
        kategori +
        " berada di luar domain yang didukung model. F3 hanya dilatih untuk " +
        DOMAIN_DIDUKUNG +
        ".",
    };
  }
  if (!adaAir || !adaEmulsifier) {
    return {
      didukung: false,
      alasan:
        "Formula tidak dapat dipetakan ke sistem oil-in-water: butuh fase air dan emulsifier yang dikenali feature schema F3.",
    };
  }
  return {
    didukung: true,
    alasan: "Formula dapat dipetakan ke feature schema gel-cream O/W synthetic-demo.",
  };
}

/* ============================================================
   Checkpoint: hanya yang dikonfirmasi manusia yang boleh masuk F3
   ============================================================ */

/** Titik landmark yang dikenal generator dataset F3 (architecture v5 §5.2). */
export const MINGGU_LANDMARK = [0, 1, 2, 4, 6, 8, 12, 16];

export type CekCheckpoint =
  { siap: true; observations: F3Observation[]; landmark: number } | { siap: false; alasan: string };

/**
 * F3 butuh baseline minggu 0 dan minimal satu checkpoint landmark setelahnya.
 * Checkpoint yang belum dikonfirmasi peneliti tidak dihitung.
 */
export function siapkanObservasi(batch: Batch): CekCheckpoint {
  const terkonfirmasi = (batch.checkpoints ?? [])
    .filter((c) => c.dikonfirmasi)
    .sort((a, b) => a.minggu - b.minggu);

  if (!terkonfirmasi.some((c) => c.minggu === 0)) {
    return {
      siap: false,
      alasan:
        "Baseline minggu 0 belum ada atau belum dikonfirmasi peneliti. F3 tidak dapat menghitung tren tanpa titik awal.",
    };
  }
  const sesudahBaseline = terkonfirmasi.filter((c) => c.minggu > 0);
  if (sesudahBaseline.length === 0) {
    return {
      siap: false,
      alasan:
        "Belum ada checkpoint terkonfirmasi setelah baseline. Rekam minimal satu titik landmark, misalnya minggu ke-4.",
    };
  }

  const landmark = sesudahBaseline[sesudahBaseline.length - 1]!.minggu;
  return {
    siap: true,
    landmark,
    observations: terkonfirmasi.map((c) => ({
      week: c.minggu,
      ph: c.ph,
      viscosity_cp: c.viskositasCp,
      appearance: c.penampilan,
    })),
  };
}

/* ============================================================
   Pembangun permintaan dan pemanggil API
   ============================================================ */

export const PROSES_DEFAULT: F3Process = {
  heating_temp_c: 75,
  homogenization_rpm: 3200,
  mixing_time_min: 8,
};

export const SUHU_SIMPAN_DEFAULT = 40;

export function bangunPermintaan(proyek: Project, batch: Batch): F3Request | null {
  const observasi = siapkanObservasi(batch);
  if (!observasi.siap) return null;

  return {
    trial_id: proyek.id + "-b" + batch.nomor,
    formula: batch.bahan.map((b) => ({ bahan: b.inci, pct: b.percent })),
    process: batch.proses ?? PROSES_DEFAULT,
    storage_temperature_c: batch.suhuSimpanC ?? SUHU_SIMPAN_DEFAULT,
    landmark_week: observasi.landmark,
    observations: observasi.observations,
    context: { target_skin: "oily" },
  };
}

function abstain(
  sebab: F3Abstain["sebab"],
  alasan: string,
  tindakan: string,
  screening: F3Screening | null = null,
  batas: string[] = [],
): F3Abstain {
  return { kind: "abstain", sebab, alasan, tindakan, screening, batas };
}

/**
 * Jalankan F3. Setiap jalur kegagalan berakhir sebagai abstain yang menjelaskan
 * dirinya sendiri, bukan sebagai angka pengganti.
 */
export async function jalankanF3(proyek: Project, batch: Batch): Promise<F3Hasil> {
  const domain = cekDomain(proyek.kategori, batch.bahan);
  if (!domain.didukung) {
    return abstain(
      "domain",
      domain.alasan,
      "Gunakan jalur uji stabilitas konvensional untuk kategori ini. Jangan menafsirkan ketiadaan alert sebagai formula aman.",
    );
  }

  const permintaan = bangunPermintaan(proyek, batch);
  if (!permintaan) {
    const cek = siapkanObservasi(batch);
    return abstain(
      "checkpoint",
      cek.siap ? "Checkpoint tidak lengkap." : cek.alasan,
      "Rekam dan konfirmasi checkpoint yang kurang, lalu jalankan F3 kembali.",
    );
  }

  let data: Record<string, unknown>;
  try {
    const res = await fetch(BASE_URL + "/v1/f3/forecasts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADER_TAMBAHAN },
      body: JSON.stringify(permintaan),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return abstain(
        "kontrak",
        "API F3 menolak permintaan (HTTP " + res.status + "). " + detail.slice(0, 240),
        "Periksa kelengkapan formula dan checkpoint, lalu coba lagi.",
      );
    }
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    return abstain(
      "api",
      "Layanan F3 tidak dapat dihubungi di " +
        BASE_URL +
        ". Website sengaja tidak menghitung risiko stabilitas sendiri.",
      "Jalankan API F3 dari repository paralab-architecture, lalu muat ulang panel ini.",
    );
  }

  const screening = (data["f2_screening"] as F3Screening | undefined) ?? null;
  const batas = (data["limitations"] as string[] | undefined) ?? [];

  if (data["decision"] === "abstain_human_review_required") {
    return abstain(
      screening && ["blocked", "unknown"].includes(screening.overall_status) ? "f2" : "checkpoint",
      String(data["reason"] ?? "F3 menolak menerbitkan forecast."),
      "Selesaikan tinjauan manusia yang diminta sebelum forecast dapat diterbitkan.",
      screening,
      batas,
    );
  }

  const keputusan = data["decision"];
  if (keputusan !== "flag_high_risk" && keputusan !== "continue_observation") {
    return abstain(
      "kontrak",
      "Keputusan F3 tidak dikenali kontrak website: " + String(keputusan),
      "Periksa kecocokan versi antara website dan artifact F3.",
      screening,
      batas,
    );
  }

  // Penjaga sisi klien.
  //
  // Arsitektur menyatakan bahan `unknown` wajib menghentikan forecast, tetapi
  // `screen_formula` menghitung `overall_status` dengan urutan
  // blocked > warning > unknown, sehingga satu bahan tak dikenal dapat tertutup
  // oleh bahan lain yang berstatus warning dan forecast tetap terbit. Selama
  // urutan itu belum diperbaiki di sisi server, website menolak menampilkan
  // forecast yang menurut aturannya sendiri tidak boleh ada.
  const takDikenal = (screening?.results ?? []).filter((r) => r.status === "unknown");
  if (takDikenal.length > 0) {
    return abstain(
      "f2",
      "F2 tidak mengenali " +
        takDikenal.length +
        " bahan (" +
        takDikenal.map((r) => r.input).join(", ") +
        "), sehingga forecast tidak dapat dipercaya. Server sempat menerbitkan angka risiko; website menahannya karena bahan tak dikenal wajib menghentikan forecast.",
      "Petakan bahan tersebut ke ingredient master F2, atau minta tinjauan formulator sebelum memakai hasil F3.",
      screening,
      batas,
    );
  }

  return {
    kind: "forecast",
    trialId: String(data["trial_id"] ?? permintaan.trial_id),
    keputusan,
    risiko: Number(data["failure_risk"] ?? 0),
    band: String(data["risk_band"] ?? "unknown"),
    keyakinan: String(data["confidence"] ?? "low"),
    mingguForecast: Number(data["forecast_week"] ?? permintaan.landmark_week),
    horizon: String(data["forecast_horizon"] ?? "week_12"),
    tindakan: String(data["recommended_action"] ?? ""),
    sinyal: (data["key_signals"] as F3Signal[] | undefined) ?? [],
    batas,
    screening,
    modelVersion: String(data["model_version"] ?? "tidak diketahui"),
    dataOrigin: String(data["data_origin"] ?? "synthetic_demo"),
  };
}

/** Cek ketersediaan layanan, dipakai untuk menandai status di UI. */
export async function cekKesehatanF3(): Promise<
  { ok: true; modelVersion: string; dataOrigin: string; cvStatus: string } | { ok: false }
> {
  try {
    const res = await fetch(BASE_URL + "/health", { headers: HEADER_TAMBAHAN });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as Record<string, string>;
    return {
      ok: true,
      modelVersion: data["model_version"] ?? "tidak diketahui",
      dataOrigin: data["data_origin"] ?? "synthetic_demo",
      cvStatus: data["cv_status"] ?? "concept_only_synthetic_render_pilot",
    };
  } catch {
    return { ok: false };
  }
}

export const F3_BASE_URL = BASE_URL;
