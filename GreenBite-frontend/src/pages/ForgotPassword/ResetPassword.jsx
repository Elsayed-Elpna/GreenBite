import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Label, TextInput } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "@/components/LandingPage/Footer";

export default function SetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8000/auth/users/reset_password_confirm/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid,
                        token,
                        new_password: password,
                    }),
                }
            );

            if (response.ok) {
                navigate("/reset-success");
            } else {
                setError("This reset link is invalid or expired.");
            }
        } catch (error) {
            setError("Something went wrong. Please try again.");
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
                    {/* Set Password Form */}
                    <div className="w-full lg:w-7/12 flex items-center justify-center px-6 lg:px-6">
                        <div className="w-full max-w-xl lg:max-w-3xl">
                            {/* Form Header */}
                            <div className="mb-6 lg:mb-8">
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    Set a password
                                </h2>
                                <p className="text-gray-600 text-sm lg:text-base">
                                    Your previous password has been reset. Please set a new password
                                    for your account.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && <p className="text-red-500 text-sm">{error}</p>}

                                {/* Create Password */}
                                <div>
                                    <Label
                                        htmlFor="password"
                                        color="black"
                                        className="text-sm lg:text-base mb-2 block"
                                    >
                                        Create Password
                                    </Label>
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••••••••••"
                                            required
                                            sizing="md"
                                            color="white"
                                            className="w-full text-sm lg:text-base lg:h-12"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" />
                                            ) : (
                                                <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Re-enter Password */}
                                <div>
                                    <Label
                                        htmlFor="confirmPassword"
                                        color="black"
                                        className="text-sm lg:text-base mb-2 block"
                                    >
                                        Re-enter Password
                                    </Label>
                                    <div className="relative">
                                        <TextInput
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••••••••••••••"
                                            required
                                            sizing="md"
                                            color="white"
                                            className="w-full text-sm lg:text-base lg:h-12"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" />
                                            ) : (
                                                <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer"
                                    color="green"
                                    outline
                                >
                                    Set password
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Illustration - Right Side */}
                    <div className="w-full lg:w-5/12 flex items-center justify-center px-6 lg:px-6 py-3">
                        <div className="w-full lg:max-w-[44vw] max-w-[620px] h-[320px] lg:h-[43vw]">
                            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center p-8 lg:p-12">
                                <img
                                    src="/images/set-password.svg"
                                    alt="Set password illustration"
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
