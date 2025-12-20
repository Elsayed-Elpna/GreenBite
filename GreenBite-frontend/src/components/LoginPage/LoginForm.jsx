import { useState, useContext } from "react";
import { Label, TextInput, Button } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const passwordRegex = /^[^\s]{1,128}$/;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFromData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState();
  const [fieldErros, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let errors = {
      email: "",
      password: "",
    };
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!passwordRegex.test(formData.password)) {
      errors.password = "Password cannot be empty or contain spaces";
    }
    setFieldErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;
    try {
      await login(formData);
      console.log("login succse");
      navigate("/home");
    } catch (error) {
      if (error.response?.data?.non_field_errors) {
      alert("Account not activated. Please check your email.");
      } else {
        console.log(`login failed ${error}`);
        setFormError("Invalid email or password ");
      }
    }
  };

  return (
    <div className="w-full max-w-xl lg:max-w-3xl">
      {/* Form Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Login
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Login to access your GreenBite account.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <Label
            htmlFor="email"
            color="black"
            className="text-sm lg:text-base mb-2 block"
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
            onChange={(e) => {
              const value = e.target.value.replace(/[\\<>|{}[\]]/g, "").trim();
              setFromData({ ...formData, email: value });
              setFieldErrors({ ...fieldErros, email: "" });
            }}
          />
          {fieldErros.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErros.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label
            htmlFor="password"
            color="black"
            className="text-sm lg:text-base mb-2 block"
          >
            Password
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
              onChange={(e) => {
                const value = e.target.value
                  .replace(/[\\<>|{}[\]]/g, "")
                  .trim();
                setFromData({ ...formData, password: value });
                setFieldErrors({ ...fieldErros, password: "" });
              }}
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
        {fieldErros.password && (
          <p className="text-red-500 text-sm mt-1">{fieldErros.password}</p>
        )}
        {/* Forgot Password */}
        <div className="pt-1 lg:pt-2">
          <p className="text-red-500">{formError}</p>
          <a href="#" className="text-red-500 hover:underline">
            Forgot password
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer"
          color="green"
          outline
          disabled={loading}
        >
          Login
        </Button>

        {/* Signup Link */}
        <p className="text-center text-sm lg:text-base text-gray-700 pt-1">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-green-500 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
