import { FaCheckCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "@/components/LandingPage/Footer";

export default function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Logo */}
      <div className="flex-shrink-0">
        <div className="flex justify-center lg:justify-end pt-6 px-6">
          <div className="h-14 flex items-center px-0 lg: px-5">
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
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="w-full text-center px-6 lg:px-0">
            {/* Icon */}
            <FaCheckCircle
              className="text-[#7eb685] mx-auto mb-6 lg:mb-8"
              size={74}
            />

            <h2 className="text-2xl lg:text-4xl font-semibold text-gray-800 mb-4">
              Password reset successfully
            </h2>

            <p className="text-gray-600 text-base lg:text-lg mb-8 max-w-2xl mx-auto">
              You can now log in using your new password.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* Login */}
            <button
              onClick={() => navigate("/login")}
              className="bg-[#7eb685] text-white font-semibold px-8 py-3 rounded-md border-2 border-[#7eb685]
              transition-colors duration-300 hover:bg-white hover:text-[#7eb685] cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Fixed height */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
}




// <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 lg:px-0">
//   <div className="flex flex-col items-center justify-center h-full px-4">
//     <div className="w-full text-center px-6 lg:px-0">

//       {/* Icon */}
//       <FaCheckCircle
//         className="text-[#7eb685] mx-auto mb-6 lg:mb-8"
//         size={64}
//       />
//       <h2 className="text-2xl lg:text-4xl font-semibold text-gray-800 mb-4">
//         Password reset successfully
//       </h2>

//       <p className="text-gray-600 text-base lg:text-lg mb-8 max-w-2xl mx-auto">
//         You can now log in using your new password.
//       </p>
//     </div>

//     <div className="flex flex-col items-center gap-4">

//       {/* Login */}
//       <button
//         onClick={() => (window.location.href = "/login")}
//         className="bg-[#7eb685] text-white font-semibold px-8 py-3 rounded-md border-2 border-[#7eb685]
//         transition-colors duration-300 hover:bg-white hover:text-[#7eb685] cursor-pointer"
//       >
//         Go to Login
//       </button>

//     </div>
//   </div>
// </div>

