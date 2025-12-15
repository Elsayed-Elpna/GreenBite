import { Button } from "flowbite-react";
import hero from "@/assets/images/landing/landinghero.png";

export default function Hero() {
  return (
    <section className="grid md:grid-cols-2 gap-6 md:gap-10 items-center px-4 md:px-6 py-8 md:py-12 max-w-[90vw] mx-auto">


      <div className="order-2 md:order-1">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
          Reduce Food Waste and{" "}
          <span className="text-[#4a8251]">Save Money</span>
        </h1>
        <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
          We want to tackle food waste by recommending recipes based on leftover
          ingredients in the fridge at home.
        </p>
        <Button
          color="gray"
          className="!bg-[#7eb685] !text-white px-8 py-6 rounded-full hover:!bg-[#6da574] transition-colors cursor-pointer"
          onClick={() => window.location.href = '/register'}
        >
          Get started
        </Button>
      </div>

      <div className="order-1 md:order-2 flex justify-center md:justify-end">
        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
          <div className="absolute inset-0 bg-[#7eb685] rounded-full"></div>
          <img
            src={hero}
            alt="Woman with fruits"
            className="relative w-full h-full object-cover rounded-full"
          />
        </div>
      </div>

    </section>
  );
}