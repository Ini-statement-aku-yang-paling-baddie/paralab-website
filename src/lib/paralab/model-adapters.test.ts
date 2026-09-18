import { describe, expect, it } from "vitest";
import { toF2Request } from "./model-adapters";

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

describe("toF2Request", () => {
  it("memetakan nama & persen bahan tanpa field lain", () => {
    expect(toF2Request(BATCH)).toEqual({
      formula: [
        { bahan: "Niacinamide", pct: 4 },
        { bahan: "Carbomer", pct: 0.3 },
      ],
      context: { target_skin: "oily" },
      ph: 5.5,
    });
  });

  it("mengirim ph null saat hasil ph belum diisi", () => {
    expect(toF2Request({ bahan: BATCH.bahan, hasil: [] }).ph).toBeNull();
  });

  it("mengirim ph null saat nilai ph masih kosong", () => {
    expect(
      toF2Request({ bahan: BATCH.bahan, hasil: [{ paramId: "ph", nilai: null }] }).ph,
    ).toBeNull();
  });

  it("tidak memakai parameter non-ph sebagai ph", () => {
    const hasil = [{ paramId: "viskositas", nilai: 6400 }];
    expect(toF2Request({ bahan: BATCH.bahan, hasil }).ph).toBeNull();
  });

  it("mengirim konteks proyek yang sama dengan jalur F3", () => {
    expect(toF2Request(BATCH).context).toEqual({ target_skin: "oily" });
  });
});
