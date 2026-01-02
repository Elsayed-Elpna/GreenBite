import { useEffect, useState } from "react";
import { fetchMyMeals, deleteMeal } from "@/api/meals.api";
import { mapMealToCard } from "@/utils/meal.mapper";

export default function useMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMeals = async () => {
    try {
      const data = await fetchMyMeals();
      setMeals(data.map(mapMealToCard));
    } finally {
      setLoading(false);
    }
  };

  const removeMeal = async (id) => {
    await deleteMeal(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    loadMeals();
  }, []);

  return { meals, loading, removeMeal };
}