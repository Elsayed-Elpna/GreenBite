import { useState } from "react";

export default function FloatingInput({
  label,
  type = "text",
  id,
  value,
  onChange,
  error,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={
          type === "date"
            ? { WebkitTextFillColor: value ? "#000" : "transparent" }
            : undefined
        }
        className={`peer w-full rounded-lg border px-4 pt-6 pb-2 text-sm outline-none transition
          ${error ? "border-red-500" : "border-gray-400 focus:border-green-500 bg-white"}
        `}
        {...props}
      />

      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200
          ${(focused || value)
            ? "top-1 text-xs text-green-600"
            : "top-1/2 -translate-y-1/2 text-sm text-gray-500"}
          ${error && "text-red-500"}
        `}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
