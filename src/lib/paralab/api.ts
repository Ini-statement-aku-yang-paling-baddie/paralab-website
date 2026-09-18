/**
 * Satu titik panggilan ke model gateway ParaLab.
 *
 * Dalam production, `/api` diarahkan reverse proxy ke deployment backend. Origin
 * publik dapat diatur dengan `VITE_MODEL_API_BASE`; localhost hanya fallback dev.
 */
const DEVELOPMENT_API_BASE = "http://localhost:7860";
const PRODUCTION_API_BASE = "/api";

function removeTrailingSlashes(value: string): string {
  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

function isLoopbackOrigin(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}

export function resolveModelApiBase(
  configuredBase: string | undefined,
  isDevelopment: boolean,
): string {
  const base = configuredBase?.trim();

  if (!base || (!isDevelopment && isLoopbackOrigin(base))) {
    return isDevelopment ? DEVELOPMENT_API_BASE : PRODUCTION_API_BASE;
  }

  return removeTrailingSlashes(base);
}

export const MODEL_API_BASE = resolveModelApiBase(
  import.meta.env.VITE_MODEL_API_BASE,
  import.meta.env.DEV,
);

export class ModelApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ModelApiError";
  }
}

export async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${MODEL_API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : "Model service request failed";
    throw new ModelApiError(response.status, detail);
  }

  return payload as TResponse;
}
