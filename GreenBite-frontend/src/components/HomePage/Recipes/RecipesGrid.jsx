// src/components/recipes/RecipesGrid.jsx
import RecipeCard from "./RecipeCard";
import EmptyState from "./EmptyState";

export default function RecipesGrid({ recipes, onView }) {
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
