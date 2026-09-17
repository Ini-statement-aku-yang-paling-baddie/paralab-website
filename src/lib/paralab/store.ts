import { useSyncExternalStore } from "react";
import { SEED_PROJECTS, type Batch, type Project } from "./data";
import { EXTRA_PROJECTS } from "./catalog";

const SEMUA_PROYEK: Project[] = [...SEED_PROJECTS, ...EXTRA_PROJECTS];

export type LogEntry = {
  id: string;
  waktu: string;
  peneliti: string;
  proyek: string;
  aksi: string;
  detail: string;
  sensor?: string | undefined;
};

export type AppState = {
  user: { nama: string; peran: string } | null;
  projects: Project[];
  logbook: LogEntry[];
};

const KEY = "paralab-state-v3";

const seedLog: LogEntry[] = [
  {
    id: "log-1",
    waktu: new Date(Date.UTC(2026, 8, 17, 6, 12)).toISOString(),
    peneliti: "Dina Aprilia",
    proyek: "Face Wash Oil Control untuk Pria Aktif",
    aksi: "Pembacaan sensor",
    detail: "pH sampel batch 2 tercatat 5.50 pada suhu reaktor 72.1 C",
    sensor: "ph",
  },
  {
    id: "log-2",
    waktu: new Date(Date.UTC(2026, 8, 17, 5, 40)).toISOString(),
    peneliti: "Raka Wijaya",
    proyek: "Serum Pencerah Niacinamide Ringan",
    aksi: "Evaluasi batch",
    detail: "Batch 1 dievaluasi dengan skor kesesuaian 84",
  },
  {
    id: "log-3",
    waktu: new Date(Date.UTC(2026, 8, 17, 4, 5)).toISOString(),
    peneliti: "Nadia Puspita",
    proyek: "Sunscreen Hybrid SPF 40 Bebas Whitecast",
    aksi: "Batch selesai",
    detail: "Batch 1 ditutup, whitecast masih di luar target",
  },
];

let state: AppState = { user: null, projects: SEMUA_PROYEK, logbook: seedLog };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* penyimpanan lokal tidak tersedia */
    }
  }
}

export function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as AppState;
    if (parsed && Array.isArray(parsed.projects)) {
      state = parsed;
      for (const l of listeners) l();
    }
  } catch {
    /* abaikan data rusak */
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const serverState: AppState = { user: null, projects: SEMUA_PROYEK, logbook: seedLog };

export function useAppState(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverState,
  );
}

export function useProject(id: string) {
  const s = useAppState();
  return s.projects.find((p) => p.id === id) ?? null;
}

export const actions = {
  login(nama: string, peran: string) {
    state = { ...state, user: { nama, peran } };
    emit();
  },
  logout() {
    state = { ...state, user: null };
    emit();
  },
  tambahProyek(p: Project) {
    state = { ...state, projects: [p, ...state.projects] };
    emit();
    actions.catat(p.peneliti, p.judul, "Jurnal baru", "Jurnal penelitian dibuat dari usulan formula AI");
  },
  perbaruiProyek(id: string, ubah: (p: Project) => Project) {
    state = { ...state, projects: state.projects.map((p) => (p.id === id ? ubah(p) : p)) };
    emit();
  },
  simpanBatch(projectId: string, nomor: number, ubah: (b: Batch) => Batch) {
    actions.perbaruiProyek(projectId, (p) => ({
      ...p,
      update: new Date().toISOString(),
      batches: p.batches.map((b) => (b.nomor === nomor ? ubah(b) : b)),
    }));
  },
  tambahBatch(projectId: string, batch: Batch) {
    actions.perbaruiProyek(projectId, (p) => ({ ...p, update: new Date().toISOString(), batches: [...p.batches, batch] }));
  },
  catat(peneliti: string, proyek: string, aksi: string, detail: string, sensor?: string) {
    const entry: LogEntry = {
      id: "log-" + Math.random().toString(36).slice(2, 9),
      waktu: new Date().toISOString(),
      peneliti,
      proyek,
      aksi,
      detail,
      sensor,
    };
    state = { ...state, logbook: [entry, ...state.logbook] };
    emit();
  },
};
