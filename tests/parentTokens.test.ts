import { describe, expect, it } from "vitest";
import { newParentCode, newParentToken } from "@/lib/email/parentTokens";

describe("parent consent credentials", () => {
  it("issues RFC 4122 v4 tokens", () => {
    expect(newParentToken()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("issues 6-digit codes with no leading zero", () => {
    for (let i = 0; i < 1000; i++) {
      expect(newParentCode()).toMatch(/^[1-9]\d{5}$/);
    }
  });
});
