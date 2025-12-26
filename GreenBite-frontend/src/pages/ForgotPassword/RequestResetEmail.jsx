import { useState } from "react";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logos/Verticallogo.png";
import forgotpass from "@/assets/images/Forgot-Password.png";
import Footer from "@/components/LandingPage/Footer";
import FloatingInput from "@/components/ui/FloatingInput";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("http://localhost:8000/auth/users/reset_password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSuccess(true); // always true for security
    } catch (error) {
      console.error("Reset email error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 w-full">
        <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col px-6 sm:px-10 lg:px-10">
          {/* Logo */}
          <div className="pt-6">
            <Link to="/">
              <img src={logo} alt="GreenBite Logo" className="h-14 object-contain cursor-pointer" />
            </Link>
          </div>

          {/* Form */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
              <Link
                to="/login"
                className="text-sm text-gray-500 hover:text-green-600 inline-flex items-center mb-6"
              >
                ← Back to login
              </Link>

              {/* Header */}
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold">
                Forgot your password?
              </h1>
              <p className="text-gray-600 mb-8 mt-4">
                Enter your email and we’ll send you a link to reset your password.
              </p>

              {/* Form */}
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FloatingInput
                    id="email"
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-semibold cursor-pointer"
                    color="green"
                    outline
                  >
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                </form>
              ) : (
                <p className="text-green-600 text-sm">
                  If an account exists, a password reset link has been sent.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — IMAGE */}
        <div className="hidden lg:flex w-[45%] items-center justify-center">
          <div className="w-[90%] h-[90%] rounded-3xl overflow-hidden shadow-xl bg-white">
            <img
              src={forgotpass}
              alt="Forgot password"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
