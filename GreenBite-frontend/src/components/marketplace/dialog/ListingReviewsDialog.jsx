import ReviewList from "@/components/marketplace/reviews/ReviewList";
import CreateReviewDialog from "@/components/marketplace/reviews/CreateReviewDialog";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

const ListingReviewsDialog = ({ open, onOpenChange, listing }) => {
  if (!open || !listing?.id) return null;

  return (
    <>
      {/* Backdrop with click to close */}
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={() => onOpenChange(false)}
      >
        {/* Dialog content - stop propagation to prevent closing when clicking inside */}
        <div
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-emerald-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Reviews – {listing.title}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-emerald-600 hover:bg-emerald-100 rounded-full p-2 transition-all duration-200 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <ReviewList listingId={listing.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingReviewsDialog;
