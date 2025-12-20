import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";

export default function RegistrationSuccess() {
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 Resend activation email
  const handleResendActivation = async () => {
    setLoading(true);
    try {
      const email = localStorage.getItem("registeredEmail");

      await axios.post("http://localhost:8000/auth/users/resend_activation/", {
        email,
      });

      setSuccessMessage(
        "Activation email sent successfully. Please check your inbox."
      );

      // Auto hide after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-full text-center px-6 lg:px-0">

        {/* Icon */}
        <FaCheckCircle
          className="text-[#7eb685] mx-auto mb-6 lg:mb-8"
          size={64}
        />

        {/* Heading */}
        <h1 className="text-2xl lg:text-4xl font-semibold text-gray-800 mb-4">
          Registration Successful!
        </h1>

        {/* Message */}
        <p className="text-gray-600 text-base lg:text-lg mb-8 max-w-2xl mx-auto">
          Thank you for registering. Please check your email inbox and click the
          activation link to activate your account.
        </p>

        {/* ✅ Success Alert */}
        {successMessage && (
          <div className="mb-6 mx-auto max-w-md rounded-md border border-green-300 bg-green-50 px-4 py-3 text-green-700 font-medium">
            {successMessage}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col items-center gap-4">

          {/* Login */}
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-[#7eb685] text-white font-semibold px-8 py-3 rounded-md border-2 border-[#7eb685]
            transition-colors duration-300 hover:bg-white hover:text-[#7eb685]"
          >
            Go to Login
          </button>

          <p className="text-gray-800 font-medium py-2">
            Didn’t receive the activation email?{" "}
            <button
              onClick={handleResendActivation}
              disabled={loading}
              className="text-red-600 font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              Resend
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
