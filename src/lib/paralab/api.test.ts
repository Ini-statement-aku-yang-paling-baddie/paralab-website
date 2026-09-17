import { describe, expect, it, vi } from "vitest";
import { ModelApiError, postJson } from "./api";

describe("postJson", () => {
  it("melempar detail API saat backend menolak request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "formula is invalid" }), { status: 422 }),
      ),
    );
    await expect(postJson("/v1/f2/health-check", {})).rejects.toEqual(
      new ModelApiError(422, "formula is invalid"),
    );
  });

  it("mengembalikan payload JSON saat backend menerima request", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), { status: 200 }),
      ),
    );
    await expect(postJson<{ status: string }>("/v1/f4/next-validation", {})).resolves.toEqual({
      status: "ok",
    });
  });
});
