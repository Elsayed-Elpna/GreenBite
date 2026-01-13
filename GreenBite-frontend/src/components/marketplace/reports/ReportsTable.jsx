import StatusBadge from "./StatusBadge";
import { useState } from "react";
import ReportDetailsDialog from "./ReportDetailsDialog";
import ReportActionDialog from "./ReportActionDialog";

export default function ReportsTable({ reports }) {
  const [viewReportId, setViewReportId] = useState(null);
  const [actionReportId, setActionReportId] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const handleCloseView = () => setViewReportId(null);
  const handleCloseAction = () => setActionReportId(null);

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-lg border border-green-100 bg-gradient-to-br from-white to-green-50/20">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-green-100 to-green-50 text-sm">
            <tr>
              <th className="p-4 text-left font-semibold text-green-900">ID</th>
              <th className="p-4 text-left font-semibold text-green-900">Status</th>
              <th className="p-4 text-left font-semibold text-green-900">Target</th>
              <th className="p-4 text-left font-semibold text-green-900">Title</th>
              <th className="p-4 text-left font-semibold text-green-900">Reason</th>
              <th className="p-4 text-left font-semibold text-green-900">Reporter</th>
              <th className="p-4 text-left font-semibold text-green-900">Date</th>
              <th className="p-4 text-left font-semibold text-green-900">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report, index) => (
              <tr
                key={report.id}
                className={`border-t border-green-100 text-sm transition-all duration-200 ${
                  hoveredRow === index 
                    ? 'bg-gradient-to-r from-green-50 to-white shadow-md scale-[1.01]' 
                    : 'bg-white hover:bg-green-50/30'
                }`}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="p-4">
                  <span className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    #{report.id}
                  </span>
                </td>
                <td className="p-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="p-4">
                  <span className="font-medium text-gray-700">{report.target_type}</span>
                </td>
                <td className="p-4 max-w-xs">
                  <span className="text-gray-800 truncate block">
                    {report.target_snapshot?.title || report.target_snapshot?.email || "-"}
                  </span>
                </td>
                <td className="p-4 max-w-xs">
                  <span className="text-gray-700 truncate block">{report.reason}</span>
                </td>
                <td className="p-4">
                  <span className="text-gray-600 text-xs">{report.reporter.email}</span>
                </td>
                <td className="p-4">
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewReportId(report.id)}
                      className="text-green-700 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      View
                    </button>

                    {report.status === "PENDING" && (
                      <button
                        onClick={() => setActionReportId(report.id)}
                        className="text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        Action
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      {viewReportId && (
        <ReportDetailsDialog reportId={viewReportId} onClose={handleCloseView} />
      )}

      {actionReportId && (
        <ReportActionDialog reportId={actionReportId} onClose={handleCloseAction} />
      )}
    </>
  );
}