/**
 * Shared category definitions for NILPro's business categories. Kept in
 * its own file (separate from the server-only `search.ts`) so both server
 * and client components can import these without pulling in any
 * service_role-tainted code.
 *
 * Each category maps to 1–2 Google Places text-search terms. Keeping term
 * counts modest caps API cost: `lib/places/search.ts` issues one Places
 * call per (category searchTerm × city).
 */

export type Category = {
  id: string;
  label: string;
  searchTerms: string[];
};

export const CATEGORIES: Category[] = [
  { id: "food_drink",            label: "Food & drink",            searchTerms: ["restaurant", "cafe"] },
  { id: "fitness_wellness",      label: "Fitness & wellness",      searchTerms: ["gym", "yoga studio"] },
  { id: "beauty_personal",       label: "Beauty & personal care",  searchTerms: ["hair salon", "nail salon"] },
  { id: "retail_apparel",        label: "Retail & apparel",        searchTerms: ["clothing store"] },
  { id: "auto_services",         label: "Auto services",           searchTerms: ["auto repair"] },
  { id: "health_medical",        label: "Health & medical",        searchTerms: ["dentist"] },
  { id: "home_services",         label: "Home services",           searchTerms: ["landscaping"] },
  { id: "professional_services", label: "Professional services",   searchTerms: ["tutoring"] },
  { id: "entertainment_leisure", label: "Entertainment & leisure", searchTerms: ["bowling alley"] },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

// Convenience lookup used by components that only need the display string.
export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);
