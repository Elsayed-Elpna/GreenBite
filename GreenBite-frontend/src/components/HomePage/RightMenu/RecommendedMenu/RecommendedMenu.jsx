import React, { useEffect, useState } from "react";
import MenuCard from "./MenuCard";
import { getRandomRecipe } from "@/api/mealdb.api"; 

const RecommendedMenu = () => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRandomRecipe(); 
      setRecipe(data);
    } catch (e) {
      const details = 
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "unknown error";
      setError(`Failed to load recommended recipes: ${details}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, []);

  return (
    <MenuCard
      recipe={recipe}
      loading={loading}
      error={error}
      onRefresh={fetchRecipe}
    />
  );
};

export default RecommendedMenu;