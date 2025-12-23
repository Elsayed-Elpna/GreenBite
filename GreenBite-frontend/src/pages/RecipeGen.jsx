import { useState } from "react";

export default function AiRecipes() {
  const [loading, setLoading] = useState(false);

  const generateRecipes = async () => {
    setLoading(true);

    // later → call backend AI endpoint
    setTimeout(() => {
      setLoading(false);
      alert("AI recipes generated (placeholder)");
    }, 1000);
  };

  return (
    <div className="page">
      <h2>AI Generated Recipes</h2>

      <p>
        Generate recipes based on your available ingredients.
      </p>

      <button
        onClick={generateRecipes}
        disabled={loading}
        className="primary-btn"
      >
        {loading ? "Generating..." : "Generate Recipes"}
      </button>
    </div>
  );
}
