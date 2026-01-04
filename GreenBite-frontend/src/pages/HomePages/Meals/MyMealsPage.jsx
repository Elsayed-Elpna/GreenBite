import useMeals from "@/hooks/useMeals";
import MealsGrid from "@/components/HomePage/Meals/MealsGrid";
import EmptyMealsState from "@/components/HomePage/Meals/EmptyMealsState";
import MealFilters from "@/components/HomePage/Meals/MealFilters";
import WasteLogPagination from "@/components/HomePage/WasteLog/WasteLogPagination";

export default function MyMealsPage() {
  const { meals, loading, removeMeal, page, setPage, totalCount, filters, setFilters } = useMeals();
  const filterKeysToCheck = ["search", "mealTime", "has_leftovers", "calories_min", "calories_max"];
  const isFiltered = filterKeysToCheck.some((key) => filters[key] !== "" && filters[key] !== null && filters[key] !== undefined);


  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <MealFilters filters={filters} setFilters={setFilters} setPage={setPage} />

      {/* CONTENT AREA */}
      {meals.length ? (
        <MealsGrid meals={meals} onDelete={removeMeal} />
      ) : (
        <EmptyMealsState isFiltered={isFiltered} />
      )}

      {/* Pagination */}
      <WasteLogPagination page={page} setPage={setPage} count={totalCount} />
    </div>
  );
}
