import { motion as Motion } from "framer-motion";

import f1 from "@/assets/images/landing/landing1.jpg";
import f2 from "@/assets/images/landing/landing2.jpeg";
import f3 from "@/assets/images/landing/landing3.webp";
import f4 from "@/assets/images/landing/landing4.webp";
import f5 from "@/assets/images/landing/landing5.avif";
import f6 from "@/assets/images/landing/landing6.jpg";

/* ---------------- Animations ---------------- */
const container = {
  hidden: { opacity: 1 },
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Features() {
  const features = [
    {
      image: f1,
      title: "Log and organize food before it goes to waste.",
      link: "Track Your Leftovers",
    },
    {
      image: f2,
      title: "Get smart reuse tips and leftover-based recipes.",
      link: "Reuse & Recipe Ideas",
    },
    {
      image: f3,
      title: "AI suggests the best way to use each item.",
      link: "AI Reuse Recommendations",
    },
    {
      image: f4,
      title: "Plan meals smarter with what you already have.",
      link: "Find Meal plans",
    },
    {
      image: f5,
      title: "Detect spoilage early and save food in time.",
      link: "Upload photo now",
    },
    {
      image: f6,
      title: "Buy surplus food from your local community.",
      link: "View marketplace",
    },
  ];

  return (
    <Motion.section
      id="offers"
      className="py-8 text-center max-w-[95vw] mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.05, // 🔥 VERY IMPORTANT for mobile
        margin: "-80px", // 🔥 triggers earlier
      }}
    >
      <Motion.p className="text-green-600 font-semibold" variants={fadeUp}>
        OUR FEATURES
      </Motion.p>

      <Motion.h2 className="text-3xl font-bold mb-10" variants={fadeUp}>
        What we offer to our users.
      </Motion.h2>

      <Motion.div
        className="grid md:grid-cols-3 gap-12 px-6"
        variants={container}
      >
        {features.map((feature, i) => (
          <Motion.div
            key={i}
            className="relative rounded-xl overflow-hidden"
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.25 }}
          >
            <img
              src={feature.image}
              alt={feature.title}
              className="w-full h-94 object-cover"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-6">
              <p className="font-semibold text-gray-800 text-md mb-3">
                {feature.title}
              </p>
              <a
                href="#"
                className="text-green-500 font-medium text-sm hover:text-green-800 inline-flex items-center"
              >
                {feature.link} →
              </a>
            </div>
          </Motion.div>
        ))}
      </Motion.div>
    </Motion.section>
  );
}
