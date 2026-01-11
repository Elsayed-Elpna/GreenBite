import { Star, Clock, MapPin, User, Trash2, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Button  from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthProvider';

const ListingDetailsDialog = ({ listing, open, onOpenChange, onOrder, onDelete, onReport }) => {
  const { user, isSeller, isAdmin } = useAuth();

  if (!listing) return null;

  const {
    id,
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

  const daysLeft = Math.ceil((new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24));
  const isOwner = seller?.id === user?.id;
  const canDelete = isOwner || isAdmin;
  const canReport = !isOwner && !isAdmin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
            {featured_image ? (
              <img src={featured_image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <Badge
              className={`absolute top-2 right-2 ${
                status === 'Active' || status === 'ACTIVE' ? 'bg-secondary' : 'bg-muted'
              }`}
            >
              {status}
            </Badge>
          </div>

          {/* Price & Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {price} {currency}
            </span>
            <span className="text-muted-foreground">
              {quantity} {unit} available
            </span>
          </div>

          {/* Rating */}
          {(average_rating !== undefined || review_count !== undefined) && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-warning fill-warning" />
                <span className="font-semibold">{average_rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <span className="text-muted-foreground">
                ({review_count || 0} reviews)
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}

          <Separator />

          {/* Seller Info */}
          {seller && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Sold by <strong>{seller.name}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-warning fill-warning" />
                <span className="font-medium">{seller.trust_score}</span>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {daysLeft > 0 ? `Available for ${daysLeft} more days` : 'Expired'}
            </span>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            {/* Order button for buyers */}
            {!isOwner && (
              <Button
                className="flex-1"
                onClick={() => onOrder(listing)}
                disabled={status !== 'Active' && status !== 'ACTIVE'}
              >
                Order Now
              </Button>
            )}

            {/* Delete button for owner/admin */}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete(listing)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}

            {/* Report button for buyers */}
            {canReport && (
              <Button
                variant="outline"
                onClick={() => onReport(listing)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListingDetailsDialog;
