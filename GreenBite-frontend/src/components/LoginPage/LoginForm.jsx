import { useState } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login Successfully');
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
                    <Label htmlFor="email" color="black" className="text-sm lg:text-base mb-2 block">
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
                    />
                </div>

                {/* Password */}
                <div>
                    <Label htmlFor="password" color="black" className="text-sm lg:text-base mb-2 block">
                        Password
                    </Label>
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

                {/* Forgot Password */}
                <div className="pt-1 lg:pt-2">
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
                >
                    Login
                </Button>

                {/* Signup Link */}
                <p className="text-center text-sm lg:text-base text-gray-700 pt-1">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-500 hover:underline font-medium">
                        Sign Up
                    </Link>
                </p>

            </form>
        </div>
    );
}
