import { useState } from "react";

export default function RecipeHeroSection({ onGenerate }) {
  const [ingredients, setIngredients] = useState("");

  return (
    <section className="max-w-3xl mx-auto px-4 mt-18 text-center">
      <h1 className="text-[#7eb685] text-2xl lg:text-4xl font-bold mb-6">
        Let’s Make Something Delicious!
      </h1>

      <p className="text-md lg:text-lg text-gray-600 mb-8">
        Enter your ingredients and let AI suggest delicious, beginner-friendly recipes just for you.
      </p>

      <textarea
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="Enter your ingredients (eg., chicken, pasta, tomato)"
        rows={2}
        className="w-full border-2 border-gray-300 rounded-lg p-4 text-md lg:text-lg
                   focus:outline-none focus:border-[#7ec695] transition-colors mb-6"
      />

      <button
        onClick={() => onGenerate?.(ingredients)}
        disabled={!ingredients.trim()}
        className="w-full bg-[#7eb685] text-white px-8 py-3 rounded-lg text-lg font-medium
                   hover:bg-[#7ec690] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Recipes
      </button>
    </section>
  );
}


