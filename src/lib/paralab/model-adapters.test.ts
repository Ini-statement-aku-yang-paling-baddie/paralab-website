import { describe, expect, it } from "vitest";
import {
  missingF3Inputs,
  toF2Request,
  toF3Request,
  type F3Inputs,
} from "./model-adapters";

const BATCH = {
  bahan: [
    { name: "Niacinamide", percent: 4 },
    { name: "Carbomer", percent: 0.3 },
  ],
  hasil: [
    { paramId: "ph", nilai: 5.5 },
    { paramId: "viskositas", nilai: 6400 },
  ],
};

const COMPLETE_F3: F3Inputs = {
  trialId: "trial-1",
  formula: [{ bahan: "Niacinamide", pct: 4 }],
  process: { heating_temp_c: 75, homogenization_rpm: 3200, mixing_time_min: 20 },
  storageTemperatureC: 40,
  landmarkWeek: 4,
  observations: [
    { week: 0, ph: 5.5, viscosity_cp: 6400, appearance: "uniform" },
    { week: 4, ph: 5.4, viscosity_cp: 6100, appearance: "uniform" },
  ],
};

describe("toF2Request", () => {
  it("memetakan nama & persen bahan tanpa field lain", () => {
    expect(toF2Request(BATCH)).toEqual({
      formula: [
        { bahan: "Niacinamide", pct: 4 },
        { bahan: "Carbomer", pct: 0.3 },
      ],
      context: {},
      ph: 5.5,
    });
  });

  it("mengirim ph null saat hasil ph belum diisi", () => {
    expect(toF2Request({ bahan: BATCH.bahan, hasil: [] }).ph).toBeNull();
  });

  it("mengirim ph null saat nilai ph masih kosong", () => {
    expect(toF2Request({ bahan: BATCH.bahan, hasil: [{ paramId: "ph", nilai: null }] }).ph).toBeNull();
  });

  it("tidak memakai parameter non-ph sebagai ph", () => {
    const hasil = [{ paramId: "viskositas", nilai: 6400 }];
    expect(toF2Request({ bahan: BATCH.bahan, hasil }).ph).toBeNull();
  });
});

describe("missingF3Inputs", () => {
  it("melaporkan seluruh input yang belum tersedia pada payload kosong", () => {
    expect(missingF3Inputs({})).toEqual([
      "trialId",
      "formula",
      "process",
      "storageTemperatureC",
      "landmarkWeek",
      "observations",
    ]);
  });

  it("melaporkan process yang tidak lengkap", () => {
    expect(missingF3Inputs({ ...COMPLETE_F3, process: { heating_temp_c: 75 } })).toEqual([
      "process.homogenization_rpm",
      "process.mixing_time_min",
    ]);
  });

  it("menuntut baseline dan checkpoint lanjutan, bukan satu observasi", () => {
    expect(
      missingF3Inputs({ ...COMPLETE_F3, observations: [COMPLETE_F3.observations![0]!] }),
    ).toEqual(["observations.checkpoint"]);
  });

  it("mengembalikan daftar kosong saat input lengkap", () => {
    expect(missingF3Inputs(COMPLETE_F3)).toEqual([]);
  });
});

describe("toF3Request", () => {
  it("menolak membuat request saat input belum lengkap, tanpa mengarang nilai", () => {
    expect(() => toF3Request({})).toThrow(/trialId/);
  });

  it("membangun request F3 persis saat input lengkap", () => {
    expect(toF3Request(COMPLETE_F3)).toEqual({
      trial_id: "trial-1",
      formula: [{ bahan: "Niacinamide", pct: 4 }],
      process: { heating_temp_c: 75, homogenization_rpm: 3200, mixing_time_min: 20 },
      storage_temperature_c: 40,
      landmark_week: 4,
      observations: [
        { week: 0, ph: 5.5, viscosity_cp: 6400, appearance: "uniform" },
        { week: 4, ph: 5.4, viscosity_cp: 6100, appearance: "uniform" },
      ],
    });
  });
});
