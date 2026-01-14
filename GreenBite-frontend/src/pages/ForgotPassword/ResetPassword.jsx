import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "@/assets/images/logos/Verticallogo.png";
import Footer from "@/components/LandingPage/Footer";
import FloatingInput from "@/components/ui/FloatingInput";
import ResetPass from "@/assets/images/reset-password.png";

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export default function SetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        password: "",
        confirmPassword: "",
        form: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "password":
                if (value.length < 8) error = "Password must be at least 8 characters long";
                else if (!SPECIAL_CHAR_REGEX.test(value))
                    error = "Password must contain at least one special character";
                else if (!/[A-Z]/.test(value))
                    error = "Password must contain at least one uppercase letter";
                else if (!/[0-9]/.test(value)) error = "Password must contain at least one digit";
                break;
            case "confirmPassword":
                if (value !== formData.password) error = "Passwords do not match";
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);

        if (name === "password" && formData.confirmPassword) {
            validateField("confirmPassword", formData.confirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const passwordValid = validateField("password", formData.password);
        const confirmValid = validateField("confirmPassword", formData.confirmPassword);

        if (!passwordValid || !confirmValid) return;

        try {
           const response = await fetch(
  `${import.meta.env.VITE_API_URL}/auth/users/reset_password_confirm/`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid,
      token,
      new_password: formData.password,
      re_new_password: formData.confirmPassword,
    }),
  }
);


            if (response.ok) navigate("/reset-success");
            else setErrors((prev) => ({ ...prev, form: "This reset link is invalid or expired." }));
        } catch {
            setErrors((prev) => ({ ...prev, form: "Something went wrong. Please try again." }));
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* MAIN CONTENT */}
            <div className="flex flex-1 w-full">
                {/* LEFT SIDE — FORM */}
                <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col px-6 sm:px-10 lg:px-10">
                    {/* Logo at the top */}
                    <div className="pt-5">
                        <Link to="/">
                            <img src={logo} alt="GreenBite Logo" className="h-14 object-contain cursor-pointer" />
                        </Link>
                    </div>

                    {/* Form container vertically centered */}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
                            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2">
                                Set a password
                            </h1>
                            <p className="text-gray-600 mb-8 mt-4">
                                Your previous password has been reset. Please set a new password for your account.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

                                {/* Password */}
                                <div className="relative">
                                    <FloatingInput
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        label="Create Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none cursor-pointer"
                                    >
                                        {showPassword ? <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" /> : <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <FloatingInput
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        label="Re-enter Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none cursor-pointer"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" /> : <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />}
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold cursor-pointer"
                                    color="green"
                                    outline
                                >
                                    Set password
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE — ILLUSTRATION */}
                <div className="hidden lg:flex w-[45%] items-center justify-center">
                    <div className="w-[90%] h-[90%] rounded-3xl overflow-hidden shadow-xl bg-white">
                        <img
                            src={ResetPass}
                            alt="Set password"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
