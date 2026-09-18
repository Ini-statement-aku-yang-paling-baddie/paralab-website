// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SEED_PROJECTS } from "@/lib/paralab/data";
import { DashboardPage } from "./dashboard";

const state = vi.hoisted(() => ({
  user: { nama: "Samuel Kevin", peran: "RnD Formulator" } as { nama: string; peran: string },
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children, to: _to, params: _params, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; params?: object }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("recharts", () => ({
  CartesianGrid: () => null,
  Line: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

vi.mock("@/components/paralab/AppShell", () => ({
  AppShell: ({ children, aksi }: { children: React.ReactNode; aksi?: React.ReactNode }) => <main>{aksi}{children}</main>,
}));

vi.mock("@/lib/paralab/store", () => ({
  useAppState: () => ({ projects: SEED_PROJECTS, user: state.user }),
}));

afterEach(() => {
  cleanup();
  state.user = { nama: "Samuel Kevin", peran: "RnD Formulator" };
});

describe("DashboardPage", () => {
  it("menghapus aksi pembuka yang menduplikasi daftar penelitian", () => {
    render(<DashboardPage />);

    expect(screen.queryByRole("columnheader", { name: "Aksi" })).toBeNull();
    expect(screen.queryByRole("link", { name: /^Buka$/ })).toBeNull();
    expect(screen.getByText(SEED_PROJECTS[0]!.judul)).toBeTruthy();
  });

  it("menampilkan daftar penelitian sebagai informasi saja untuk tamu demo", () => {
    state.user = { nama: "Tamu Demo", peran: "Pengamat" };
    render(<DashboardPage />);

    expect(screen.queryByRole("link", { name: SEED_PROJECTS[0]!.judul })).toBeNull();
    expect(screen.queryByRole("button", { name: /jurnal baru/i })).toBeNull();
  });
});
