import { useState } from "react";
import { generateRecipes } from "@/api/recipes.api";
import { mapRecipeToCard } from "./recipes.mapper";

export default function useGenerateRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (ingredients) => {
    try {
      setLoading(true);
      setError(null);

      const data = await generateRecipes(ingredients);
      const mapped = data.map(mapRecipeToCard);

      setRecipes(mapped);
    } catch (err) {
      setError("Failed to generate recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    recipes,
    loading,
    error,
    generate,
  };
}
