import { FiSearch } from "react-icons/fi";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="bg-[#ccebcf] text-[#629669] p-4 rounded-full mb-4">
        <FiSearch size={26} />
      </div>

      <h3 className="text-[#629669] text-xl font-semibold mb-2">
        No recipes yet
      </h3>

      <p className="text-gray-500">
        Enter ingredients above to get AI-powered recipe recommendations
      </p>
    </div>
  );
}
