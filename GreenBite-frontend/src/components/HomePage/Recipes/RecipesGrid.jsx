// src/components/recipes/RecipesGrid.jsx
import RecipeCard from "./RecipeCard";
import EmptyState from "./EmptyState";
import { PacmanLoader } from "react-spinners";

export default function RecipesGrid({ recipes, onView, loading }) {
  if (loading) {
    return (<PacmanLoader color="#7EB685" size={40} speedMultiplier={1} className="mt-26" />);
  }

  if (!recipes.length) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={index}
          recipe={recipe}
          onView={() => onView(index)}
        />
      ))}
    </div>
  );
}
