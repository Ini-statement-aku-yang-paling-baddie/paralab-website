import { describe, expect, it } from "vitest";
import { BAHAN_LIBRARY } from "./data";
import { normalisasiFormula } from "./ai";

describe("normalisasiFormula", () => {
  it("menyeimbangkan template melalui Aqua hingga total 100 persen", () => {
    const aqua = BAHAN_LIBRARY.find((b) => b.id === "aqua")!;
    const glycerin = BAHAN_LIBRARY.find((b) => b.id === "glycerin")!;
    const formula = normalisasiFormula([
      { ...aqua, percent: 80 },
      { ...glycerin, percent: 8 },
    ]);

    expect(formula.reduce((total, bahan) => total + bahan.percent, 0)).toBe(100);
    expect(formula.find((bahan) => bahan.id === "aqua")?.percent).toBe(92);
  });
});
