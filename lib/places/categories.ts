/**
 * Shared category definitions for NILPro's business categories. Kept in
 * its own file (separate from the server-only `search.ts`) so both server
 * and client components can import these without pulling in any
 * service_role-tainted code.
 *
 * Each category maps to a small set of Google Places text-search terms.
 * Keeping term counts modest caps API cost: `lib/places/search.ts` issues
 * one Places call per (category searchTerm × city).
 *
 * IMPORTANT: category `id`s are never renamed — existing athlete rows
 * have `business_categories` arrays referencing these strings. Only
 * `label`, `hook`, and `searchTerms` are athlete-facing copy that can
 * evolve without a migration.
 */

export type Category = {
  id: string;
  label: string;
  /** 1-line athlete-appealing copy, shown beneath the label in pickers. */
  hook: string;
  searchTerms: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "food_drink",
    label: "Food & drink",
    hook: "Free meals · smoothies · post-game eats",
    searchTerms: ["restaurant", "cafe", "smoothie bar", "ice cream shop"],
  },
  {
    id: "fitness_wellness",
    label: "Fitness & wellness",
    hook: "Gym memberships · supplements · recovery",
    searchTerms: ["gym", "yoga studio", "supplement store", "crossfit"],
  },
  {
    id: "beauty_personal",
    label: "Beauty & personal care",
    hook: "Cuts · color · game-day looks",
    searchTerms: ["barber shop", "hair salon", "nail salon"],
  },
  {
    id: "retail_apparel",
    label: "Gear & retail",
    hook: "Sports gear · sneakers · athletic wear",
    searchTerms: [
      "sporting goods store",
      "shoe store",
      "clothing store",
      "athletic apparel",
    ],
  },
  {
    id: "auto_services",
    label: "Auto services",
    hook: "Detailing · car washes · oil changes",
    searchTerms: ["auto detailing", "car wash", "auto repair", "tire shop"],
  },
  {
    id: "health_medical",
    label: "Sports medicine & recovery",
    hook: "PT · chiropractic · massage · ortho",
    searchTerms: [
      "physical therapy",
      "chiropractor",
      "sports medicine",
      "orthodontist",
    ],
  },
  {
    id: "home_services",
    label: "Lifestyle services",
    hook: "Cleaning · meal prep · moving help",
    searchTerms: ["house cleaning", "meal prep delivery", "moving company"],
  },
  {
    id: "professional_services",
    label: "Professional services",
    hook: "Tutoring · sports photos · video edits",
    searchTerms: ["tutoring", "photography studio", "video production"],
  },
  {
    id: "entertainment_leisure",
    label: "Entertainment & leisure",
    hook: "Bowling · movies · arcades · golf",
    searchTerms: ["bowling alley", "movie theater", "arcade", "golf course"],
  },
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
  juice_shop: "food_drink",
  smoothie_bar: "food_drink",

  // Fitness & wellness
  gym: "fitness_wellness",
  fitness_center: "fitness_wellness",
  yoga_studio: "fitness_wellness",
  pilates_studio: "fitness_wellness",
  wellness_center: "fitness_wellness",
  spa: "fitness_wellness",
  supplement_store: "fitness_wellness",
  vitamin_store: "fitness_wellness",

  // Beauty & personal
  hair_salon: "beauty_personal",
  beauty_salon: "beauty_personal",
  nail_salon: "beauty_personal",
  barber_shop: "beauty_personal",
  hair_care: "beauty_personal",

  // Retail & apparel
  sporting_goods_store: "retail_apparel",
  athletic_apparel_store: "retail_apparel",
  clothing_store: "retail_apparel",
  shoe_store: "retail_apparel",
  jewelry_store: "retail_apparel",
  store: "retail_apparel",
  department_store: "retail_apparel",
  shopping_mall: "retail_apparel",

  // Auto services
  auto_detailing: "auto_services",
  car_repair: "auto_services",
  car_wash: "auto_services",
  car_dealer: "auto_services",
  auto_parts_store: "auto_services",
  tire_shop: "auto_services",

  // Sports medicine & recovery (was "Health & medical")
  physiotherapist: "health_medical",
  physical_therapist: "health_medical",
  physiotherapy_clinic: "health_medical",
  chiropractor: "health_medical",
  sports_medicine_physician: "health_medical",
  orthodontist: "health_medical",
  massage_therapist: "health_medical",
  dentist: "health_medical",
  doctor: "health_medical",
  medical_lab: "health_medical",
  pharmacy: "health_medical",
  hospital: "health_medical",

  // Lifestyle services (was "Home services")
  house_cleaning_service: "home_services",
  cleaning_service: "home_services",
  meal_prep_delivery: "home_services",
  moving_company: "home_services",
  laundry: "home_services",
  dry_cleaning: "home_services",
  plumber: "home_services",
  electrician: "home_services",
  roofing_contractor: "home_services",
  general_contractor: "home_services",
  landscaping: "home_services",
  locksmith: "home_services",
  pest_control_service: "home_services",

  // Professional services
  tutoring_service: "professional_services",
  photography_studio: "professional_services",
  video_production_service: "professional_services",
  lawyer: "professional_services",
  accounting: "professional_services",
  real_estate_agency: "professional_services",
  insurance_agency: "professional_services",
  financial_consultant: "professional_services",

  // Entertainment & leisure
  bowling_alley: "entertainment_leisure",
  movie_theater: "entertainment_leisure",
  amusement_park: "entertainment_leisure",
  night_club: "entertainment_leisure",
  park: "entertainment_leisure",
  golf_course: "entertainment_leisure",
  arcade: "entertainment_leisure",
  video_arcade: "entertainment_leisure",
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
  if (
    t.includes("restaurant") ||
    t.includes("food") ||
    t.includes("cafe") ||
    t.includes("smoothie") ||
    t.includes("juice")
  ) {
    return "food_drink";
  }
  if (
    t.includes("gym") ||
    t.includes("fitness") ||
    t.includes("yoga") ||
    t.includes("pilates") ||
    t.includes("crossfit") ||
    t.includes("supplement")
  ) {
    return "fitness_wellness";
  }
  if (
    t.includes("salon") ||
    t.includes("barber") ||
    t.includes("nail") ||
    t.includes("spa")
  ) {
    return "beauty_personal";
  }
  if (
    t.includes("sporting_goods") ||
    t.includes("apparel") ||
    t.includes("athletic") ||
    t.includes("shoe") ||
    t.includes("store") ||
    t.includes("shop")
  ) {
    return "retail_apparel";
  }
  if (t.includes("car") || t.includes("auto") || t.includes("tire")) {
    return "auto_services";
  }
  if (
    t.includes("physical_therapy") ||
    t.includes("physio") ||
    t.includes("chiro") ||
    t.includes("orthodont") ||
    t.includes("sports_medicine") ||
    t.includes("massage") ||
    t.includes("doctor") ||
    t.includes("clinic") ||
    t.includes("medical") ||
    t.includes("dentist")
  ) {
    return "health_medical";
  }
  if (
    t.includes("cleaning") ||
    t.includes("meal_prep") ||
    t.includes("moving") ||
    t.includes("laundry") ||
    t.includes("plumber") ||
    t.includes("electrician") ||
    t.includes("contractor") ||
    t.includes("landscap")
  ) {
    return "home_services";
  }
  if (
    t.includes("photo") ||
    t.includes("video") ||
    t.includes("tutor") ||
    t.includes("lawyer") ||
    t.includes("real_estate") ||
    t.includes("insurance")
  ) {
    return "professional_services";
  }
  if (
    t.includes("bowling") ||
    t.includes("theater") ||
    t.includes("arcade") ||
    t.includes("golf") ||
    t.includes("amusement") ||
    t.includes("park")
  ) {
    return "entertainment_leisure";
  }
  return fallback;
}
