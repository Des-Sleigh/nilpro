import { describe, expect, it } from "vitest";
import { HS_NIL_PARTIAL_NOTES, HS_NIL_STATUS, hsNilStatusFor } from "@/lib/states/nilStatus";
import { STATE_RULES, rulesFor } from "@/lib/states/stateRules";

// TODO(compliance): reconcile — see the "agrees with the signup gate" test.
const KNOWN_STATUS_DRIFT = [
  "AZ: gate=on rules=partial",
  "AR: gate=on rules=partial",
  "GA: gate=on rules=partial",
  "ID: gate=on rules=partial",
  "IL: gate=on rules=partial",
  "IN: gate=partial rules=off",
  "IA: gate=on rules=partial",
  "KS: gate=on rules=partial",
  "KY: gate=on rules=partial",
  "LA: gate=on rules=partial",
  "ME: gate=on rules=partial",
  "MS: gate=on rules=off",
  "MO: gate=on rules=partial",
  "NV: gate=on rules=partial",
  "SC: gate=on rules=off",
  "WY: gate=on rules=off",
];

// 50 states + DC.
const JURISDICTIONS = Object.keys(HS_NIL_STATUS);

describe("state rules dataset", () => {
  it("covers all 51 jurisdictions in both sources", () => {
    expect(JURISDICTIONS).toHaveLength(51);
    expect(Object.keys(STATE_RULES).sort()).toEqual([...JURISDICTIONS].sort());
  });

  it("agrees with the signup gate on HS NIL status (except known drift)", () => {
    // nilStatus.ts gates signup; stateRules.ts is what users read. If these
    // drift, an athlete can be let in while the explorer says "not allowed"
    // (or vice versa). Which value is legally correct per state needs
    // review before either file changes, so current drift is pinned here:
    // shrinking this list is good, growing it fails CI.
    const mismatches = JURISDICTIONS.filter(
      (code) => STATE_RULES[code].hsNilAllowed !== HS_NIL_STATUS[code]
    ).map((code) => `${code}: gate=${HS_NIL_STATUS[code]} rules=${STATE_RULES[code].hsNilAllowed}`);
    expect(mismatches).toEqual(KNOWN_STATUS_DRIFT);
  });

  it("explains every partial state on the dashboard", () => {
    const partial = JURISDICTIONS.filter((c) => HS_NIL_STATUS[c] === "partial");
    for (const code of partial) expect(HS_NIL_PARTIAL_NOTES[code]).toBeTruthy();
  });

  it("cites a source for every documented state", () => {
    for (const rules of Object.values(STATE_RULES)) {
      if (!rules.documented) continue;
      expect(() => new URL(rules.sourceUrl ?? ""), rules.code).not.toThrow();
      expect(rules.lastUpdated, rules.code).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("looks up codes case-insensitively and defaults unknowns safely", () => {
    expect(rulesFor("tn")?.code).toBe("TN");
    expect(rulesFor(null)).toBeNull();
    expect(hsNilStatusFor("al")).toBe("off");
  });
});
