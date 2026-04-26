/**
 * High-school NIL legality by US state.
 *
 * `on`      — full HS NIL access, no special restrictions
 * `partial` — allowed but with restrictions (age limits, mandatory school
 *             notification, restricted deal types, etc.)
 * `off`     — HS NIL not yet permitted in this state
 *
 * College NIL is legal in all 50 states + DC since July 2021, so this map
 * only matters when level === 'HS'. For partial states we surface a notice
 * on the dashboard; for off states we block signup.
 */
export type HsNilStatus = "on" | "partial" | "off";

export const HS_NIL_STATUS: Record<string, HsNilStatus> = {
  AL: "off",  AK: "on",   AZ: "on",   AR: "on",   CA: "on",
  CO: "on",   CT: "on",   DE: "on",   DC: "on",   FL: "on",
  GA: "on",   HI: "off",  ID: "on",   IL: "on",   IN: "partial",
  IA: "on",   KS: "on",   KY: "on",   LA: "on",   ME: "on",
  MD: "on",   MA: "on",   MI: "partial", MN: "on",   MS: "on",
  MO: "on",   MT: "partial", NE: "on",   NV: "on",   NH: "on",
  NJ: "on",   NM: "on",   NY: "on",   NC: "on",   ND: "on",
  OH: "partial", OK: "on",   OR: "on",   PA: "on",   RI: "on",
  SC: "on",   SD: "on",   TN: "on",   TX: "partial", UT: "on",
  VT: "on",   VA: "on",   WA: "on",   WV: "on",   WI: "on",
  WY: "on",
};

/** Plain-English description of what a "partial" state restricts. Used
 *  as the body of the dashboard restrictions tile. */
export const HS_NIL_PARTIAL_NOTES: Record<string, string> = {
  IN: "Indiana requires school notification for HS NIL deals; some deal types are excluded.",
  MI: "Michigan limits HS NIL to specific categories — no alcohol, gambling, tobacco, or firearms.",
  MT: "Montana permits HS NIL but with delayed payment until college enrollment in some cases.",
  OH: "Ohio requires school disclosure and excludes certain deal categories.",
  TX: "Texas allows HS NIL with age and school-disclosure requirements; check your school's policy.",
};

/** Friendly state name for messaging — only the few we reference. */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  HI: "Hawaii",
  IN: "Indiana",
  MI: "Michigan",
  MT: "Montana",
  OH: "Ohio",
  TX: "Texas",
};

export function hsNilStatusFor(stateCode: string | null | undefined): HsNilStatus {
  if (!stateCode) return "on";
  return HS_NIL_STATUS[stateCode.toUpperCase()] ?? "on";
}

export function stateName(stateCode: string | null | undefined): string {
  if (!stateCode) return "your state";
  const code = stateCode.toUpperCase();
  return STATE_NAMES[code] ?? code;
}
