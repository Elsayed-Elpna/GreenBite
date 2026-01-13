import StatusBadge from "./StatusBadge";
import { useState } from "react";
import ReportDetailsDialog from "./ReportDetailsDialog";
import ReportActionDialog from "./ReportActionDialog";

export default function ReportsCard({ report }) {
  const [viewReportId, setViewReportId] = useState(null);
  const [actionReportId, setActionReportId] = useState(null);

  const handleCloseDialog = () => setViewReportId(null);
  const handleCloseAction = () => setActionReportId(null);

  return (
    <div className="relative border border-green-100 rounded-xl p-5 bg-gradient-to-br from-white to-green-50/30 shadow-sm hover:shadow-xl transition-all duration-300 space-y-3 overflow-hidden group">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="font-semibold text-green-900 text-sm uppercase tracking-wide">
              {report.target_type} REPORT
            </p>
            <StatusBadge status={report.status} />
          </div>
          
          {/* Decorative element */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="font-medium text-gray-800 text-base">
            {report.target_snapshot?.title || report.target_snapshot?.email}
          </p>

          <div className="bg-white/60 rounded-lg p-3 border border-green-100 hover:bg-white/80 transition-colors duration-200">
            <p className="text-sm">
              <span className="font-semibold text-green-800">Reason:</span>{" "}
              <span className="text-gray-700">{report.reason}</span>
            </p>
          </div>

          <p className="text-sm text-gray-600">
            <span className="font-semibold text-green-800">Reporter:</span>{" "}
            {report.reporter.email}
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-3 pt-4 mt-4 border-t border-green-100">
          <button
            onClick={() => setViewReportId(report.id)}
            className="flex-1 text-green-700 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            View Details
          </button>

          {report.status === "PENDING" && (
            <button
              onClick={() => setActionReportId(report.id)}
              className="flex-1 text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              Take Action
            </button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {viewReportId && (
        <ReportDetailsDialog reportId={viewReportId} onClose={handleCloseDialog} />
      )}

      {actionReportId && (
        <ReportActionDialog reportId={actionReportId} onClose={handleCloseAction} />
      )}
    </div>
  );
}