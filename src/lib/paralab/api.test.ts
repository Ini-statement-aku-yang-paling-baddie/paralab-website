import { describe, expect, it } from "vitest";
import { resolveModelApiBase } from "./api";

describe("resolveModelApiBase", () => {
  it("uses the reverse-proxy path in production when no API origin is configured", () => {
    expect(resolveModelApiBase(undefined, false)).toBe("/api");
  });

  it("keeps the local gateway fallback for development", () => {
    expect(resolveModelApiBase(undefined, true)).toBe("http://localhost:7860");
  });

  it("uses and normalizes an explicitly configured public API origin", () => {
    expect(resolveModelApiBase("https://api.paralab.example/", false)).toBe(
      "https://api.paralab.example",
    );
  });

  it("keeps an explicitly configured same-origin reverse-proxy path", () => {
    expect(resolveModelApiBase("/api/", false)).toBe("/api");
  });

  it("does not permit a production localhost setting to override the reverse proxy", () => {
    expect(resolveModelApiBase("http://localhost:7860", false)).toBe("/api");
  });
});
