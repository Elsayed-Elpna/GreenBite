import { useState } from "react";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingInput from "@/components/ui/FloatingInput";
import { useModerateReport } from "@/hooks/reports/useModerateReport";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ConfirmDialog from "./ConfirmDialog";

export default function ReportActionDialog({ reportId, onClose }) {
  const [data, setData] = useState({
    status: "",
    admin_action: "",
    admin_notes: "",
    ban_until: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isLoading } = useModerateReport();

  const needsBanDate =
    data.admin_action === "SUSPEND_SELLER" || data.admin_action === "BAN_USER";
  const isDangerousAction = data.admin_action === "BAN_USER" || data.admin_action === "SUSPEND_SELLER";
  const getPayload = () => {
    if (data.status === "DISMISSED") {
      return {
        status: "DISMISSED",
        admin_notes: data.admin_notes || "",
      };
    }
    if (data.status === "APPROVED") {
      if (isDangerousAction) {
        return {
          status: "APPROVED",
          admin_action: data.admin_action,
          admin_notes: data.admin_notes || "",
          ban_until: data.ban_until,
        };
      }
      return {
        status: "APPROVED",
        admin_action: data.admin_action !== "NONE" ? data.admin_action : null,
        admin_notes: data.admin_notes || "",
      };
    }

    return {};
  };

  const submit = () => setShowConfirm(true);

  const confirmAction = () => {
    const payload = getPayload();
    mutate(
      { reportId, data: payload },
      {
        onSuccess: () => {
          toast.success("Report action submitted successfully");
          onClose();
        },
        onError: () => toast.error("Failed to submit action"),
      }
    );
  };

  return (
    <>
      <Dialog open={Boolean(reportId)} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-full bg-gradient-to-br from-white to-green-100 text-gray-800 p-6 rounded-xl shadow-xl border border-green-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent flex items-center gap-2">
              <svg className="w-5 h- text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Moderate Report
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Decision select */}
            <FloatingSelect
              label="Decision"
              value={data.status}
              onChange={(e) =>
                setData({
                  status: e.target.value,
                  admin_action: "",
                  admin_notes: "",
                  ban_until: "",
                })
              }

              options={[
                { value: "APPROVED", label: "Approve" },
                { value: "DISMISSED", label: "Dismiss" },
              ]}
              inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
            />

            {(data.status === "DISMISSED" || data.status === "APPROVED") && (
              <>
                {data.status === "APPROVED" && (
                  <FloatingSelect
                    label="Admin Action"
                    value={data.admin_action}
                    onChange={(e) => setData({ ...data, admin_action: e.target.value })}
                    options={[
                      { value: "NONE", label: "No Action" },
                      { value: "DELETE_MARKET", label: "Delete listing" },
                      { value: "SUSPEND_SELLER", label: "Suspend seller" },
                      { value: "BAN_USER", label: "Ban user" },
                    ]}
                    inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
                  />
                )}

                <FloatingInput
                  label="Admin Notes"
                  value={data.admin_notes}
                  onChange={(e) => setData({ ...data, admin_notes: e.target.value })}
                  inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
                />

                {needsBanDate && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-lg border border-orange-200">
                    <FloatingInput
                      type="date"
                      label="Ban Until"
                      value={data.ban_until}
                      onChange={(e) => setData({ ...data, ban_until: e.target.value })}
                      inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
                    />
                  </div>
                )}

                {isDangerousAction && (
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs text-red-800 font-medium">Warning: This action will restrict user access</p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={submit}
              disabled={isLoading}
              className={`w-full text-white font-semibold rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg ${isDangerousAction
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                }`}
            >
              {isLoading ? "Processing..." : "Confirm Action"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmDialog
          open={showConfirm}
          title="Confirm Action"
          message="Are you sure you want to submit this action?"
          confirmText="Yes, submit"
          cancelText="Cancel"
          onConfirm={() => {
            setShowConfirm(false);
            confirmAction();
          }}
          onCancel={() => setShowConfirm(false)}
          danger={isDangerousAction}
        />
      )}
    </>
  );
}
