import { describe, expect, it } from "vitest";
import { isSameOrigin, safeRedirectPath } from "@/lib/auth/redirect";

describe("safeRedirectPath", () => {
  it.each(["/dashboard", "/update-password", "/admin?tab=queue", "/a/00042"])(
    "allows same-origin path %s",
    (path) => expect(safeRedirectPath(path)).toBe(path)
  );

  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "evil.com",
    "",
  ])("rejects %j", (path) => expect(safeRedirectPath(path)).toBeNull());

  it("rejects non-strings (FormData can yield File or null)", () => {
    expect(safeRedirectPath(null)).toBeNull();
    expect(safeRedirectPath(undefined)).toBeNull();
    expect(safeRedirectPath(42)).toBeNull();
  });
});

describe("isSameOrigin", () => {
  const origin = "https://thenilpro.com";

  it("accepts an exact origin or a same-origin referer", () => {
    expect(isSameOrigin("https://thenilpro.com", origin)).toBe(true);
    expect(isSameOrigin("https://thenilpro.com/dashboard?x=1", origin)).toBe(true);
  });

  it("rejects lookalike hosts that share a prefix", () => {
    expect(isSameOrigin("https://thenilpro.com.evil.com", origin)).toBe(false);
    expect(isSameOrigin("https://thenilpro.com@evil.com", origin)).toBe(false);
  });

  it("rejects other schemes, ports, missing and malformed headers", () => {
    expect(isSameOrigin("http://thenilpro.com", origin)).toBe(false);
    expect(isSameOrigin("https://thenilpro.com:8443", origin)).toBe(false);
    expect(isSameOrigin(null, origin)).toBe(false);
    expect(isSameOrigin("not a url", origin)).toBe(false);
  });
});
