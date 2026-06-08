import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "./StarRating";
import { Review, getAverageRating } from "@/data/reviews";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface ReviewsSectionProps {
  reviews: Review[];
  type: "product" | "seller";
  targetId: string;
  targetName: string;
  onReviewAdded?: () => void;
}

export const ReviewsSection = ({ reviews, type, targetId, targetName, onReviewAdded }: ReviewsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>(reviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    setDisplayedReviews(reviews);
  }, [reviews]);

  const averageRating = getAverageRating(displayedReviews);
  const totalReviews = displayedReviews.length;

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: displayedReviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (displayedReviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0,
  }));

  const handleSort = (value: string) => {
    setSortBy(value);
    let sorted = [...displayedReviews];
    switch (value) {
      case "recent":
        sorted = sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "highest":
        sorted = sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        sorted = sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        sorted = sorted.sort((a, b) => b.helpful - a.helpful);
        break;
    }
    setDisplayedReviews(sorted);
  };

  const handleNewReview = async (review: { rating: number; title: string; comment: string }) => {
    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${type}/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(review)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      toast.success("Review submitted successfully!");
      setShowForm(false);
      
      if (onReviewAdded) {
        onReviewAdded();
      } else {
        // Fallback local update
        setDisplayedReviews(prev => [data, ...prev]);
      }
    } catch (err: any) {
      console.warn("API review submission failed, falling back to mock:", err);
      // Fallback local mock update if offline
      const mockNewReview: Review = {
        id: 'r_mock_' + Date.now(),
        productId: type === 'product' ? targetId : undefined,
        sellerId: type === 'seller' ? targetId : undefined,
        userId: user?.id?.toString() || 'u_mock',
        userName: user?.name || 'Guest User',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        helpful: 0,
        verified: true
      };
      setDisplayedReviews(prev => [mockNewReview, ...prev]);
      toast.success("Review added locally!");
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center lg:border-r lg:border-ocean-100 lg:pr-8">
            <span className="text-5xl font-bold text-foreground">{averageRating || "0"}</span>
            <StarRating rating={Math.round(averageRating)} size="md" />
            <p className="text-sm text-muted-foreground mt-2">
              Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-12 text-sm text-muted-foreground">{rating} star</span>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="w-8 text-sm text-muted-foreground text-right">{count}</span>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <div className="flex flex-col items-center justify-center lg:border-l lg:border-ocean-100 lg:pl-8">
            <Button
              onClick={() => {
                if (!token) {
                  toast.error("Please login to write a review");
                  return;
                }
                setShowForm(!showForm);
              }}
              className="bg-fresh-500 hover:bg-fresh-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Write a Review
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Share your experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          type={type}
          targetId={targetId}
          targetName={targetName}
          onSubmit={handleNewReview}
        />
      )}

      {/* Reviews List */}
      {totalReviews > 0 && (
        <div>
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Customer Reviews ({totalReviews})
            </h3>
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-40 bg-white/50 border-ocean-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reviews Grid */}
          <div className="grid gap-4">
            {displayedReviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalReviews === 0 && !showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-8 text-center"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-ocean-300" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to review {targetName}!
          </p>
          <Button
            onClick={() => {
              if (!token) {
                toast.error("Please login to write a review");
                return;
              }
              setShowForm(true);
            }}
            className="bg-ocean-500 hover:bg-ocean-600 text-white"
          >
            Write a Review
          </Button>
        </motion.div>
      )}
    </div>
  );
};
