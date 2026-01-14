import { motion as Motion } from "framer-motion";

import p1 from "@/assets/images/landing/qualityrecipe.svg";
import p2 from "@/assets/images/landing/greenmarket.svg";
import p3 from "@/assets/images/landing/zerowaste.svg";

/* ---------------- Animations ---------------- */
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function Vision() {
  const visionItems = [
    {
      title: "Quality Recipes",
      image: p1,
      description:
        "Discover creative recipes to reuse leftovers and reduce waste.",
    },
    {
      title: "Green Marketplace",
      image: p2,
      description:
        "Buy and sell surplus food in your local community sustainably.",
    },
    {
      title: "Zero Food Waste",
      image: p3,
      description:
        "Take actionable steps to reduce food waste in everyday life.",
    },
  ];

  return (
    <Motion.section
      id="vision"
      className="py-16 bg-gray-50"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-[95vw] mx-auto px-6 text-center">
        <Motion.p
          className="text-green-600 font-semibold tracking-wide"
          variants={fadeUp}
        >
          OUR VISION
        </Motion.p>

        <Motion.h2
          className="text-3xl md:text-4xl font-bold mb-12 mt-2"
          variants={fadeUp}
        >
          We help thousands of people reduce food waste
        </Motion.h2>

        <Motion.div className="grid md:grid-cols-3 gap-8" variants={container}>
          {visionItems.map((item) => (
            <Motion.div
              key={item.title}
              variants={scaleIn}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow transform duration-300 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm md:text-base">
                {item.description}
              </p>
            </Motion.div>
          ))}
        </Motion.div>
      </div>
    </Motion.section>
  );
}
