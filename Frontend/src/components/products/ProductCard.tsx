import { motion } from 'framer-motion';
import { MapPin, Star, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const freshnessStyles = {
    fresh: 'badge-fresh',
    live: 'badge-live',
    frozen: 'badge-frozen',
  };

  return (
    <div className="product-card group glass-card-solid rounded-2xl overflow-hidden">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="product-image w-full h-full object-cover transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className={cn('text-xs font-medium', freshnessStyles[product.freshness])}>
            {product.freshness === 'fresh' ? '🌿 Fresh Today' : product.freshness === 'live' ? '🔴 Live Stock' : '❄️ Frozen'}
          </Badge>
        </div>
        {product.seller.verified && (
          <div className="absolute top-3 right-3">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
              <Check className="w-3 h-3" />
            </div>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
          {product.scientificName && (
            <p className="text-xs text-muted-foreground italic">{product.scientificName}</p>
          )}
        </Link>

        <div className="flex items-center justify-between">
          <Link 
            to={`/seller/seller-${(parseInt(product.seller.id.replace('s', '')) % 4) + 1}`}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ocean-600 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{product.location}</span>
          </Link>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{product.seller.rating}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            <span className="text-sm text-muted-foreground">/{product.unit}</span>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              'transition-all duration-300',
              added ? 'bg-accent text-accent-foreground' : 'btn-gradient text-accent-foreground'
            )}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            <span className="ml-1">{added ? 'Added!' : 'Add'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
