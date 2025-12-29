import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, ShoppingCart, Check, ShieldCheck, Truck, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products } from "@/data/products";
import { getProductReviews } from "@/data/reviews";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = products.find(p => p.id === productId);
  const reviews = getProductReviews(productId || "");
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/marketplace">
            <Button className="bg-ocean-500 hover:bg-ocean-600">Back to Marketplace</Button>
          </Link>
        </div>
      </main>
    );
  }

  const freshnessStyles = {
    fresh: "bg-fresh-100 text-fresh-700",
    live: "bg-red-100 text-red-700",
    frozen: "bg-blue-100 text-blue-700",
  };

  const freshnessLabels = {
    fresh: "🌿 Fresh Today",
    live: "🔴 Live Stock",
    frozen: "❄️ Frozen",
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/marketplace">
            <Button variant="ghost" className="mb-6 text-ocean-600 hover:text-ocean-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </motion.div>

        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-4 rounded-2xl overflow-hidden"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 lg:h-96 object-cover rounded-xl"
              />
              <Badge className={cn("absolute top-4 left-4", freshnessStyles[product.freshness])}>
                {freshnessLabels[product.freshness]}
              </Badge>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.scientificName && (
                <p className="text-muted-foreground italic">{product.scientificName}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-700">{product.seller.rating}</span>
              </div>
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="glass-card p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-ocean-600">₹{product.price}</span>
                <span className="text-lg text-muted-foreground">/{product.unit}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-ocean-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{product.location}, {product.state}</p>
                </div>
              </div>
              <div className="glass-card p-3 flex items-center gap-3">
                <Truck className="w-5 h-5 text-ocean-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium text-foreground">Same Day</p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <Link
              to={`/seller/seller-${(parseInt(product.seller.id.replace("s", "")) % 4) + 1}`}
              className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ocean-400 to-teal-400 flex items-center justify-center text-white font-bold">
                  {product.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{product.seller.name}</span>
                    {product.seller.verified && (
                      <ShieldCheck className="w-4 h-4 text-fresh-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">View Seller Profile</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ocean-500 rotate-180" />
            </Link>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center glass-card rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-lg font-semibold hover:bg-ocean-50 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-3 font-semibold text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 text-lg font-semibold hover:bg-ocean-50 transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                size="lg"
                className={cn(
                  "flex-1 text-lg py-6 transition-all",
                  added ? "bg-fresh-500 hover:bg-fresh-600" : "bg-ocean-500 hover:bg-ocean-600"
                )}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>
          <ReviewsSection
            reviews={reviews}
            type="product"
            targetId={product.id}
            targetName={product.name}
          />
        </motion.div>
      </div>
    </main>
  );
};

export default ProductDetail;
