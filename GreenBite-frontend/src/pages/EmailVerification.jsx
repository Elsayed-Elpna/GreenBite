import React from "react";
import { Link } from "react-router-dom";
import RegistrationSuccess from "@/components/RegisterPage/ActivationRequest";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "../components/LandingPage/Footer";

export default function EmailVerification() {
    return (
        <div className="flex flex-col h-screen bg-white overflow-hidden">
            {/* Logo - Fixed height */}
            <div className="flex-shrink-0">
                <div className="flex justify-center lg:justify-end pt-6 px-5">
                    <div className="h-14 flex items-center">
                        <Link to="/">
                            <img
                                src={logo}
                                alt="GreenBite Logo"
                                className="h-14 object-contain cursor-pointer"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content - Takes remaining space */}
            <div className="flex-grow flex items-center justify-center">
                <RegistrationSuccess />
            </div>

            {/* Footer - Fixed height */}
            <div className="flex-shrink-0">
                <Footer />
            </div>
        </div>
    );
}
