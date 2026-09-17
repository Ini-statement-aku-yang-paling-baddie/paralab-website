/**
 * Satu titik panggilan ke model gateway ParaLab.
 *
 * Base URL diatur lewat env var `VITE_MODEL_API_BASE` sehingga host backend
 * (lokal, HF Space, cloud VM, atau tunnel laptop) bisa diganti tanpa mengubah kode.
 */
export const MODEL_API_BASE = (
  import.meta.env.VITE_MODEL_API_BASE ?? "http://localhost:7860"
).replace(/\/$/, "");

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
