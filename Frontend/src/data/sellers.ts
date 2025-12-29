export interface Seller {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  memberSince: string;
  description: string;
  specialties: string[];
  totalSales: number;
  responseTime: string;
}

export const sellers: Seller[] = [
  {
    id: "seller-1",
    name: "Mumbai Fresh Fisheries",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    totalReviews: 234,
    verified: true,
    memberSince: "January 2022",
    description: "We are a family-owned fishery with over 20 years of experience in providing the freshest catch from the Arabian Sea. Our commitment to quality and sustainability sets us apart.",
    specialties: ["Pomfret", "Surmai", "Prawns", "Crabs"],
    totalSales: 1250,
    responseTime: "Usually responds within 1 hour",
  },
  {
    id: "seller-2",
    name: "Kerala Coastal Catch",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Kochi, Kerala",
    rating: 4.9,
    totalReviews: 189,
    verified: true,
    memberSince: "March 2021",
    description: "Direct from the backwaters of Kerala, we bring you the finest seafood including the famous Kerala prawns and pearl spot fish. Freshness guaranteed!",
    specialties: ["Pearl Spot", "Kerala Prawns", "Mussels", "Squid"],
    totalSales: 980,
    responseTime: "Usually responds within 30 minutes",
  },
  {
    id: "seller-3",
    name: "Bengal Bay Traders",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Kolkata, West Bengal",
    rating: 4.6,
    totalReviews: 156,
    verified: true,
    memberSince: "August 2022",
    description: "Specializing in freshwater fish from the Ganges delta. Our Hilsa and Rohu are famous across the country for their authentic taste and freshness.",
    specialties: ["Hilsa", "Rohu", "Catla", "Bhetki"],
    totalSales: 720,
    responseTime: "Usually responds within 2 hours",
  },
  {
    id: "seller-4",
    name: "Goa Seafood Hub",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    location: "Panaji, Goa",
    rating: 4.7,
    totalReviews: 98,
    verified: false,
    memberSince: "November 2023",
    description: "Fresh catches from the Goan coastline. We specialize in exotic seafood varieties that are perfect for coastal cuisine lovers.",
    specialties: ["Kingfish", "Red Snapper", "Lobster", "Oysters"],
    totalSales: 340,
    responseTime: "Usually responds within 3 hours",
  },
];

export const getSellerById = (id: string): Seller | undefined => {
  return sellers.find(seller => seller.id === id);
};
