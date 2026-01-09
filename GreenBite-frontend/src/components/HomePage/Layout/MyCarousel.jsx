import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import { useEffect, useMemo, useState } from "react";
import { CUISINE_COUNTRY_MAP, getCuisineVisuals } from "@/utils/constants";
import { getRandomRecipe } from "@/api/mealdb.api";
import MenuCard from "@/components/HomePage/RightMenu/RecommendedMenu/MenuCard.jsx";
import MealDbDetailsDialog from "@/components/HomePage/Dialogs/MealDbDetailsDialog.jsx";

import "swiper/css";

const SLIDES_COUNT = 6;

const MyCarousel = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeMealdbId, setActiveMealdbId] = useState(null);

  const openDetails = (mealdbId) => {
    setActiveMealdbId(mealdbId);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setActiveMealdbId(null);
  };



  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError("");

      // NOTE: adapt this to your real API return shape.
      // - If getRandomRecipe() returns ONE recipe object, we’ll duplicate it to fill the slider.
      // - If it returns an array, we’ll use it.
      const data = await getRandomRecipe();

      const list = Array.isArray(data) ? data : data ? [data] : [];

      const filled = list.length
        ? Array.from({ length: SLIDES_COUNT }, (_, i) => list[i % list.length])
        : [];

      setRecipes(filled);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to load recommended menu";
      setError(msg);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // build slides array so we always render SLIDES_COUNT items (skeletons if needed)
  const slides = useMemo(() => {
    if (!loading && recipes.length > 0) return recipes;
    return Array.from({ length: SLIDES_COUNT }, () => null);
  }, [loading, recipes]);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        <Swiper
          direction="vertical"
          modules={[Autoplay, Mousewheel]}
          slidesPerView={5}
          spaceBetween={14}
          mousewheel
          loop={recipes.length > 0}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          speed={700}
          className="h-full"
        >
          {slides.map((recipe, idx) => {
            // If recipe exists, compute visuals from constants.js (normalized inside getCuisineVisuals)
            const cuisine = recipe?.cuisine ?? "";

            // Option A (recommended): use the resolver you already have
            const cuisineVisuals = recipe ? getCuisineVisuals(cuisine) : null;

            // Option B (direct map usage) — in case you want it explicitly:
            // const key = (cuisine || "").trim().toLowerCase();
            // const countryCode = CUISINE_COUNTRY_MAP[key];
            // const cuisineVisuals = recipe ? { ...getCuisineVisuals(cuisine), countryCode } : null;

            const key = recipe?.id ?? recipe?.mealdb_id ?? `${idx}`;

            return (
              <SwiperSlide key={key}>
                <MenuCard
                  recipe={recipe}
                  loading={loading && !recipe}
                  error={!loading && !recipe ? error : ""}
                  onRefresh={fetchRecipes}
                  onAdd={() => {}}
                  onOpenDetails={() => openDetails(recipe.mealdb_id)}
                  cuisineVisuals={cuisineVisuals}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Optional: if you want a small error hint below the carousel */}
      {!loading && error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
      <MealDbDetailsDialog
        isOpen={detailsOpen}
        onClose={closeDetails}
        mealdbId={activeMealdbId}
      />
    </div>
  );
};

export default MyCarousel;