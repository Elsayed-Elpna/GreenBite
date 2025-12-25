import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "@/components/LandingPage/Footer";

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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            // Always show success (security best practice)
            setSuccess(true);
        } catch (error) {
            console.error("Reset email error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white px-5">
                {/* Logo */}
                <div className="flex justify-center lg:justify-start px-6 lg:px-12 pt-6">
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
                    {/* Forgot Password Form */}
                    <div className="w-full lg:w-7/12 flex items-center justify-center px-6 lg:px-6">
                        <div className="w-full max-w-xl lg:max-w-3xl">
                            {/* Back to login */}
                            <Link
                                to="/login"
                                className="text-sm text-gray-500 hover:text-green-600 inline-flex items-center mb-6"
                            >
                                ← Back to login
                            </Link>

                            {/* Form Header */}
                            <div className="mb-6 lg:mb-8">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    Forgot your password?
                                </h2>
                                <p className="text-gray-600 text-sm lg:text-base">
                                    Don't worry, it happens to all of us. Enter your email below to
                                    recover your password.
                                </p>
                            </div>

                            {/* Form */}
                            {!success ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="email"
                                            className="text-sm lg:text-base mb-2 block"
                                            color="black"
                                        >
                                            Email
                                        </Label>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            placeholder="john.doe@gmail.com"
                                            required
                                            sizing="md"
                                            color="white"
                                            className="w-full text-sm lg:text-base lg:h-12"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer"
                                        color="green"
                                        outline
                                    >
                                        {loading ? "Sending..." : "Submit"}
                                    </Button>
                                </form>
                            ) : (
                                <p className="text-green-600 text-sm">
                                    If an account exists, a password reset link has been sent.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Illustration - Right Side */}
                    <div className="w-full lg:w-5/12 flex items-center justify-center px-6 lg:px-6 py-3">
                        <div className="w-full lg:max-w-[44vw] max-w-[620px] h-[320px] lg:h-[43vw]">
                            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center p-8 lg:p-12">
                                <img
                                    src="/images/forgot-password.svg"
                                    alt="Forgot password illustration"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <Footer />
            </div>
        </div>
    );

}
