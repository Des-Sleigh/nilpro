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

/**
 * Heuristic mapping from a Google Places `primaryType` string to one of
 * our 9 category ids. Used when an athlete manually adds a place from
 * the Places search autocomplete — we need a reasonable default category
 * without asking them. Unknown types fall through to
 * `professional_services`.
 *
 * The Places (New) API returns lower-snake types like `restaurant`,
 * `beauty_salon`, etc. — see
 * https://developers.google.com/maps/documentation/places/web-service/place-types
 */
const PLACE_TYPE_TO_CATEGORY: Record<string, string> = {
  // Food & drink
  restaurant: "food_drink",
  cafe: "food_drink",
  bar: "food_drink",
  bakery: "food_drink",
  meal_takeaway: "food_drink",
  meal_delivery: "food_drink",
  coffee_shop: "food_drink",
  ice_cream_shop: "food_drink",
  pizza_restaurant: "food_drink",
  fast_food_restaurant: "food_drink",

  // Fitness & wellness
  gym: "fitness_wellness",
  fitness_center: "fitness_wellness",
  yoga_studio: "fitness_wellness",
  physiotherapist: "fitness_wellness",
  wellness_center: "fitness_wellness",
  spa: "fitness_wellness",

  // Beauty & personal
  hair_salon: "beauty_personal",
  beauty_salon: "beauty_personal",
  nail_salon: "beauty_personal",
  barber_shop: "beauty_personal",

  // Retail & apparel
  clothing_store: "retail_apparel",
  shoe_store: "retail_apparel",
  jewelry_store: "retail_apparel",
  store: "retail_apparel",
  department_store: "retail_apparel",
  shopping_mall: "retail_apparel",

  // Auto services
  car_repair: "auto_services",
  car_wash: "auto_services",
  car_dealer: "auto_services",
  auto_parts_store: "auto_services",

  // Health & medical
  dentist: "health_medical",
  doctor: "health_medical",
  chiropractor: "health_medical",
  physiotherapy_clinic: "health_medical",
  medical_lab: "health_medical",
  pharmacy: "health_medical",
  hospital: "health_medical",

  // Home services
  plumber: "home_services",
  electrician: "home_services",
  roofing_contractor: "home_services",
  general_contractor: "home_services",
  landscaping: "home_services",
  house_cleaning_service: "home_services",
  moving_company: "home_services",
  locksmith: "home_services",
  pest_control_service: "home_services",

  // Professional services
  lawyer: "professional_services",
  accounting: "professional_services",
  real_estate_agency: "professional_services",
  insurance_agency: "professional_services",
  tutoring_service: "professional_services",
  financial_consultant: "professional_services",

  // Entertainment & leisure
  bowling_alley: "entertainment_leisure",
  movie_theater: "entertainment_leisure",
  amusement_park: "entertainment_leisure",
  night_club: "entertainment_leisure",
  park: "entertainment_leisure",
  golf_course: "entertainment_leisure",
  arcade: "entertainment_leisure",
};

/**
 * Map a Google Places primaryType to one of our category IDs. Falls back
 * to the provided default (or `professional_services`) when the type
 * isn't in our table.
 */
export function categoryFromPlaceType(
  primaryType: string | null | undefined,
  fallback: string = "professional_services"
): string {
  if (!primaryType) return fallback;
  const hit = PLACE_TYPE_TO_CATEGORY[primaryType];
  if (hit) return hit;
  // Soft fallback: try common suffixes/keywords in the type name.
  const t = primaryType.toLowerCase();
  if (t.includes("restaurant") || t.includes("food") || t.includes("cafe")) {
    return "food_drink";
  }
  if (t.includes("gym") || t.includes("fitness")) return "fitness_wellness";
  if (t.includes("salon") || t.includes("spa")) return "beauty_personal";
  if (t.includes("store") || t.includes("shop")) return "retail_apparel";
  if (t.includes("car") || t.includes("auto")) return "auto_services";
  if (
    t.includes("doctor") ||
    t.includes("clinic") ||
    t.includes("medical") ||
    t.includes("dentist")
  ) {
    return "health_medical";
  }
  return fallback;
}
