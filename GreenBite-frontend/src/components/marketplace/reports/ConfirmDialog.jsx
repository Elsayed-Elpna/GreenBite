import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ConfirmDialog({
  open = true,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-800">{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <p className="text-sm text-gray-700">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded text-white ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
