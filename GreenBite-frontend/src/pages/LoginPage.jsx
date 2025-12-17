import React from "react";
import { Link } from "react-router-dom";
import ImageCarousel from "@/components/RegisterPage/ImageCarousel";
import LoginForm from "@/components/LoginPage/LoginForm";
import slide1 from "@/assets/images/Loginregister/slide1.avif";
import slide2 from "@/assets/images/Loginregister/slide2.png";
import slide3 from "@/assets/images/Loginregister/slide3.png";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "../components/LandingPage/Footer";

export default function LoginPage() {
  const slides = [
    {
      image: slide1,
      title: "What's for dinner today?",
      subtitle: "Discover smart recipes from your leftovers.",
    },
    {
      image: slide2,
      title: "Love food, fight waste",
      subtitle: "Discover easy solutions for food waste",
    },
    {
      image: slide3,
      title: "Spin the wheel to get your meal!",
      subtitle: "Discover a random meal using what you already have.",
    },
  ];
  return (
    <div>
      <div className="bg-white px-5">
        {/* Logo */}
        <div className="flex justify-center lg:justify-end px-6 lg:px-12 pt-6">
          <Link to="/">
            <img
              src={logo}
              alt="GreenBite Logo"
              className="h-14 object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch lg:min-h-[calc(100vh-80px)]">
          {/* Image Carousel */}
          <div className="w-full lg:w-5/12 flex items-center justify-center px-6 lg:px-6 py-3">
            <div className="w-full lg:max-w-[44vw] max-w-[620px] h-[320px] lg:h-[43vw]">
              <ImageCarousel slides={slides} />
            </div>
          </div>

          {/* Register Form */}
          <div className="w-full lg:w-7/12 flex items-center justify-center px-6 lg:px-6">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Footer />
      </div>
    </div>
  );
}
