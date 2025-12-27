import { useState } from 'react';
import { Label, TextInput, Button, Checkbox } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;
  const NAME_REGEX = /^[A-Za-z]+$/;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (!NAME_REGEX.test(value)) {
          error = 'First name must contain letters only (no spaces)';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (!NAME_REGEX.test(value)) {
          error = 'Last name must contain letters only (no spaces)';
        }
        break;


      case 'username':
        if (!value)
          error = 'Username is required';
        else if (!USERNAME_REGEX.test(value))
          error =
            'Username must contain only letters, numbers, and underscores (3–30 chars)';
        break;

      case 'email':
        if (!value)
          error = 'Email is required';
        else if (!EMAIL_REGEX.test(value))
          error = 'Invalid email format';
        break;

      case 'password':
        if (value.length < 8)
          error = 'Password must be at least 8 characters long';
        else if (!SPECIAL_CHAR_REGEX.test(value))
          error = 'Password must contain at least one special character';
        else if (!/[A-Z]/.test(value))
          error = 'Password must contain at least one uppercase letter';
        else if (!/[0-9]/.test(value))
          error = 'Password must contain at least one digit';
        else if (
          formData.username &&
          value.toLowerCase().includes(formData.username.toLowerCase())
        )
          error = 'Password must not contain the username';
        break;

      case 'confirmPassword':
        if (value !== formData.password)
          error = 'Passwords do not match';
        break;

      case 'terms':
        if (!value) error = 'You must agree to the terms';
        break;

      default:
        break;
    }

    return error;
  };


  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    const errorMessage = validateField(name, fieldValue);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));

    // Special case: re-validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          fieldValue !== formData.confirmPassword
            ? 'Passwords do not match'
            : '',
      }));
    }

    if (name === 'username' && formData.password) {
      setErrors((prev) => ({
        ...prev,
        password: formData.password
          .toLowerCase()
          .includes(value.toLowerCase())
          ? 'Password must not contain the username'
          : '',
      }));
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;

    // Backend registration
    try {
      const response = await axios.post(
        'http://localhost:8000/auth/users/',
        {
          username: formData.username,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          re_password: formData.confirmPassword,
        }
      );

      console.log('User registered:', response.data);
      localStorage.setItem("registeredEmail", formData.email);
      navigate("/verify");
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data); // show backend validation errors
      }
    }
  };


  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl lg:max-w-3xl">


      {/* Form Header */}
      <div className="mb-6 lg:mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Sign up
        </h2>
        <p className="text-gray-600 text-sm lg:text-base">
          Let's get you all set up so you can access your personal account.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-2 lg:space-y-4">

        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-3 lg:gap-5">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="firstName"
                color="black"
                className="text-sm lg:text-base"
              >
                First Name
              </Label>
            </div>
            <TextInput
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="lastName"
                color="black"
                className="text-sm lg:text-base"
              >
                Last Name
              </Label>
            </div>
            <TextInput
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email and Username */}
        <div className="grid grid-cols-2 gap-3 lg:gap-5">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="email"
                color="black"
                className="text-sm lg:text-base"
              >
                Email
              </Label>
            </div>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@gmail.com"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="username"
                color="black"
                className="text-sm lg:text-base"
              >
                Username
              </Label>
            </div>
            <TextInput
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="john_doe"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username}
              </p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 block">
            <Label
              htmlFor="password"
              color="black"
              className="text-sm lg:text-base"
            >
              Password
            </Label>
          </div>

          <div className="relative">
            <TextInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••••••••••"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
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
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="mb-2 block">
            <Label
              htmlFor="confirmPassword"
              color="black"
              className="text-sm lg:text-base"
            >
              Confirm Password
            </Label>
          </div>

          <div className="relative">
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••••••••••••••"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="w-5 h-5 lg:w-6 lg:h-6" />
              ) : (
                <FaEye className="w-5 h-5 lg:w-6 lg:h-6" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2 pt-1 lg:pt-2">
          <Checkbox
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            className="mt-0.5 cursor-pointer"
            color="green"
          />
          <Label
            htmlFor="terms"
            className="text-xs lg:text-sm !text-gray-700 leading-relaxed"
          >
            I agree to all the{' '}
            <a href="#" className="text-red-500 hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-red-500 hover:underline">
              Privacy Policies
            </a>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs mt-1">
            {errors.terms}
          </p>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold mt-5 cursor-pointer"
          color="green"
          outline
        >
          Create account
        </Button>
        {/* Login Link */}
        <p className="text-center text-sm lg:text-base text-gray-700 pt-1">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-red-500 hover:underline font-medium"
          >
            Login
          </Link>
        </p>

      </div>
    </form>

  );
}
