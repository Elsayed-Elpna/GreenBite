import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import { useEffect, useState } from "react";
import { getRandomRecipe } from "@/api/mealdb.api";
import MenuCard from "../RightMenu/RecommendedMenu/MenuCard";

import "swiper/css";
const SLIDES_COUNT = 6;
const MyCarousel = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getRandomRecipe(SLIDES_COUNT);

      const list = Array.isArray(data) ? data:data ? [data] : [];

      const filled = list.length ? Array.from({length: SLIDES_COUNT}, (_,i) => list[i % list.length]) : [];
      setRecipes(filled)

    } catch(e){
      const details = 
      e?.response?.data?.detail ||
      e?.response?.data?.message ||
      e?.message ||
      "unknown error";
      setError(`Failed to load recommended recipes: ${details}`);
    } finally{
      setLoading(false);
  }
};
    useEffect(() => {
      fetchRecipes();
    }, []);
  return (
    <div className="h-full flex flex-col min-h-0">
      <h3 className="mb-3 font-semibold text-center  text-sm">
        Recommended Recipes
      </h3>

      <div className="flex-1 min-h-0">
        <Swiper
          direction="vertical"
          modules={[Autoplay, Mousewheel]}
          slidesPerView={5}
          spaceBetween={14}
          mousewheel
          loop = {recipes.length > 0}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          speed={700}
          className="h-full"
        >
          {recipes.length > 0?
          recipes.map((r, idx) => (
          <SwiperSlide key = {r.id ?? r.mealdb_id ??  idx}>
            <MenuCard recipe={r} loading={false} error = {null} onRefresh={fetchRecipes} />
          </SwiperSlide>))
          : Array.from ({length: SLIDES_COUNT}).map((_, idx) => (
            <SwiperSlide key = {`skeleton-${idx}`}>
              <MenuCard recipe = {null} loading = {loading} error = {error} onRefresh={fetchRecipes}/>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default MyCarousel;
