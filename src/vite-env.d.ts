/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL model gateway ParaLab: F1, F2, F4, F5. Lihat `.env.example`. */
  readonly VITE_MODEL_API_BASE?: string;
  /** Base URL API F3 Stability Sentinel. Lihat `.env.example`. */
  readonly VITE_PARALAB_F3_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
