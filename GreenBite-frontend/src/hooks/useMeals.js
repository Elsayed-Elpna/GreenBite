import { useEffect, useState } from "react";
import { fetchMyMeals, deleteMeal } from "@/api/meals.api";
import { mapMealToCard } from "@/utils/meal.mapper";

export default function useMeals() {
  const [allMeals, setAllMeals] = useState([]); // full list from API
  const [filteredMeals, setFilteredMeals] = useState([]); // after filters
  const [meals, setMeals] = useState([]); // current page
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    mealTime: "",
    has_leftovers: "",
    calories_min: "",
    calories_max: "",
    ordering: "-created_at",
  });

  // 1️⃣ Load all meals once
  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      try {
        const data = await fetchMyMeals({ page: 1, page_size: 1000 }); // fetch all
        const mapped = data.results.map(mapMealToCard);
        setAllMeals(mapped);
      } finally {
        setLoading(false);
      }
    };
    loadMeals();
  }, []);

  // 2️⃣ Apply filters client-side
  useEffect(() => {
    let m = [...allMeals];

    if (filters.search)
      m = m.filter(
        (meal) =>
          meal.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          meal.cuisine.toLowerCase().includes(filters.search.toLowerCase())
      );

    if (filters.mealTime) m = m.filter((meal) => meal.mealTime === filters.mealTime);
    if (filters.has_leftovers !== "") {
      const hasLeftovers = filters.has_leftovers === true || filters.has_leftovers === "true";

      m = m.filter((meal) => meal.hasLeftovers === hasLeftovers);
    }


    if (filters.calories_min) m = m.filter((meal) => meal.calories >= Number(filters.calories_min));
    if (filters.calories_max) m = m.filter((meal) => meal.calories <= Number(filters.calories_max));

    // Ordering
    if (filters.ordering === "created_at")
      m.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (filters.ordering === "-created_at")
      m.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filters.ordering === "calories") m.sort((a, b) => a.calories - b.calories);
    if (filters.ordering === "-calories") m.sort((a, b) => b.calories - a.calories);

    setFilteredMeals(m);
    setTotalCount(m.length); // update total count for pagination
    setPage(1); // reset page on filter change
  }, [filters, allMeals]);

  // 3️⃣ Get meals for current page
  useEffect(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setMeals(filteredMeals.slice(start, end));
  }, [page, filteredMeals, pageSize]);

  const removeMeal = async (id) => {
    await deleteMeal(id);
    setAllMeals((prev) => prev.filter((m) => m.id !== id));
    setFilteredMeals((prev) => prev.filter((m) => m.id !== id));
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  return { meals, loading, removeMeal, page, setPage, totalCount, filters, setFilters };
}
