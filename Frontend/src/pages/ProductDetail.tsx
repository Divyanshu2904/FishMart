import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, ShoppingCart, Check, ShieldCheck, Truck, Clock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProductReviews } from "@/data/reviews";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { products as mockProducts } from "@/data/products";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/product/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      } else {
        throw new Error('Reviews API failed');
      }
    } catch (err) {
      console.warn('Error fetching reviews, using mock data:', err);
      setReviewsList(getProductReviews(productId || ""));
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      
      const loadProductData = async (lat?: number, lon?: number) => {
        try {
          let url = `${API_BASE}/api/products/${productId}`;
          if (lat !== undefined && lon !== undefined) {
            url += `?userLat=${lat}&userLon=${lon}`;
          }
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setProduct(data);
          } else {
            throw new Error('API failed');
          }
        } catch (err) {
          console.error('Error fetching product details, falling back to mock:', err);
          const localProd = mockProducts.find(p => p.id === productId);
          if (localProd) {
            const fallbackSeller = {
              id: localProd.sellerId || "s1",
              name: "Bengal Fresh Fish",
              rating: 4.8,
              verified: true
            };
            setProduct({
              ...localProd,
              seller: localProd.seller || fallbackSeller
            });
          }
        } finally {
          setLoading(false);
        }
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            loadProductData(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            loadProductData();
          },
          { timeout: 3000 }
        );
      } else {
        loadProductData();
      }
    };

    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </main>
    );
  }

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
              <span className="text-muted-foreground">({reviewsList.length} reviews)</span>
            </div>

            {/* Price */}
            <div className="glass-card p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-ocean-600">₹{product.price}</span>
                <span className="text-lg text-muted-foreground">/{product.unit}</span>
              </div>
              
              {/* Delivery Availability Badge */}
              <div className="mt-3">
                {product.distance !== undefined ? (
                  product.distance < 50 ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🟢 Fast Delivery Available (within 2 hours)
                    </Badge>
                  ) : product.distance < 150 ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🟢 Same Day Delivery Available
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                      🚚 Next Day Delivery (Distance: {product.distance} km)
                    </Badge>
                  )
                ) : (
                  <Badge className="bg-ocean-50 text-ocean-700 border border-ocean-200">
                    🟢 Delivery available in your area
                  </Badge>
                )}
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
                  <p className="font-medium text-foreground">
                    {product.distance !== undefined ? (
                      product.distance < 50 ? "Same Day (2-4 hrs)" :
                      product.distance < 150 ? "Same Day (6-8 hrs)" :
                      "Next Day Delivery"
                    ) : "Same Day Delivery"}
                  </p>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <Link
              to={`/seller/${product.seller.id}`}
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
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-ocean-500 rotate-180" />
            </Link>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4">
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

              {/* WhatsApp Seller Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-full border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-semibold flex items-center justify-center gap-2"
                onClick={() => {
                  const message = encodeURIComponent(`Hi, I am interested in purchasing "${product.name}" from FishMart. Is it available?`);
                  window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
                }}
              >
                <svg className="w-5 h-5 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.861-1.868-4.339-2.897-6.97-2.899-5.443 0-9.87 4.384-9.874 9.815-.002 1.97.518 3.893 1.51 5.619l-.99 3.613 3.72-.961zm11.46-5.834c-.244-.122-1.443-.712-1.667-.794-.223-.081-.387-.122-.549.122-.162.244-.63.794-.772.955-.143.162-.285.183-.529.061-.244-.122-.962-.355-1.83-1.129-.675-.602-1.13-1.346-1.262-1.57-.132-.224-.014-.345.108-.466.11-.11.244-.285.366-.427.122-.142.162-.244.244-.407.081-.162.041-.305-.021-.427-.061-.122-.549-1.32-.752-1.81-.197-.475-.398-.411-.549-.419-.142-.007-.305-.008-.468-.008-.162 0-.427.061-.65.305-.224.244-.854.834-.854 2.035 0 1.201.874 2.36 1.006 2.532.132.172 1.72 2.628 4.167 3.682.583.251 1.038.4 1.393.513.585.186 1.117.16 1.538.097.469-.071 1.443-.59 1.647-1.16.203-.57.203-1.057.142-1.16-.061-.101-.223-.162-.467-.284z"/>
                </svg>
                Chat with Seller on WhatsApp
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
            reviews={reviewsList}
            type="product"
            targetId={product.id}
            targetName={product.name}
            onReviewAdded={fetchReviews}
          />
        </motion.div>
      </div>
    </main>
  );
};

export default ProductDetail;
