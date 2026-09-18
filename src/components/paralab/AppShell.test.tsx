// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppShell } from "./AppShell";

const mocks = vi.hoisted(() => ({
  hydrate: vi.fn(),
  state: { user: null as { nama: string; peran: string } | null },
  pathname: "/dashboard",
  navigate: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  Navigate: () => <p>Dialihkan ke akses ruang kerja</p>,
  useNavigate: () => mocks.navigate,
  useRouterState: () => mocks.pathname,
}));

vi.mock("@/lib/paralab/store", () => ({
  actions: { logout: mocks.logout },
  hydrate: mocks.hydrate,
  useAppState: () => mocks.state,
}));

afterEach(() => {
  cleanup();
  mocks.hydrate.mockReset();
  mocks.navigate.mockReset();
  mocks.logout.mockReset();
  mocks.state.user = null;
  mocks.pathname = "/dashboard";
});

describe("AppShell", () => {
  it("mengarahkan pengunjung tanpa profil ke halaman akses", async () => {
    render(<AppShell judul="Dashboard">Konten ruang kerja</AppShell>);

    await waitFor(() => expect(screen.getByText(/dialihkan ke akses ruang kerja/i)).toBeTruthy());
    expect(screen.queryByText("Konten ruang kerja")).toBeNull();
  });

  it("membatasi tamu demo pada dashboard", async () => {
    mocks.state.user = { nama: "Tamu Demo", peran: "Pengamat" };
    mocks.pathname = "/journal/new";
    render(<AppShell judul="Jurnal">Konten jurnal</AppShell>);

    await waitFor(() => expect(screen.getByText(/dialihkan ke akses ruang kerja/i)).toBeTruthy());
    expect(screen.queryByText("Konten jurnal")).toBeNull();
  });

  it("mengembalikan pengguna ke beranda saat keluar", async () => {
    mocks.state.user = { nama: "Dina Aprilia", peran: "RnD Formulator" };
    render(<AppShell judul="Dashboard">Konten ruang kerja</AppShell>);

    await waitFor(() => expect(screen.getByText("Konten ruang kerja")).toBeTruthy());
    fireEvent.click(screen.getAllByRole("button", { name: /keluar/i })[0]!);

    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/" });
    expect(mocks.logout).toHaveBeenCalledTimes(1);
  });
});
