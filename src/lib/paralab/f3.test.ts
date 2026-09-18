import { afterEach, describe, expect, it, vi } from "vitest";
import { cekKesehatanF3 } from "./f3";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cekKesehatanF3", () => {
  it("mengirim header ngrok pada health check", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ model_version: "v1", data_origin: "synthetic_demo" })),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(cekKesehatanF3()).resolves.toMatchObject({ ok: true, modelVersion: "v1" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/health$/),
      expect.objectContaining({ headers: { "ngrok-skip-browser-warning": "true" } }),
    );
  });

  it("mengembalikan fallback saat health check gagal", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(cekKesehatanF3()).resolves.toEqual({ ok: false });
  });
});
