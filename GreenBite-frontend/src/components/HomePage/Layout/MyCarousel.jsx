import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import MenuCard from "../RightMenu/RecommendedMenu/MenuCard";

import "swiper/css";

const MyCarousel = () => {
  return (
    <div className="h-full flex flex-col min-h-0">
      <h3 className="mb-3 font-semibold text-center  text-sm">
        Recommended Recipe
      </h3>

      <div className="flex-1 min-h-0">
        <Swiper
          direction="vertical"
          modules={[Autoplay, Mousewheel]}
          slidesPerView={5}
          spaceBetween={14}
          mousewheel
          loop
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            reverseDirection: true,
          }}
          speed={700}
          className="h-full"
        >
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
          <SwiperSlide>
            <MenuCard />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default MyCarousel;
