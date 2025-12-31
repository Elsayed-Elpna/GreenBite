import MealCard from "./MealCard";
import useDialog from "@/hooks/useDialog";
import MealDetailsDialog from "@/components/HomePage/Dialogs/MealDetailsDialog";
import { fetchMealDetails } from "@/api/meals.api";

export default function MealsGrid({ meals, onDelete }) {
  const mealDialog = useDialog();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={() => onDelete(meal.id)}
            onView={() => mealDialog.open(() => fetchMealDetails(meal.id))}
          />
        ))}
      </div>

      <MealDetailsDialog dialog={mealDialog} />
    </>
  );
}
