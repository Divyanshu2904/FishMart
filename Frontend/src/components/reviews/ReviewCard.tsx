import { motion } from "framer-motion";
import { ThumbsUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "./StarRating";
import { Review } from "@/data/reviews";
import { useState } from "react";

interface ReviewCardProps {
  review: Review;
  index?: number;
}

export const ReviewCard = ({ review, index = 0 }: ReviewCardProps) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="w-10 h-10 rounded-full object-cover border-2 border-ocean-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{review.userName}</span>
              {review.verified && (
                <Badge className="bg-fresh-100 text-fresh-700 text-xs px-2 py-0">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Content */}
      <div>
        <h4 className="font-semibold text-foreground mb-1">{review.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-ocean-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHelpful}
          disabled={hasVoted}
          className={`text-muted-foreground hover:text-ocean-600 ${hasVoted ? "text-ocean-600" : ""}`}
        >
          <ThumbsUp className={`w-4 h-4 mr-1.5 ${hasVoted ? "fill-ocean-600" : ""}`} />
          Helpful ({helpfulCount})
        </Button>
      </div>
    </motion.div>
  );
};
