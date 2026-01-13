import AppNavbar from "../components/LandingPage/Navbar";
import Hero from "../components/LandingPage/Hero";
import Vision from "../components/LandingPage/Vision";
import Features from "../components/LandingPage/Features";
import CTA from "../components/LandingPage/CTA";
import Footer from "../components/LandingPage/Footer";

export default function LandingPage() {
  return (
    
    <div className="bg-gray-50">
      <div className="px-5">
        <AppNavbar />
        <Hero />
        <Vision />
        <Features />
        <CTA />
      </div>

      <div>
        <Footer />
      </div>
      
    </div>
    
  );
}