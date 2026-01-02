// src/utils/ingredients.js

export function normalizeIngredients(raw) {
  if (!raw) return [];

  // "tomato, onion"
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(raw)) {
    return raw
      .map((ing) => {
        if (!ing) return "";

        // already string
        if (typeof ing === "string") return ing.trim();

        // object: {name, measure}
        if (typeof ing === "object") {
          const name = (ing.name ?? ing.ingredient ?? "").toString().trim();
          const measure = (ing.measure ?? "").toString().trim();
          // IMPORTANT: return a STRING (React-safe)
          return `${measure} ${name}`.trim() || name;
        }

        return String(ing).trim();
      })
      .filter(Boolean);
  }

  return [];
}
