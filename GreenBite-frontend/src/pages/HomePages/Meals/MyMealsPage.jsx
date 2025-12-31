import useMeals from "@/hooks/useMeals";
import MealsGrid from "@/components/HomePage/Meals/MealsGrid";
import EmptyMealsState from "@/components/HomePage/Meals/EmptyMealsState";


export default function MyMealsPage() {
  const { meals, loading, removeMeal } = useMeals();

  if (loading) return <p>Loading...</p>;
  if (!meals.length) return <EmptyMealsState />;

  return <MealsGrid meals={meals} onDelete={removeMeal} />;
}
