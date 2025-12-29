import RecipeHeroSection from "@/components/HomePage/Recipes/RecipeHeroSection";
import RecipesGrid from "@/components/HomePage/Recipes/RecipesGrid";
import RecipeDetailsDialog from "@/components/HomePage/Dialogs/RecipeDetailsDialog";
import useGenerateRecipes from "@/components/HomePage/Recipes/RecipeUtils/useGenerateRecipes";
import useDialog from "@/hooks/useDialog";

export default function GenerateRecipesPage() {
  const { recipes, loading, error, generate } = useGenerateRecipes();
  const dialog = useDialog(); // <--- handles all dialog state

  const handleView = (index) => {
    dialog.open(recipes, index); // pass recipes and the selected index
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-5 py-8 bg-white h-full">
      <RecipeHeroSection onGenerate={generate} />

      {loading && <p className="text-center mt-8">Generating recipes...</p>}
      {error && <p className="text-center text-red-500 mt-8">{error}</p>}

      <RecipesGrid recipes={recipes} onView={handleView} />

      <RecipeDetailsDialog dialog={dialog} />
    </div>
  );
}
