import { useState } from "react";
import { Button, Checkbox } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FloatingInput from "@/components/ui/FloatingInput";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
  const NAME_REGEX = /^[A-Za-z]+$/;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "firstName":
        if (!value.trim()) error = "First name is required";
        else if (!NAME_REGEX.test(value))
          error = "First name must contain letters only";
        break;

      case "lastName":
        if (!value.trim()) error = "Last name is required";
        else if (!NAME_REGEX.test(value))
          error = "Last name must contain letters only";
        break;

      case "username":
        if (!value) error = "Username is required";
        else if (!USERNAME_REGEX.test(value))
          error =
            "Username must contain only letters, numbers, and underscores (3–30 chars)";
        break;

      case "email":
        if (!value) error = "Email is required";
        else if (!EMAIL_REGEX.test(value)) error = "Invalid email format";
        break;

      case "password":
        if (value.length < 8)
          error = "Password must be at least 8 characters long";
        else if (!SPECIAL_CHAR_REGEX.test(value))
          error = "Password must contain a special character";
        else if (!/[A-Z]/.test(value))
          error = "Password must contain an uppercase letter";
        else if (!/[0-9]/.test(value))
          error = "Password must contain a digit";
        else if (
          formData.username &&
          value.toLowerCase().includes(formData.username.toLowerCase())
        )
          error = "Password must not contain the username";
        break;

      case "confirmPassword":
        if (value !== formData.password)
          error = "Passwords do not match";
        break;

      case "terms":
        if (!value) error = "You must agree to the terms";
        break;

      default:
        break;
    }

    return error;
  };

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    const errorMessage = validateField(name, fieldValue);
    setErrors((prev) => ({ ...prev, [name]: errorMessage }));

    if (name === "password" && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          fieldValue !== formData.confirmPassword
            ? "Passwords do not match"
            : "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      await axios.post("http://localhost:8000/auth/users/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        re_password: formData.confirmPassword,
      });

      localStorage.setItem("registeredEmail", formData.email);
      navigate("/verify");
    } catch (error) {
      if (error.response?.data) setErrors(error.response.data);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl lg:max-w-3xl">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Sign up
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Let's get you all set up so you can access your personal account.
        </p>
      </div>

      <div className="space-y-4">
        {/* Names */}
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="firstName"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            error={errors.firstName}
            onChange={handleChange}
          />
          <FloatingInput
            id="lastName"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            error={errors.lastName}
            onChange={handleChange}
          />
        </div>

        {/* Email & Username */}
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            error={errors.email}
            onChange={handleChange}
          />
          <FloatingInput
            id="username"
            name="username"
            label="Username"
            value={formData.username}
            error={errors.username}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FloatingInput
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            error={errors.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <FloatingInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
          </button>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            color="green"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the{" "}
            <span className="text-red-500 hover:underline cursor-pointer">
              Terms
            </span>{" "}
            and{" "}
            <span className="text-red-500 hover:underline cursor-pointer">
              Privacy Policy
            </span>
          </label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs">{errors.terms}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          color="green"
          outline
          className="w-full h-12 font-semibold"
        >
          Create account
        </Button>

        <p className="text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </form>
  );
}