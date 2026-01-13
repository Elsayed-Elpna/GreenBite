import { MdKeyboardArrowDown } from "react-icons/md";

export default function FloatingSelect({
  label,
  id,
  options,
  value,
  error,
  onChange,
}) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`peer w-full rounded-lg border px-4 pt-6 pb-2 outline-none appearance-none bg-white
          ${error ? "border-red-500" : "border-gray-400 focus:border-green-500"}
        `}
      >
        <option value="" />
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>

      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200
          ${value ? "top-1 text-xs text-green-600" : "top-1/2 -translate-y-1/2 text-gray-500"}
          ${error && "text-red-500"}
        `}
      >
        {label}
      </label>

      <MdKeyboardArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}