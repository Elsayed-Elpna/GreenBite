import { Clock, Star, ShoppingCart, Flag, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthProvider";
import React from "react";

const ListingCard = ({ listing, onOrder, onViewDetails, onReview, onReport }) => {
  const { user, isSubscribed } = useAuth();
  const isSeller = user?.role === "seller"; // adjust to your actual role field
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

  const daysLeft = Math.ceil((new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24));
  const isOwner = seller?.id === user?.id;
  const isExpired = daysLeft <= 0;
  const isActive = (status === 'Active' || status === 'ACTIVE') && !isExpired;

  const canOrder = isSubscribed && isActive;

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-recipe-hover hover:-translate-y-1 cursor-pointer"
      onClick={() => onViewDetails?.(listing)}
    >
      <div className="relative h-40 bg-muted">
        {featured_image && !imgError ? (
          <img
            src={featured_image}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${
            isActive ? 'bg-secondary' : 'bg-muted'
          }`}
        >
          {isExpired ? 'Expired' : status}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-2">{title}</h3>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary">
            {price} {currency}
          </span>
          <span className="text-sm text-muted-foreground">
            {quantity} {unit}
          </span>
        </div>

        {/* Average Rating - shown for sellers on their products or for all products */}
        {(average_rating !== undefined || isSeller) && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <Star className="h-4 w-4 text-warning fill-warning" />
            <span className="font-medium">{average_rating?.toFixed(1) || 'N/A'}</span>
            <span className="text-muted-foreground">
              ({review_count || 0} reviews)
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Clock className="h-4 w-4" />
          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
        </div>

        {seller && (
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-muted-foreground">by {seller.name}</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="font-medium">{seller.trust_score}</span>
            </div>
          </div>
        )}

        {!isSubscribed && !isOwner && (
          <div className="mb-3 text-xs text-warning">
            Subscribe to place orders.
          </div>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!isOwner && (
            <>
              <Button
                className="flex-1"
                onClick={() => onOrder?.(listing)}
                disabled={!canOrder}
                size="sm"
                title={!isSubscribed ? "Subscribe to order" : undefined}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Order
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onReview?.(listing)}
                disabled={!isSubscribed}
                title={!isSubscribed ? "Subscribe to review" : "Write a review"}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onReport?.(listing)}
                disabled={!isSubscribed}
                title={!isSubscribed ? "Subscribe to report" : "Report listing"}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </>
          )}

          {isOwner && (
            <Button variant="outline" className="w-full" size="sm">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingCard;

