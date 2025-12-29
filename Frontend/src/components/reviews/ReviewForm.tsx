import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  type: "product" | "seller";
  targetId: string;
  targetName: string;
  onSubmit?: (review: { rating: number; title: string; comment: string }) => void;
}

export const ReviewForm = ({ type, targetId, targetName, onSubmit }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (title.trim().length < 3 || title.trim().length > 100) {
      toast({
        title: "Invalid title",
        description: "Title must be between 3 and 100 characters.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10 || comment.trim().length > 500) {
      toast({
        title: "Invalid review",
        description: "Review must be between 10 and 500 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit?.({ rating, title: title.trim(), comment: comment.trim() });

    toast({
      title: "Review submitted!",
      description: `Thank you for reviewing ${targetName}.`,
    });

    // Reset form
    setRating(0);
    setTitle("");
    setComment("");
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-foreground mb-4">
        Write a Review for {targetName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Rating
          </label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Review Title
          </label>
          <Input
            placeholder="Summarize your experience"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="bg-white/50 border-ocean-200 focus:border-ocean-400"
          />
          <p className="text-xs text-muted-foreground mt-1">{title.length}/100 characters</p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Review
          </label>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={4}
            className="bg-white/50 border-ocean-200 focus:border-ocean-400 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{comment.length}/500 characters</p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-ocean-500 hover:bg-ocean-600 text-white"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
