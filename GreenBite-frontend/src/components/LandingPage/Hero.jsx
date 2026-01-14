import { motion as Motion } from "framer-motion";
import { Button } from "flowbite-react";
import hero from "@/assets/images/landing/landinghero.png";

/* ---------------- Animations ---------------- */
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function Hero() {
  return (
    <Motion.section
      className="grid md:grid-cols-2 gap-6 md:gap-10 items-center px-4 md:px-6 py-8 md:py-12 max-w-[90vw] mx-auto"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Text Content */}
      <Motion.div className="order-2 md:order-1" variants={container}>
        <Motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4"
          variants={fadeUp}
        >
          Reduce Food Waste and{" "}
          <span className="text-[#4a8251]">Save Money</span>
        </Motion.h1>

        <Motion.p
          className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg"
          variants={fadeUp}
        >
          We want to tackle food waste by recommending recipes based on leftover
          ingredients in the fridge at home.
        </Motion.p>

        <Motion.div variants={fadeUp}>
          <Button
            color="gray"
            className="!bg-[#7eb685] !text-white px-8 py-6 rounded-full hover:!bg-[#6da574] transition-colors cursor-pointer"
            onClick={() => (window.location.href = "/register")}
          >
            Get started
          </Button>
        </Motion.div>
      </Motion.div>

      {/* Image */}
      <Motion.div
        className="order-1 md:order-2 flex justify-center md:justify-end"
        variants={fadeInScale}
      >
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
          <div className="absolute inset-0 bg-[#7eb685] rounded-full"></div>
          <img
            src={hero}
            alt="Woman with fruits"
            className="relative w-full h-full object-cover rounded-full"
          />
        </div>
      </Motion.div>
    </Motion.section>
  );
}
