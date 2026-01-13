import { useReportDetails } from "@/hooks/reports/useReportDetails";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import StatusBadge from "./StatusBadge";

export default function ReportDetailsDialog({ reportId, onClose }) {
  const { data, isLoading, isError } = useReportDetails(reportId);

  if (isLoading) return null;
  if (isError || !data) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-gradient-to-br from-white to-green-100 text-gray-800 p-6 rounded-xl shadow-xl border border-green-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent">
            Report Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Report Info */}
          <div className="bg-white/60 rounded-xl p-4 border border-green-100 hover:bg-white/80 transition-colors duration-200">
            <StatusBadge status={data.status} />
            <p className="font-semibold mt-3 text-gray-800">{data.reason}</p>
            <p className="text-sm text-gray-700 mt-2">{data.details}</p>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Created: {new Date(data.created_at).toLocaleString()}
            </p>
          </div>

          {/* Target */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100 hover:shadow-md transition-all duration-200">
            <p className="font-semibold text-green-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Target
            </p>
            <p className="text-sm mt-2 text-gray-700">Type: <span className="font-medium">{data.target_type}</span></p>

            {data.target_type === "USER" && data.target_snapshot?.email && (
              <p className="text-sm mt-1 text-gray-700">
                Email: <span className="font-medium">{data.target_snapshot.email}</span>
              </p>
            )}

            {data.target_type === "MARKET" && (
              <>
                {data.target_snapshot?.title && (
                  <p className="text-sm mt-1 text-gray-700">
                    Title: <span className="font-medium">{data.target_snapshot.title}</span>
                  </p>
                )}
                {data.target_snapshot?.seller?.email && (
                  <p className="text-sm mt-1 text-gray-700">
                    Seller: <span className="font-medium">{data.target_snapshot.seller.email}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Reporter */}
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100 hover:shadow-md transition-all duration-200">
            <p className="font-semibold text-green-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Reporter
            </p>
            <p className="text-sm mt-2 text-gray-700 font-medium">{data.reporter.email}</p>
          </div>

          {/* Admin Review */}
          {data.reviewed_by && (
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200">
              <p className="font-semibold text-green-900 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Admin Review
              </p>
              <p className="text-sm mt-2 text-gray-700">Reviewed by: <span className="font-medium">{data.reviewed_by.email}</span></p>
              <p className="text-sm mt-1 text-gray-700">Reviewed at: <span className="font-medium">{new Date(data.reviewed_at).toLocaleString()}</span></p>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-200 hover:to-green-400 text-white hover:text-green-800 font-semibold rounded-lg py-3 transition-all duration-200 hover:shadow-md"
          >
            Close
          </button>
        </div>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}