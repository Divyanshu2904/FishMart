import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  ShieldCheck, 
  Clock,
  Package,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSellerById } from "@/data/sellers";
import { products } from "@/data/products";
import { getSellerReviews } from "@/data/reviews";
import { ProductCard } from "@/components/products/ProductCard";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";

const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const seller = getSellerById(sellerId || "");
  const sellerReviews = getSellerReviews(sellerId || "");

  // Get products for this seller (mock: assign products based on seller index)
  const sellerProducts = products.filter((_, index) => {
    const sellerIndex = parseInt(sellerId?.split("-")[1] || "1") - 1;
    return index % 4 === sellerIndex;
  });

  if (!seller) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Seller Not Found</h1>
          <Link to="/marketplace">
            <Button className="bg-ocean-500 hover:bg-ocean-600">
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/marketplace">
            <Button variant="ghost" className="mb-6 text-ocean-600 hover:text-ocean-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </motion.div>

        {/* Seller Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {seller.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-fresh-500 text-white p-2 rounded-full shadow-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {seller.name}
                </h1>
                {seller.verified && (
                  <Badge className="bg-fresh-100 text-fresh-700 hover:bg-fresh-100">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-ocean-500" />
                  {seller.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-ocean-500" />
                  Member since {seller.memberSince}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-700">{seller.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({seller.totalReviews} reviews)
                </span>
              </div>

              <p className="text-muted-foreground mb-4 max-w-2xl">
                {seller.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button className="bg-ocean-500 hover:bg-ocean-600 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" className="border-ocean-300 text-ocean-600 hover:bg-ocean-50">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-ocean-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-ocean-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{seller.rating}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-fresh-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-fresh-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{seller.totalSales}</p>
            <p className="text-sm text-muted-foreground">Total Sales</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-teal-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{sellerProducts.length}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-lg font-bold text-foreground">&lt;1hr</p>
            <p className="text-sm text-muted-foreground">Response Time</p>
          </div>
        </motion.div>

        {/* Specialties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {seller.specialties.map((specialty) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="bg-ocean-100 text-ocean-700 hover:bg-ocean-200 px-4 py-2 text-sm"
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Seller's Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Products by {seller.name}
          </h2>
          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-ocean-300" />
              <p className="text-muted-foreground">No products listed yet</p>
            </div>
          )}
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Seller Reviews</h2>
          <ReviewsSection
            reviews={sellerReviews}
            type="seller"
            targetId={sellerId || ""}
            targetName={seller.name}
          />
        </motion.div>
      </div>
    </main>
  );
};

export default SellerProfile;
