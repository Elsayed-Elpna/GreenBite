import { useEffect, useState } from "react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { useCreateReport } from "@/hooks/reports/useCreateReport";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CreateReportDialog({ listing, defaultTargetType = "MARKET", onClose }) {
  const [form, setForm] = useState({
    target_type: defaultTargetType,
    reason: "",
    details: "",
  });

  const { mutate, isLoading } = useCreateReport();

  useEffect(() => {
    setForm((prev) => ({ ...prev, target_type: defaultTargetType }));
  }, [defaultTargetType]);

  const submit = () => {
    if (!form.target_type || !form.reason) {
      toast.error("Please fill required fields");
      return;
    }

    const target_id = form.target_type === "USER" ? listing?.seller?.id : listing?.id;

    if (!target_id) {
      toast.error("Invalid report target");
      return;
    }

    mutate(
      {
        target_type: form.target_type,
        target_id,
        reason: form.reason,
        details: form.details,
      },
      {
        onSuccess: () => {
          toast.success("Report submitted successfully");
          onClose();
        },
        onError: (error) => {
          const axiosError = error?.response;
          if (axiosError?.data) {
            if (axiosError.data.detail) {
              toast.error(axiosError.data.detail);
            } else {
              const messages = Object.values(axiosError.data)
                .flat()
                .join(" | ");
              toast.error(messages || "Something went wrong");
            }
          } else if (error?.message) {
            toast.error(error.message);
          } else {
            toast.error("Something went wrong");
          }
        },
      }
    );
  };

  const isOpen = Boolean(listing);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full bg-gradient-to-br from-white to-orange-100 !text-gray-800 p-6 rounded-xl shadow-xl border border-orange-100">
        <DialogHeader>
          <DialogTitle className="text-gray-800 text-xl font-semibold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
            Create Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Illustration / notice */}
          <div className="h-32 bg-gradient-to-br from-red-100 via-orange-100 to-red-50 rounded-xl flex items-center justify-center border border-red-200 group hover:shadow-lg transition-all duration-300">
            <div className="text-center">
              <svg className="w-12 h-12 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-semibold text-red-600">Report Content</p>
            </div>
          </div>

          {/* Floating Select */}
          <FloatingSelect
            label="Report Type"
            value={form.target_type}
            onChange={(e) => setForm({ ...form, target_type: e.target.value })}
            options={[
              { value: "MARKET", label: "Marketplace Listing" },
              { value: "USER", label: "User / Seller" },
            ]}
            inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
          />

          {/* Floating Inputs */}
          <FloatingInput
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
          />

          <FloatingInput
            label="Details"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            inputclassname="text-gray-800 placeholder:text-gray-400 bg-white/80 hover:bg-white transition-colors duration-200"
          />

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}