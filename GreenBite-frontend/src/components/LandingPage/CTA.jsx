import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
export default function CTA() {
  return (
    <section className="my-16">
      <div className="max-w-[95vw] mx-auto px-6">
        <div className="bg-[#DEEDE0] rounded-xl p-8 flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">
            Are you ready to fight against food waste?
          </h2>

          <Link
            to="/register"
            className="!bg-[#7eb685] !text-white px-8 py-3 rounded-full hover:!bg-[#6da574] transition-colors cursor-pointer"
          >
            Join Now
          </Link>
        </div>
      </div>
    </section>
  );
}
