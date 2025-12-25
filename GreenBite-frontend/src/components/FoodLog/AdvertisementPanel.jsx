// import { useState, useEffect } from "react";
// import slide1 from "@/assets/images/advertisement/adv1.jpg";
// import slide2 from "@/assets/images/advertisement/adv2.png";

// export default function AdvertisementPanel() {
//   const slides = [
//     {
//       image: slide1,
//       title: "Food Storage Solutions",
//       subtitle: "Keep Food Fresh, Waste Less.",
//     },
//     {
//       image: slide2,
//       title: "Eco-friendly Packaging",
//       subtitle: "Sustainable solutions for your kitchen.",
//     },
//     // Add more slides here
//   ];

//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000); // change every 5 seconds
//     return () => clearInterval(timer);
//   }, [slides.length]);

//   return (
//     <div className="w-full max-w-[80vw] mx-auto mt-6 relative">
//       <div className="h-[25vw] sm:h-64 xl:h-[25vw] rounded-xl overflow-hidden relative">
//         {slides.map((slide, index) => (
//           <div
//             key={index}
//             className={`absolute inset-0 transition-opacity duration-1000 ${
//               index === currentSlide ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             <img
//               src={slide.image}
//               alt={slide.title}
//               className="w-full h-full object-cover"
//             />
//             {/* Gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
//             {/* Text overlay */}
//             <div className="absolute bottom-20 left-10 right-10 text-white">
//               <h2 className="text-4xl lg:text-5xl font-bold mb-3 leading-tight">
//                 {slide.title}
//               </h2>
//               <p className="text-base lg:text-lg opacity-95">{slide.subtitle}</p>
//             </div>
//           </div>
//         ))}

//         {/* Carousel Indicators */}
//         <div className="absolute bottom-10 left-10 flex gap-2 z-10">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               className={`h-2 rounded-full transition-all ${
//                 index === currentSlide ? "w-8 bg-[#7eb685]" : "w-2 bg-white/70"
//               }`}
//               aria-label={`Go to slide ${index + 1}`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import slide1 from "@/assets/images/advertisement/adv1.jpg";
import slide2 from "@/assets/images/advertisement/adv2.png";

export default function AdvertisementPanel() {
  const slides = [
    {
      image: slide1,
      title: "Food Storage Solutions",
      subtitle: "Keep Food Fresh, Waste Less.",
    },
    {
      image: slide2,
      title: "Eco-friendly Packaging",
      subtitle: "Sustainable solutions for your kitchen.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full max-w-[80vw] mx-auto mt-6 relative lg:px-8 sm:px-2">
      <div className="h-[30vw] sm:h-[30vw] xl:h-[20vw] rounded-xl overflow-hidden relative">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            {/* Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-[0.90]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.20)_50%,rgba(0,0,0,0.60)_100%)]" />


            {/* Text Overlay */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 lg:top-12 lg:left-12 max-w-[90%] sm:max-w-lg text-white z-20">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 leading-tight 
                 drop-shadow-[4px_4px_6px_rgba(0,0,0,0.6)]">
                {slide.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl opacity-95 
                drop-shadow-[4px_4px_6px_rgba(0,0,0,0.55)]">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-[#7eb685]" : "w-2 bg-white/70"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
