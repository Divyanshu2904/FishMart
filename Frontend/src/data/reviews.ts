export interface Review {
  id: string;
  productId?: string;
  sellerId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    sellerId: "seller-1",
    userId: "u1",
    userName: "Rajesh Kumar",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    title: "Extremely fresh and tasty!",
    comment: "The Rohu was incredibly fresh, just as described. It arrived well-packed with ice. The taste was amazing in our fish curry. Will definitely order again!",
    date: "December 20, 2024",
    helpful: 12,
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    sellerId: "seller-1",
    userId: "u2",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face",
    rating: 4,
    title: "Good quality, slight delay",
    comment: "Fish quality was excellent and very fresh. However, delivery was delayed by a few hours. Overall satisfied with the purchase.",
    date: "December 18, 2024",
    helpful: 8,
    verified: true,
  },
  {
    id: "r3",
    productId: "3",
    sellerId: "seller-2",
    userId: "u3",
    userName: "Amit Patel",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    title: "Best Pomfret I've ever had!",
    comment: "Premium quality pomfret, exactly as shown in pictures. The seller was very responsive and helped me choose the right size. Highly recommended!",
    date: "December 15, 2024",
    helpful: 15,
    verified: true,
  },
  {
    id: "r4",
    productId: "5",
    sellerId: "seller-3",
    userId: "u4",
    userName: "Sunita Menon",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    title: "Live prawns were fantastic!",
    comment: "Ordered live tiger prawns for a family gathering. They arrived alive and kicking! Everyone loved the freshness. Kerala Seafood Hub is now my go-to for prawns.",
    date: "December 12, 2024",
    helpful: 20,
    verified: true,
  },
  {
    id: "r5",
    productId: "4",
    sellerId: "seller-4",
    userId: "u5",
    userName: "Vikram Singh",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    rating: 3,
    title: "Average experience",
    comment: "The fish was okay, but I expected better for the price. Packaging could be improved. May try again.",
    date: "December 10, 2024",
    helpful: 5,
    verified: false,
  },
  {
    id: "r6",
    sellerId: "seller-1",
    userId: "u6",
    userName: "Meera Das",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    title: "Excellent seller!",
    comment: "Mumbai Fresh Fisheries never disappoints. I've been ordering from them for 6 months now. Always fresh, always on time. Their customer service is top-notch!",
    date: "December 8, 2024",
    helpful: 25,
    verified: true,
  },
  {
    id: "r7",
    sellerId: "seller-2",
    userId: "u7",
    userName: "Arjun Nair",
    userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=face",
    rating: 4,
    title: "Great variety, good prices",
    comment: "Kerala Coastal Catch has an impressive selection of seafood. Prices are fair and quality is consistent. Would love to see more shellfish options.",
    date: "December 5, 2024",
    helpful: 10,
    verified: true,
  },
];

export const getProductReviews = (productId: string): Review[] => {
  return reviews.filter(r => r.productId === productId);
};

export const getSellerReviews = (sellerId: string): Review[] => {
  return reviews.filter(r => r.sellerId === sellerId);
};

export const getAverageRating = (reviewsList: Review[]): number => {
  if (reviewsList.length === 0) return 0;
  const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviewsList.length) * 10) / 10;
};
