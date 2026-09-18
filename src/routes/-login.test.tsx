// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LoginPage } from "./login";

const { navigate, login } = vi.hoisted(() => ({
  navigate: vi.fn(),
  login: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("@/components/paralab/AppShell", () => ({
  Logo: () => <span>paralab.ai</span>,
}));

vi.mock("@/lib/paralab/store", () => ({
  actions: { login },
}));

afterEach(() => {
  cleanup();
  navigate.mockReset();
  login.mockReset();
});

describe("LoginPage", () => {
  it("menjelaskan bahwa pemilihan profil bukan autentikasi akun", () => {
    render(<LoginPage />);
    expect(screen.getByText(/belum memakai autentikasi akun/i)).toBeTruthy();
    expect(screen.queryByLabelText(/kata sandi/i)).toBeNull();
  });

  it("membuka dashboard contoh lewat mode demo yang eksplisit", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /buka dashboard contoh/i }));

    expect(login).toHaveBeenCalledWith("Tamu Demo", "Pengamat");
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });

  it("masuk sebagai peneliti dengan profil yang dipilih", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /lanjut sebagai peneliti/i }));

    expect(login).toHaveBeenCalledWith("Samuel Kevin", "RnD Formulator");
    expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" });
  });
});
