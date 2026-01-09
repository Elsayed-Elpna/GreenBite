/* =========================
   Meal times
========================= */

import App from "@/App";

export const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer"];

export const MEAL_TIME_COLORS = {
  Breakfast: "bg-yellow-100 text-yellow-700",
  Lunch: "bg-blue-100 text-blue-700",
  Dinner: "bg-purple-100 text-purple-700",
  Snack: "bg-pink-100 text-pink-700",
  Dessert: "bg-orange-100 text-orange-700",
  Appetizer: "bg-green-100 text-green-700",
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
  syrian: "SY",
  iraqi: "IQ",
  jordanian: "JO",
  palestinian: "PS",
  saudi: "SA",
  "saudi arabian": "SA",
  qatari: "QA",
  emirati: "AE",
  kuwaiti: "KW",
  bahraini: "BH",
  oman: "OM",
  yemen: "YE",
  middle_eastern: "LB",
  "middle eastern": "LB",
  algerian: "DZ",

  /* ===== European ===== */
  french: "FR",
  german: "DE",
  british: "GB",

  /* ===== American ===== */
  american: "US",
  mexican: "MX",
  argentinian: "AR",
  canadian: "CA",


  /* ===== African ===== */
  ethiopian: "ET",

  australian: "AU",
  croatian: "HR",
  dutch: "NL",
  filipino: "PH",
  irish: "IE",
  jamaican: "JM",
  kenyan: "KE",
  malaysian: "MY",
  norwegian: "NO",
  polish: "PL",
  portuguese: "PT",
  russian: "RU",
  ukrainian: "UA",
  uruguayan: "UY",
  venezuelan: "VE",
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
  const key = (typeof cuisine === "string" ? cuisine : "")
    .trim()
    .toLowerCase();

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
   Meal Default image
========================= */

export const MEAL_TIME_IMAGES = {
  Breakfast: "/images/mymeals/breakfast.webp",
  Brunch: "/images/mymeals/brunch.jpg",
  Lunch: "/images/mymeals/lunch.jpg",
  Dinner: "/images/mymeals/dinner-table.avif",
  Snack: "/images/mymeals/snack.avif",
  Dessert: "/images/mymeals/DESSERT.webp",
  Appetizer: "/images/mymeals/appetizer.jpg",
};
export const CATEGORY_IMAGES = {
  dairy: "/images/categories/dairy.png",
  meat: "/images/categories/meat.png",
  grain: "/images/categories/grains.png",
  bread: "/images/categories/bread.png",
  other: "/images/categories/other.png",
  vegetable: "/images/categories/vegetables.png",
  fruit: "/images/categories/fruits.png",
};


export const DEFAULT_MEAL_IMAGE = "/images/mymeals/default.webp";

/* =========================
   Ingredient pill colors
========================= */

export const INGREDIENT_PILL_COLORS = [
  "bg-red-50 text-red-700",
  "bg-orange-50 text-orange-700",
  "bg-green-50 text-green-700",
  "bg-blue-50 text-blue-700",
  "bg-purple-50 text-purple-700",
  "bg-pink-50 text-pink-700",
];

/* =========================
   API endpoints
========================= */

export const API_ENDPOINTS = {
  GENERATE_MEALS: "/api/meals/generate/",
  SAVE_MEAL: "/api/meals/save-ai/",
  WASTE_ANALYSIS: "/api/meals/waste/",
};
