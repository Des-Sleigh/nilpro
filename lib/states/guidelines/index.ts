/**
 * Per-state HS NIL guideline markdown documents.
 *
 * Each state has a long-form, athlete-and-parent-readable .md file in this
 * directory. Files are read at server start and served to client components
 * via getGuidelinesMd(stateCode).
 *
 * If a state's .md file is missing, the loader returns null — callers should
 * fall back to the structured-data display in lib/states/stateRules.ts.
 */

import fs from "fs";
import path from "path";

let CACHE: Record<string, string> | null = null;

function loadAll(): Record<string, string> {
  if (CACHE) return CACHE;

  const dir = path.join(process.cwd(), "lib", "states", "guidelines");
  const all: Record<string, string> = {};

  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const code = file.replace(/\.md$/, "").toUpperCase();
      try {
        const content = fs.readFileSync(path.join(dir, file), "utf-8");
        all[code] = content;
      } catch {
        // Skip unreadable files silently
      }
    }
  } catch {
    // Directory missing or unreadable — return empty cache
  }

  CACHE = all;
  return all;
}

/** Returns the full markdown guideline doc for a state, or null if not yet populated. */
export function getGuidelinesMd(stateCode: string | null | undefined): string | null {
  if (!stateCode) return null;
  const all = loadAll();
  return all[stateCode.toUpperCase()] ?? null;
}

/** Returns true if a guideline doc exists for this state. */
export function hasGuidelines(stateCode: string | null | undefined): boolean {
  return getGuidelinesMd(stateCode) !== null;
}

/** Returns the set of state codes that have guideline docs (for diagnostics). */
export function documentedStateCodes(): string[] {
  return Object.keys(loadAll()).sort();
}

/** Returns a copy of all loaded guideline markdowns keyed by state code. */
export function getAllGuidelinesMd(): Record<string, string> {
  return { ...loadAll() };
}
