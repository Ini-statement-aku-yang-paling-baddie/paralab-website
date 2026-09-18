import { Link, Navigate, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Boxes,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Radio,
  Send,
} from "lucide-react";
import { actions, hydrate, useAppState } from "@/lib/paralab/store";
import { bolehAksesRuangKerja } from "@/lib/paralab/access";
import markLight from "@/assets/paralab-mark-light.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard RnD", icon: LayoutDashboard },
  { to: "/iot", label: "Monitoring Lab", icon: Radio },
  { to: "/journal/new", label: "Jurnal Baru", icon: NotebookPen },
  { to: "/warehouse", label: "Gudang Bahan", icon: Boxes },
  { to: "/logbook", label: "Logbook Lab", icon: BookOpen },
] as const;

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  if (compact) {
    return (
      <span className="inline-flex size-11 items-center justify-center rounded-sm bg-primary">
        <img src={markLight} alt="paralab.ai" className="h-8 w-auto object-contain" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <span className="inline-flex size-12 items-center justify-center rounded-sm bg-primary">
        <img src={markLight} alt="" className="h-9 w-auto object-contain" />
      </span>
      <span
        className={
          "font-display text-xl font-semibold " +
          (light ? "text-primary-foreground" : "text-foreground")
        }
      >
        paralab<span className={light ? "text-primary-foreground/70" : "text-brand"}>.ai</span>
      </span>
    </span>
  );
}

export function AppShell({
  children,
  judul,
  deskripsi,
  aksi,
}: {
  children: ReactNode;
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}) {
  const state = useAppState();
  const navigate = useNavigate();
  const [siap, setSiap] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    hydrate();
    setSiap(true);
  }, []);

  const tamuDemo = state.user?.peran === "Pengamat";
  const navigasi = NAV.filter((item) => bolehAksesRuangKerja(state.user?.peran, item.to));

  if (!siap) {
    return <div className="min-h-screen bg-background" aria-label="Memuat ruang kerja" />;
  }

  if (!state.user) {
    return <Navigate to="/login" search={{ next: pathname }} replace />;
  }

  if (!bolehAksesRuangKerja(state.user.peran, pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  function keluar() {
    navigate({ to: "/" });
    actions.logout();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Link to="/" className="mb-7 border-b border-sidebar-border pb-5">
          <Logo />
        </Link>
        <nav className="flex flex-col gap-1">
          {navigasi.map((item) => {
            const aktif = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors " +
                  (aktif
                    ? "border-brand bg-brand-soft text-brand-ink"
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="border border-border bg-card p-3">
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Activity className="size-3.5 text-success" /> Sensor lab aktif
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              22 kanal terhubung, data diperbarui tiap 2 detik.
            </p>
          </div>
          {state.user && (
            <button
              onClick={keluar}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="size-4" /> Keluar
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="header-deep sticky top-0 z-20 px-5 py-4 lg:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-semibold text-primary-foreground lg:text-2xl">
                {judul}
              </h1>
              {deskripsi && <p className="mt-0.5 text-sm text-white/70">{deskripsi}</p>}
            </div>
            <div className="flex items-center gap-3">
              {aksi}
              <div className="flex items-center gap-2 rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5">
                <span className="flex size-7 items-center justify-center rounded-sm bg-primary-foreground/20 text-xs font-bold text-primary-foreground">
                  {state.user.nama.slice(0, 1)}
                </span>
                <span className="text-sm font-medium text-white">{state.user.nama}</span>
              </div>
              <button
                type="button"
                onClick={keluar}
                className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="size-3.5" /> Keluar
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-1 overflow-x-auto lg:hidden">
            {navigasi.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white/75 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function SendBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
      <Send className="size-3" /> Terkirim
    </span>
  );
}
