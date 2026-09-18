import { describe, expect, it } from "vitest";
import {
  assertConfirmable,
  parseF5Draft,
  toF5Request,
  toUcapanTerstruktur,
  type F5Draft,
} from "./f5-adapter";

const DRAFT: F5Draft = {
  trial_id: "serum-batch-2",
  proposed_checkpoint_patch: {
    measurements: { ph: 5.5, viscosity_cp: 6400 },
    observations: { appearance: "homogen" },
  },
  requires_confirmation: true,
};

describe("toF5Request", () => {
  it("mengirim identitas trial dari UI, bukan dari transkrip", () => {
    expect(toF5Request("serum-batch-2", "pH lima koma lima")).toEqual({
      selected_trial_id: "serum-batch-2",
      transcript: "pH lima koma lima",
    });
  });
});

describe("assertConfirmable", () => {
  it("meloloskan draft yang wajib dikonfirmasi", () => {
    expect(() => assertConfirmable(DRAFT)).not.toThrow();
  });

  it("menolak draft yang mengklaim tidak butuh konfirmasi", () => {
    expect(() => assertConfirmable({ ...DRAFT, requires_confirmation: false })).toThrow(
      /konfirmasi/i,
    );
  });
});

describe("parseF5Draft", () => {
  it("menolak payload yang tidak memiliki trial_id string dan patch objects", () => {
    expect(() => parseF5Draft({ ...DRAFT, trial_id: 123 })).toThrow(/kontrak draft f5/i);
    expect(() =>
      parseF5Draft({
        ...DRAFT,
        proposed_checkpoint_patch: { measurements: [], observations: "homogen" },
      }),
    ).toThrow(/kontrak draft f5/i);
  });

  it("menolak nilai patch yang bukan number|null atau string|null", () => {
    expect(() =>
      parseF5Draft({
        ...DRAFT,
        proposed_checkpoint_patch: { measurements: { ph: "5.5" }, observations: {} },
      }),
    ).toThrow(/kontrak draft f5/i);
    expect(() =>
      parseF5Draft({
        ...DRAFT,
        proposed_checkpoint_patch: { measurements: {}, observations: { appearance: 5 } },
      }),
    ).toThrow(/kontrak draft f5/i);
  });
});

describe("toUcapanTerstruktur", () => {
  it("memetakan measurement menjadi parameter dengan label dan unit", () => {
    const hasil = toUcapanTerstruktur(DRAFT, "pH lima koma lima");
    expect(hasil.parameter).toEqual([
      { label: "pH", nilai: 5.5, unit: "" },
      { label: "Viskositas", nilai: 6400, unit: "cP" },
    ]);
    expect(hasil.observasi).toEqual(["appearance: homogen"]);
    expect(hasil.mentah).toBe("pH lima koma lima");
  });

  it("tidak mengarang unit untuk parameter yang tidak dikenal", () => {
    const draft: F5Draft = {
      ...DRAFT,
      proposed_checkpoint_patch: { measurements: { unknown_metric: 12 }, observations: {} },
    };
    expect(toUcapanTerstruktur(draft, "x").parameter).toEqual([
      { label: "unknown_metric", nilai: 12, unit: "" },
    ]);
  });

  it("melewati measurement kosong alih-alih menulis nol", () => {
    const draft: F5Draft = {
      ...DRAFT,
      proposed_checkpoint_patch: { measurements: { ph: null }, observations: {} },
    };
    expect(toUcapanTerstruktur(draft, "x").parameter).toEqual([]);
  });
});
