import { Link } from "react-router-dom";
import sellerImage from "@/assets/images/landing/selling.png"; // your image path

export default function CTA() {
  return (
    <section className="my-16">
      <div className="max-w-[95vw] mx-auto px-6">
        <div className="bg-[#DEEDE0] rounded-xl overflow-hidden flex flex-col md:flex-row items-center md:items-stretch shadow-lg">
          
          {/* Image on the left (or top on mobile) */}
          <div className="md:w-1/2 h-64 md:h-auto">
            <img
              src={sellerImage}
              alt="Become a seller"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text + CTA */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">
              Become a Seller in Our Marketplace
            </h2>
            <p className="text-gray-700 mb-6">
              Join our community of sellers and help reduce food waste while earning! Showcase your surplus food items to a local audience and grow your business sustainably.
            </p>
            <Link
              to="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors font-semibold"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
