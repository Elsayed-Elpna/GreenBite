import React from 'react';
import { Trash2, Flag, Star, Clock, User, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthProvider';
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

  // buyer = authenticated and not seller/admin (you can switch to !isSubscribed if that’s your rule)
  const isBuyer = Boolean(user && !isAdmin && !isSubscribed);
  const canOrder = Boolean(isBuyer && status === "ACTIVE");
  const canReport = Boolean(user && !isOwner && !isAdmin);
  const canReview = Boolean(isBuyer); // backend should enforce "only if ordered"

  const daysLeft =
    available_until ? Math.ceil((new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MP_DIALOG.content}>
        <DialogHeader>
          <DialogTitle className={`text-xl ${MP_DIALOG.title}`}>{title}</DialogTitle>
          <div className={`mt-1 text-sm ${MP_DIALOG.muted}`}>
            {seller?.name ?? seller?.email ?? "Unknown seller"}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className={MP_DIALOG.imageWrap}>
            {featured_image ? (
              <img src={featured_image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <img src="/images/listings.png" alt="Placeholder" className="w-16 h-16 opacity-50" />
              </div>
            )}

            <div className="absolute top-3 right-3">
              <Badge className={MP_DIALOG.badge}>{status}</Badge>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-2xl font-bold text-emerald-800">
                {Number(price).toFixed?.(2) ?? price} {currency}
              </div>
              <div className={MP_DIALOG.muted}>
                {quantity} {unit} available
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-1">
                <Star className="h-4 w-4 text-amber-600 fill-amber-500" />
                <span className="text-sm font-semibold text-amber-900">
                  {typeof average_rating === "number" ? average_rating.toFixed(1) : "N/A"}
                </span>
                <span className="text-xs text-amber-900/70">
                  ({review_count ?? 0})
                </span>
              </div>
            </div>
          </div>

          {description ? (
            <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
          ) : null}

          <Separator className="bg-emerald-200/70" />

          <div className={`flex items-center justify-between text-sm ${MP_DIALOG.muted}`}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                Sold by <span className="font-semibold text-slate-800">{seller?.name ?? seller?.email}</span>
              </span>
            </div>

            {daysLeft !== null ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{daysLeft > 0 ? `Available for ${daysLeft} more days` : "Expired"}</span>
              </div>
            ) : null}
          </div>

          <Separator className="bg-emerald-200/70" />

          <div className="flex gap-2 flex-wrap justify-center"> 
            {canOrder ? (
              <Button className="flex-1" onClick={() => onOrder?.(listing)}>
                Order Now
              </Button>
            ) : null}

            {canReview ? (
              <Button variant="outline" onClick={() => onReview?.(listing)} className="border-emerald-300 text-emerald-800">
                Review
              </Button>
            ) : null}

            {canReport ? (
              <Button variant="outline" onClick={() => onReport?.(listing)} className="border-emerald-300 text-emerald-800">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            ) : null}

            {canEditDelete ? (
              <Button variant="outline" onClick={() => onEdit?.(listing)} className="border-emerald-300 text-emerald-800">
                <p className="flex">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </p>
              </Button>
            ) : null}

            {canEditDelete ? (
              <Button variant="danger" onClick={() => onDelete?.(listing)}>
                <p className="flex">
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
