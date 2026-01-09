import { Clock, Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button  from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const ListingCard = ({ listing, onOrder }) => {
  const { title, price, currency, quantity, unit, featured_image, available_until, seller, status } = listing;

  const daysLeft = Math.ceil((new Date(available_until) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-recipe-hover hover:-translate-y-1">
      <div className="relative h-40 bg-muted">
        {featured_image ? (
          <img src={featured_image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        <Badge 
          className={`absolute top-2 right-2 ${
            status === 'Active' ? 'bg-secondary' : 'bg-muted'
          }`}
        >
          {status}
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

        <Button 
          className="w-full" 
          onClick={() => onOrder(listing)}
          disabled={status !== 'Active' || daysLeft <= 0}
        >
          <p className='flex'>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Order Now
        </p>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListingCard;
