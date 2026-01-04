import { useState } from "react";
import { useMeals } from "@/hooks/useMeals";
import MealsGrid from "@/components/HomePage/Meals/MealsGrid";
import EmptyMealsState from "@/components/HomePage/Meals/EmptyMealsState";
import MealFilters from "@/components/HomePage/Meals/MealFilters";
import WasteLogPagination from "@/components/HomePage/WasteLog/WasteLogPagination";

export default function MyMealsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    mealTime: "",
    has_leftovers: "",
    calories_min: "",
    calories_max: "",
    ordering: "-created_at",
  });

  const { meals, totalCount, loading, deleteMeal } = useMeals({ 
    page, 
    pageSize: 10, 
    filters 
  });

  const filterKeysToCheck = ["search", "mealTime", "has_leftovers", "calories_min", "calories_max"];
  const isFiltered = filterKeysToCheck.some(
    (key) => filters[key] !== "" && filters[key] !== null && filters[key] !== undefined
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      <MealFilters filters={filters} setFilters={setFilters} setPage={setPage} />

      {meals.length > 0 ? (
        <MealsGrid meals={meals} onDelete={deleteMeal} />
      ) : (
        <EmptyMealsState isFiltered={isFiltered} />
      )}

      <WasteLogPagination page={page} setPage={setPage} count={totalCount} />
    </div>
  );
}