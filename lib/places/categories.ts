/**
 * Shared category labels for NILPro's business categories. Kept in its own
 * file (separate from the server-only `search.ts`) so both server and
 * client components can import these strings without pulling in
 * service_role-tainted code.
 */

export const CATEGORY_LABELS: Record<string, string> = {
  restaurants: "Restaurants & cafés",
  fitness: "Gyms & fitness",
  beauty: "Beauty & salons",
  retail: "Local retail",
  coffee: "Coffee shops",
  auto: "Automotive",
  other: "Other",
};
