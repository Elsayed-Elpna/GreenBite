import { useState } from 'react';
import { Label, TextInput, Button, Checkbox } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="w-full max-w-xl lg:max-w-3xl">

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
              placeholder="John"
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
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
              type="text"
              placeholder="Doe"
              required
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
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
              type="email"
              placeholder="john.doe@gmail.com"
              required
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
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
              type="text"
              placeholder="john_doe"
              required
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
            />
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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••••••••••"
              required
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
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••••••••••••"
              required
              sizing="md"
              color="white"
              className="w-full text-sm lg:text-base lg:h-12"
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

        {/* Terms and Conditions */}
        <div className="flex items-start gap-2 pt-1 lg:pt-2">
          <Checkbox
            id="terms"
            required
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

        {/* Submit Button */}
        <Button
          type="submit"
          onClick={handleSubmit}
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
    </div>
  );
}
