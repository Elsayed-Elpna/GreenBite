import {
  Clock,
  Star,
  ShoppingCart,
  Flag,
  MessageSquare,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthProvider";
import React from "react";

const ListingCard = ({
  listing,
  onOrder,
  onViewDetails,
  onReview,
  onReport,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();

  const {
    title,
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

  const [imgError, setImgError] = React.useState(false);

  const daysLeft = Math.ceil(
    (new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysLeft <= 0;
  const isActive = (status === "ACTIVE" || status === "Active") && !isExpired;
  const isOwner = seller?.id === user?.id;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  const canManage = isOwner || isAdmin;
  const canOrder = !isOwner && !isSeller;

  return (
    <Card
      onClick={() => onViewDetails?.(listing)}
      className="group cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-white via-emerald-50/30 to-white transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-300/30"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 via-green-50 to-teal-50">
        {featured_image && !imgError ? (
          <img
            src={featured_image}
            alt={title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles className="h-20 w-20 text-emerald-300 opacity-40" />
          </div>
        )}

        <Badge
          className={`absolute top-3 right-3 text-xs font-semibold ${
            isActive ? "bg-emerald-600 text-white" : "bg-gray-500 text-white"
          }`}
        >
          {isExpired ? "Expired" : status}
        </Badge>

        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <div className="rounded-xl bg-emerald-600 px-3 py-1 text-white shadow-lg">
            <span className="text-xl font-bold">{price}</span>{" "}
            <span className="text-sm">{currency}</span>
          </div>
          <div className="rounded-xl bg-white px-3 py-1 text-sm font-bold text-emerald-700 shadow">
            {quantity} {unit}
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 pt-4 pb-5">
        <div className="space-y-3 mb-3">
          <h3 className="truncate text-lg font-bold text-gray-800 group-hover:text-emerald-700">
            {title}
          </h3>

          {average_rating !== undefined && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="font-bold">
                {average_rating?.toFixed(1) || "N/A"}
              </span>
              <span className="text-sm text-gray-600">
                ({review_count || 0})
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">
              {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
            </span>
          </div>

          {canOrder && (
            <p className="text-sm text-gray-600">by {seller?.name}</p>
          )}
        </div>

        {/* ===== ACTIONS ===== */}
        <div onClick={(e) => e.stopPropagation()}>
          {canOrder && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                onClick={() => onOrder?.(listing)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Order
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview?.(listing)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Review
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onReport?.(listing)}
              >
                <Flag className="h-4 w-4 mr-1" />
                Report
              </Button>
            </div>
          )}

          {canManage && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onEdit?.(listing)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white"
                onClick={() => onDelete?.(listing)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
