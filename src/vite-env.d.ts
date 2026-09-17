/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL model gateway ParaLab. Lihat `.env.example`. */
  readonly VITE_MODEL_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
