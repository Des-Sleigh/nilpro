/**
 * Per-state HS NIL rules — the rich dataset that backs the public
 * /state-rules page and the athlete dashboard "Your state's rules" card.
 *
 * Distinct from `nilStatus.ts`, which holds the simpler on/partial/off flag
 * that gates signup and drives map color. This file holds the full per-state
 * rule readout for users to consult.
 *
 * IMPORTANT — DATA STATUS: Only the five states marked `documented: true`
 * (CA, TX, FL, NY, GA) have been seeded with researched values. Every other
 * state defaults to `documented: false` with neutral placeholders, surfaced
 * to users as "Documentation in progress." All seeded data is sourced from
 * each state association's published HS NIL policy circa 2024-2025 and MUST
 * be verified by a sports/entertainment attorney before public launch — see
 * `project_pre_launch_tasks.md`.
 */

import { HS_NIL_STATUS, type HsNilStatus } from "./nilStatus";

export type NotarizationRule = "none" | "minor-only" | "required";

export type StateRules = {
  code: string;
  name: string;
  hsNilAllowed: HsNilStatus;
  parentalConsentRequired: boolean;
  parentalCosignOnDeals: boolean;
  notarization: NotarizationRule;
  schoolApprovalRequired: boolean;
  schoolDisclosureRequired: boolean;
  bannedCategories: string[];
  notes: string;
  sourceLabel?: string;
  sourceUrl?: string;
  lastUpdated: string;
  documented: boolean;
};

const STANDARD_BANNED = [
  "alcohol",
  "tobacco",
  "cannabis",
  "gambling",
  "firearms",
  "adult content",
  "performance-enhancing supplements",
];

const SEEDED: Record<string, StateRules> = {
  CA: {
    code: "CA",
    name: "California",
    hsNilAllowed: "on",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "none",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: true,
    bannedCategories: STANDARD_BANNED,
    notes:
      "CIF Bylaw 510 permits HS NIL but bars use of school IP (logo, mascot, uniform). Disclosure to school athletic director required within 7 days of signing.",
    sourceLabel: "CIF Bylaw 510",
    sourceUrl: "https://www.cifstate.org",
    lastUpdated: "2025-09-01",
    documented: true,
  },
  TX: {
    code: "TX",
    name: "Texas",
    hsNilAllowed: "partial",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "minor-only",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: true,
    bannedCategories: [
      ...STANDARD_BANNED,
      "sexually-oriented businesses",
      "controlled substances",
    ],
    notes:
      "UIL approved HS NIL with strict restrictions: no school IP, no inducements to attend a particular school, mandatory disclosure to UIL within 5 days. Some minor performance contracts may require notarization under TX Family Code.",
    sourceLabel: "UIL HS NIL Policy",
    sourceUrl: "https://www.uiltexas.org",
    lastUpdated: "2025-09-01",
    documented: true,
  },
  FL: {
    code: "FL",
    name: "Florida",
    hsNilAllowed: "on",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "minor-only",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: true,
    bannedCategories: STANDARD_BANNED,
    notes:
      "FHSAA Bylaw 9.9 permits HS NIL. Florida minor-contract law (Ch. 743) may require court approval or notarization for higher-value deals — verify before signing significant contracts.",
    sourceLabel: "FHSAA Bylaw 9.9",
    sourceUrl: "https://www.fhsaa.org",
    lastUpdated: "2025-09-01",
    documented: true,
  },
  NY: {
    code: "NY",
    name: "New York",
    hsNilAllowed: "on",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "minor-only",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: false,
    bannedCategories: [...STANDARD_BANNED, "weapons"],
    notes:
      "NYSPHSAA permits HS NIL. New York Arts and Cultural Affairs Law §35.03 may require notarization or court approval for certain minor performance contracts above a threshold value — confirm with counsel for deals over $1,000.",
    sourceLabel: "NYSPHSAA NIL Policy",
    sourceUrl: "https://www.nysphsaa.org",
    lastUpdated: "2025-09-01",
    documented: true,
  },
  GA: {
    code: "GA",
    name: "Georgia",
    hsNilAllowed: "on",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "none",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: false,
    bannedCategories: [...STANDARD_BANNED, "weapons"],
    notes:
      "GHSA Bylaw 1.91 permits HS NIL with the standard prohibitions on school IP and recruiting inducements. No mandatory school disclosure or notarization at the state level.",
    sourceLabel: "GHSA Bylaw 1.91",
    sourceUrl: "https://www.ghsa.net",
    lastUpdated: "2025-09-01",
    documented: true,
  },
};

const STATE_NAMES_FULL: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin",
  WY: "Wyoming",
};

function stubFor(code: string): StateRules {
  return {
    code,
    name: STATE_NAMES_FULL[code] ?? code,
    hsNilAllowed: HS_NIL_STATUS[code] ?? "off",
    parentalConsentRequired: true,
    parentalCosignOnDeals: true,
    notarization: "none",
    schoolApprovalRequired: false,
    schoolDisclosureRequired: false,
    bannedCategories: STANDARD_BANNED,
    notes:
      "Documentation in progress. Detailed rules for this state have not yet been verified. Treat parental co-signature as required and consult your school's athletic director before signing any deal.",
    lastUpdated: "2026-04-27",
    documented: false,
  };
}

export const STATE_RULES: Record<string, StateRules> = (() => {
  const all: Record<string, StateRules> = { ...SEEDED };
  for (const code of Object.keys(STATE_NAMES_FULL)) {
    if (!all[code]) all[code] = stubFor(code);
  }
  return all;
})();

export function rulesFor(code: string | null | undefined): StateRules | null {
  if (!code) return null;
  return STATE_RULES[code.toUpperCase()] ?? null;
}

export function allStateRules(): StateRules[] {
  return Object.values(STATE_RULES).sort((a, b) => a.name.localeCompare(b.name));
}
