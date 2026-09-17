// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FormulaScreeningCard } from "./FormulaScreeningCard";
import type { F2Screening } from "@/lib/paralab/model-adapters";

afterEach(cleanup);

const SCREENING: F2Screening = {
  screened_at: "2026-09-18T00:00:00",
  rule_version: "v4",
  overall_status: "warning",
  disclaimer: "Screening deterministik untuk data sintetis.",
  results: [
    {
      input: "Niacinamide",
      ingredient_id: "niacinamide",
      inci_name: "Niacinamide",
      status: "warning",
      requires_human_review: true,
      rules_fired: [
        {
          rule_id: "COMPAT-001",
          rule_version: "v4",
          severity: "warning",
          source_id: "SRC-1",
          rationale: "kombinasi dengan asam askorbat berpotensi tidak stabil",
          requires_human_review: true,
        },
      ],
    },
  ],
  derived_features: { electrolyte_thickener_risk: "high" },
  requires_human_signoff: true,
};

describe("FormulaScreeningCard", () => {
  it("menampilkan status keseluruhan dari backend", () => {
    render(<FormulaScreeningCard screening={SCREENING} loading={false} error={null} />);
    expect(screen.getByText("warning")).toBeTruthy();
  });

  it("menampilkan rule_id dan alasan yang bisa diaudit", () => {
    render(<FormulaScreeningCard screening={SCREENING} loading={false} error={null} />);
    expect(screen.getByText(/COMPAT-001/)).toBeTruthy();
    expect(screen.getByText(/asam askorbat berpotensi tidak stabil/)).toBeTruthy();
  });

  it("menandai bahwa sign-off manusia wajib", () => {
    render(<FormulaScreeningCard screening={SCREENING} loading={false} error={null} />);
    expect(screen.getByText(/butuh sign-off manusia/i)).toBeTruthy();
  });

  it("menampilkan derived feature F2", () => {
    render(<FormulaScreeningCard screening={SCREENING} loading={false} error={null} />);
    expect(screen.getByText(/electrolyte_thickener_risk: high/)).toBeTruthy();
  });

  it("menampilkan state loading", () => {
    render(<FormulaScreeningCard screening={null} loading error={null} />);
    expect(screen.getByText(/menjalankan screening formula/i)).toBeTruthy();
  });

  it("menampilkan state error", () => {
    render(<FormulaScreeningCard screening={null} loading={false} error="404" />);
    expect(screen.getByText(/screening formula belum tersedia/i)).toBeTruthy();
  });

  it("tidak menawarkan aksi ubah formula atau konsentrasi", () => {
    render(<FormulaScreeningCard screening={SCREENING} loading={false} error={null} />);
    const labels = screen
      .queryAllByRole("button")
      .map((b) => b.textContent ?? "")
      .join(" | ");
    expect(labels).not.toMatch(/ubah formula|edit|konsentrasi|ganti bahan|tambah bahan/i);
  });
});
