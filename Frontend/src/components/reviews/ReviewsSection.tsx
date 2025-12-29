import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "./StarRating";
import { Review, getAverageRating } from "@/data/reviews";

interface ReviewsSectionProps {
  reviews: Review[];
  type: "product" | "seller";
  targetId: string;
  targetName: string;
}

export const ReviewsSection = ({ reviews, type, targetId, targetName }: ReviewsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>(reviews);

  const averageRating = getAverageRating(reviews);
  const totalReviews = reviews.length;

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0,
  }));

  const handleSort = (value: string) => {
    setSortBy(value);
    let sorted = [...reviews];
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

  const handleNewReview = (review: { rating: number; title: string; comment: string }) => {
    setShowForm(false);
    // In a real app, this would add to the database
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
              onClick={() => setShowForm(!showForm)}
              className="bg-fresh-500 hover:bg-fresh-600 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
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
            onClick={() => setShowForm(true)}
            className="bg-ocean-500 hover:bg-ocean-600 text-white"
          >
            Write a Review
          </Button>
        </motion.div>
      )}
    </div>
  );
};
