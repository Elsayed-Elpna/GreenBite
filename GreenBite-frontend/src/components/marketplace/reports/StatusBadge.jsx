const STATUS_STYLES = {
  PENDING: "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200",
  APPROVED: "bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200",
  DISMISSED: "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border border-gray-200",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 ${
        STATUS_STYLES[status] || "bg-gray-100"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
        status === 'PENDING' ? 'bg-yellow-500' : 
        status === 'APPROVED' ? 'bg-green-500' : 
        'bg-gray-400'
      }`}></span>
      {status}
    </span>
  );
}