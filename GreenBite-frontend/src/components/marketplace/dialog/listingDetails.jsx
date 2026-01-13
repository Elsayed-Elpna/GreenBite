import React from "react";
import { Trash2, Flag, Star, Clock, User, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthProvider";
import { MP_DIALOG } from "@/components/ui/DialogTheme";

const ListingDetailsDialog = ({
  listing,
  open,
  onOpenChange,
  onOrder,
  onDelete,
  onReport,
  onEdit,
  onReview,
}) => {
  const { user, isSubscribed } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  if (!listing) return null;

  const {
    title,
    description,
    price,
    currency,
    quantity,
    unit,
    featured_image,
    available_until,
    seller,
    status,
    average_rating,
    review_count,
  } = listing;

  const isOwner = Boolean(isSubscribed && seller?.id === user?.id);

  // owner must be subscribed to edit/delete; admin always can
  const canEditDelete = Boolean(isOwner && isSubscribed) || isAdmin;

  // buyer = authenticated and not seller/admin (you can switch to !isSubscribed if that's your rule)
  const isBuyer = Boolean(user && !isAdmin && !isSubscribed);
  const canOrder = Boolean(isBuyer && status === "ACTIVE");
  const canReport = Boolean(user && !isOwner && !isAdmin);
  const canReview = Boolean(isBuyer); // backend should enforce "only if ordered"

  const daysLeft = available_until
    ? Math.ceil(
        (new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-green-500 shadow-2xl shadow-green-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-700">
            {title}
          </DialogTitle>
          <div className="mt-1 text-sm text-gray-600">
            {seller?.name ?? seller?.email ?? "Unknown seller"}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-green-400 bg-gray-50">
            {featured_image ? (
              <img
                src={featured_image}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <img
                  src="/images/listings.png"
                  alt="Placeholder"
                  className="w-16 h-16 opacity-50"
                />
              </div>
            )}

            <div className="absolute top-3 right-3">
              <Badge className="bg-green-600 text-white border-0 px-3 py-1 text-xs font-semibold">
                {status}
              </Badge>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-3xl font-bold text-green-700">
                {Number(price).toFixed?.(2) ?? price} {currency}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {quantity} {unit} available
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 rounded-full bg-green-50 border-2 border-green-400 px-3 py-1.5">
                <Star className="h-4 w-4 text-green-600 fill-green-500" />
                <span className="text-sm font-semibold text-green-900">
                  {typeof average_rating === "number"
                    ? average_rating.toFixed(1)
                    : "N/A"}
                </span>
                <span className="text-xs text-green-700">
                  ({review_count ?? 0})
                </span>
              </div>
            </div>
          </div>

          {description ? (
            <p className="text-sm text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border border-green-200">
              {description}
            </p>
          ) : null}

          <Separator className="bg-green-300" />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <span>
                Sold by{" "}
                <span className="font-semibold text-green-700">
                  {seller?.name ?? seller?.email}
                </span>
              </span>
            </div>

            {daysLeft !== null ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">
                  {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                </span>
              </div>
            ) : null}
          </div>

          <Separator className="bg-green-300" />

          <div className="flex gap-2 flex-wrap justify-center">
            {canOrder ? (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white outline-none focus:outline-none transition-colors shadow-lg shadow-green-600/30"
                onClick={() => onOrder?.(listing)}
              >
                Order Now
              </Button>
            ) : null}

            {canReview ? (
              <Button
                variant="outline"
                onClick={() => onReview?.(listing)}
                className="border-2 border-green-500 text-green-700 hover:bg-green-50 outline-none focus:outline-none transition-colors"
              >
                Review
              </Button>
            ) : null}

            {canReport ? (
              <Button
                variant="outline"
                onClick={() => onReport?.(listing)}
                className="border-2 border-green-500 text-green-700 hover:bg-green-50 outline-none focus:outline-none transition-colors"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            ) : null}

            {canEditDelete ? (
              <Button
                variant="outline"
                onClick={() => onEdit?.(listing)}
                className="border-2 border-green-500 text-green-700 hover:bg-green-50 outline-none focus:outline-none transition-colors"
              >
                <p className="flex items-center">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </p>
              </Button>
            ) : null}

            {canEditDelete ? (
              <Button
                variant="danger"
                onClick={() => onDelete?.(listing)}
                className="bg-red-600 hover:bg-red-700 text-white outline-none focus:outline-none transition-colors"
              >
                <p className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </p>
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsDialog;
