// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AppShell } from "./AppShell";

const mocks = vi.hoisted(() => ({
  hydrate: vi.fn(),
  state: { user: null as { nama: string; peran: string } | null },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  Navigate: () => <p>Dialihkan ke akses ruang kerja</p>,
  useRouterState: () => "/dashboard",
}));

vi.mock("@/lib/paralab/store", () => ({
  actions: { logout: vi.fn() },
  hydrate: mocks.hydrate,
  useAppState: () => mocks.state,
}));

afterEach(() => {
  cleanup();
  mocks.hydrate.mockReset();
  mocks.state.user = null;
});

describe("AppShell", () => {
  it("mengarahkan pengunjung tanpa profil ke halaman akses", async () => {
    render(<AppShell judul="Dashboard">Konten ruang kerja</AppShell>);

    await waitFor(() => expect(screen.getByText(/dialihkan ke akses ruang kerja/i)).toBeTruthy());
    expect(screen.queryByText("Konten ruang kerja")).toBeNull();
  });

  it("menampilkan ruang kerja setelah profil dipilih", async () => {
    mocks.state.user = { nama: "Dina Aprilia", peran: "RnD Formulator" };
    render(<AppShell judul="Dashboard">Konten ruang kerja</AppShell>);

    await waitFor(() => expect(screen.getByText("Konten ruang kerja")).toBeTruthy());
    expect(screen.getByText("Dina Aprilia")).toBeTruthy();
  });
});
