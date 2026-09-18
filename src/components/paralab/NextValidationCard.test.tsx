// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NextValidationCard } from "./NextValidationCard";
import type { F4Recommendation } from "@/lib/paralab/f4-adapter";

afterEach(cleanup);

const RECOMMENDATION: F4Recommendation = {
  recommendation_type: "next_validation_step",
  priority: "high",
  recommended_action: "Prioritaskan pengukuran ulang viskositas dan review appearance.",
  reason_codes: ["f2_electrolyte_thickener_risk_high"],
  required_inputs: ["viscosity_cp", "appearance"],
  evidence_ids: [],
  data_origin: "synthetic_demo",
  requires_human_review: true,
  limitations: ["Heuristic prototype untuk prioritisasi observasi."],
};

describe("NextValidationCard", () => {
  it("menampilkan aksi dan prioritas dari backend", () => {
    render(<NextValidationCard recommendation={RECOMMENDATION} loading={false} error={null} />);
    expect(screen.getByText(RECOMMENDATION.recommended_action)).toBeTruthy();
    expect(screen.getByText("high")).toBeTruthy();
  });

  it("menandai bahwa review manusia wajib", () => {
    render(<NextValidationCard recommendation={RECOMMENDATION} loading={false} error={null} />);
    expect(screen.getByText(/butuh review manusia/i)).toBeTruthy();
  });

  it("menampilkan required_inputs dan limitations apa adanya", () => {
    render(<NextValidationCard recommendation={RECOMMENDATION} loading={false} error={null} />);
    expect(screen.getByText(/viscosity_cp/)).toBeTruthy();
    expect(screen.getByText(RECOMMENDATION.limitations[0]!)).toBeTruthy();
  });

  it("menampilkan state loading", () => {
    render(<NextValidationCard recommendation={null} loading error={null} />);
    expect(screen.getByText(/menyiapkan langkah validasi/i)).toBeTruthy();
  });

  it("menampilkan state error", () => {
    render(<NextValidationCard recommendation={null} loading={false} error="service down" />);
    expect(screen.getByText(/langkah validasi belum tersedia/i)).toBeTruthy();
  });

  it("tidak pernah menawarkan aksi ubah formula atau konsentrasi", () => {
    render(<NextValidationCard recommendation={RECOMMENDATION} loading={false} error={null} />);
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "")
      .join(" | ");
    expect(labels).not.toMatch(/ubah formula|edit|konsentrasi|ganti bahan|tambah bahan/i);
  });

  it("menolak rekomendasi yang mengklaim tidak butuh human review", () => {
    render(
      <NextValidationCard
        recommendation={{ ...RECOMMENDATION, requires_human_review: false }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText(/langkah validasi belum tersedia/i)).toBeTruthy();
    expect(screen.queryByText(/butuh review manusia/i)).toBeNull();
  });
});
