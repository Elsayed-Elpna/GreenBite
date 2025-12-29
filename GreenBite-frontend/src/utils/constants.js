/* =========================
   Meal times
========================= */

export const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

export const MEAL_TIME_COLORS = {
  Breakfast: "bg-yellow-100 text-yellow-700",
  Lunch: "bg-blue-100 text-blue-700",
  Dinner: "bg-purple-100 text-purple-700",
  Snack: "bg-pink-100 text-pink-700",
  Dessert: "bg-orange-100 text-orange-700"
};

/* =========================
   Difficulty
========================= */

export const DIFFICULTY_COLORS = {
  easy: "text-green-600",
  medium: "text-orange-500",
  hard: "text-red-600",
};

/* =========================
   Cuisine → Country mapping
   (backend value → ISO country code)
========================= */

export const CUISINE_COUNTRY_MAP = {
  /* ===== Asian ===== */
  japanese: "JP",
  korean: "KR",
  chinese: "CN",
  thai: "TH",
  vietnamese: "VN",
  asian: "CN",

  /* ===== Indian / South Asian ===== */
  indian: "IN",
  pakistani: "PK",
  bangladeshi: "BD",

  /* ===== Mediterranean ===== */
  italian: "IT",
  greek: "GR",
  spanish: "ES",
  mediterranean: "GR",

  /* ===== Middle Eastern ===== */
  lebanese: "LB",
  turkish: "TR",
  moroccan: "MA",
  egyptian: "EG",
  middle_eastern: "LB",
  "middle eastern": "LB",

  /* ===== European ===== */
  french: "FR",
  german: "DE",

  /* ===== American ===== */
  american: "US",
  mexican: "MX",

  /* ===== African ===== */
  ethiopian: "ET",
};


/* =========================
   Reusable color palette
========================= */

export const CUISINE_COLOR_PALETTE = [
  {
    pill: "bg-red-100 text-red-700",
    shadowClass: "shadow-[0_14px_35px_rgba(239,68,68,0.25)]",
  },
  {
    pill: "bg-orange-100 text-orange-700",
    shadowClass: "shadow-[0_14px_35px_rgba(249,115,22,0.25)]",
  },
  {
    pill: "bg-green-100 text-green-700",
    shadowClass: "shadow-[0_14px_35px_rgba(34,197,94,0.25)]",
  },
  {
    pill: "bg-blue-100 text-blue-700",
    shadowClass: "shadow-[0_14px_35px_rgba(59,130,246,0.25)]",
  },
  {
    pill: "bg-purple-100 text-purple-700",
    shadowClass: "shadow-[0_14px_35px_rgba(168,85,247,0.25)]",
  },
  {
    pill: "bg-pink-100 text-pink-700",
    shadowClass: "shadow-[0_14px_35px_rgba(236,72,153,0.25)]",
  },
];


/* =========================
   Cuisine visual resolver
   (THIS is what UI uses)
========================= */

export const getCuisineVisuals = (cuisine = "") => {
  const key = cuisine.toLowerCase().trim();

  const countryCode =
    CUISINE_COUNTRY_MAP[key] || "UN"; // 🌍 default

  const index =
    key
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    CUISINE_COLOR_PALETTE.length;

  return {
    countryCode,
    ...CUISINE_COLOR_PALETTE[index],
  };
};


/* =========================
   API endpoints
========================= */

export const API_ENDPOINTS = {
  GENERATE_MEALS: "/api/meals/generate/",
  SAVE_MEAL: "/api/meals/save-ai/",
  WASTE_ANALYSIS: "/api/meals/waste/",
};
