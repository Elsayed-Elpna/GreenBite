import { useState } from 'react';
import { Label, TextInput, Button, Checkbox } from 'flowbite-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

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
            <div className="space-y-2 lg:space-y-4">

                {/* Email and Password */}
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
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-2 pt-1 lg:pt-2">
                    <a href="#" className="text-red-500 hover:underline">
                        Forgot password
                    </a>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full h-11 lg:h-12 text-sm lg:text-base font-semibold mt-5 cursor-pointer"
                    color="green"
                    outline
                >
                    Login
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm lg:text-base text-gray-700 pt-1">
                    Don't have an account?{' '}
                    <a href="#" className="text-green-500 hover:underline font-medium">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
}
