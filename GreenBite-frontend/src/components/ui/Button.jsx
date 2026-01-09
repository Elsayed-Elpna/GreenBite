import React from "react";

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition " +
  "focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-green-600 text-white hover:bg-green-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300",
  outline: "bg-transparent text-green-700 border border-green-600 hover:bg-green-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-gray-900 hover:bg-gray-100",
  link: "bg-transparent text-green-700 hover:underline p-0 h-auto",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  type = "button",
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && "w-full",
        loading && "opacity-80",
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
          aria-hidden="true"
        />
      )}
      {!loading && leftIcon ? <span className="mr-2">{leftIcon}</span> : null}
      <span>{children}</span>
      {!loading && rightIcon ? <span className="ml-2">{rightIcon}</span> : null}
    </button>
  );
}

