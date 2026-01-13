import { useState, useContext } from "react";
import { Button } from "flowbite-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";
import FloatingInput from "@/components/ui/FloatingInput";


const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const passwordRegex = /^[^\s]{1,128}$/;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
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
  const [loading, setLoading] = useState(false);

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
    setFormError("");
    const isValid = validateForm();
    if (!isValid) return;
    setLoading(true);
    try {
      await login(formData);
      navigate("/home");
    } catch (error) {
      setFormError("Invalid email or password ");
    } finally {
      setLoading(false);
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
          <FloatingInput
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            error={fieldErros.email}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[\\<>|{}[\]]/g, "")
                .trim();
              setFromData({ ...formData, email: value });
              setFieldErrors({ ...fieldErros, email: "" });
            }}
          />

        </div>

        {/* Password */}
        <div className="relative">
          <FloatingInput
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            error={fieldErros.password}
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
          >
            {showPassword ? (
              <FaEyeSlash className="w-5 h-5" />
            ) : (
              <FaEye className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Forgot Password */}
        <div className="pt-1 lg:pt-2">
          <p className="text-red-500">{formError}</p>
          <Link to="/forgot-password" className="text-red-500 hover:underline flex justify-end">
            Forgot password
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold cursor-pointer select-none "
          color="green"
          outline
          disabled={loading || !formData.email || !formData.password}
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
