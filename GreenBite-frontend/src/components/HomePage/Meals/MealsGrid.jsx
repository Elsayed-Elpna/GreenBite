import MealCard from "./MealCard";
import useDialog from "@/hooks/useDialog";
import useSaveMeal from "@/hooks/useSaveMeals";
import MealDetailsDialog from "@/components/HomePage/Dialogs/MealDetailsDialog";

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
            onView={() => mealDialog.open(meal.id)}
          />
        ))}
      </div>

      <MealDetailsDialog dialog={mealDialog} />
    </>
  );
}