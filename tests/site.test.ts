import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, siteUrl } from "@/lib/site";

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("falls back to production when unset or blank", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(siteUrl()).toBe("https://thenilpro.com");
  });

  it("uses the configured origin and strips trailing slashes", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000//");
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  it("joins paths with exactly one slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://thenilpro.com/");
    expect(absoluteUrl("/dashboard")).toBe("https://thenilpro.com/dashboard");
    expect(absoluteUrl("dashboard")).toBe("https://thenilpro.com/dashboard");
  });
});
