export interface Product {
  id: string;
  name: string;
  scientificName?: string;
  price: number;
  unit: string;
  image: string;
  location: string;
  state: string;
  freshness: 'fresh' | 'live' | 'frozen';
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  category: 'freshwater' | 'saltwater' | 'shellfish' | 'prawns';
  description: string;
  inStock: boolean;
  weight?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Rohu',
    scientificName: 'Labeo rohita',
    price: 280,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop',
    location: 'Kolkata',
    state: 'West Bengal',
    freshness: 'fresh',
    seller: { id: 's1', name: 'Bengal Fresh Fish', rating: 4.8, verified: true },
    category: 'freshwater',
    description: 'Fresh Rohu fish, locally sourced from Bengal fisheries. Perfect for traditional curries.',
    inStock: true,
  },
  {
    id: '2',
    name: 'Catla',
    scientificName: 'Catla catla',
    price: 320,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1498654200943-1088dd4438ae?w=400&h=300&fit=crop',
    location: 'Patna',
    state: 'Bihar',
    freshness: 'live',
    seller: { id: 's2', name: 'Bihar River Fish', rating: 4.6, verified: true },
    category: 'freshwater',
    description: 'Live Catla fish, known for its tender and flavorful meat. Ideal for special occasions.',
    inStock: true,
  },
  {
    id: '3',
    name: 'Pomfret',
    scientificName: 'Pampus argenteus',
    price: 850,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop',
    location: 'Mumbai',
    state: 'Maharashtra',
    freshness: 'fresh',
    seller: { id: 's3', name: 'Mumbai Sea Catch', rating: 4.9, verified: true },
    category: 'saltwater',
    description: 'Premium white Pomfret, caught fresh from Arabian Sea. Delicate taste and texture.',
    inStock: true,
  },
  {
    id: '4',
    name: 'King Fish (Surmai)',
    scientificName: 'Scomberomorus guttatus',
    price: 650,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    location: 'Goa',
    state: 'Goa',
    freshness: 'fresh',
    seller: { id: 's4', name: 'Goan Fishermen Co-op', rating: 4.7, verified: true },
    category: 'saltwater',
    description: 'Fresh Surmai, a Goan favorite. Perfect for grilling, frying or curry preparations.',
    inStock: true,
  },
  {
    id: '5',
    name: 'Tiger Prawns',
    scientificName: 'Penaeus monodon',
    price: 780,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    location: 'Kochi',
    state: 'Kerala',
    freshness: 'live',
    seller: { id: 's5', name: 'Kerala Seafood Hub', rating: 4.8, verified: true },
    category: 'prawns',
    description: 'Jumbo tiger prawns from Kerala backwaters. Sweet, succulent and perfect for any cuisine.',
    inStock: true,
  },
  {
    id: '6',
    name: 'Salmon',
    scientificName: 'Salmo salar',
    price: 1200,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=300&fit=crop',
    location: 'Chennai',
    state: 'Tamil Nadu',
    freshness: 'frozen',
    seller: { id: 's6', name: 'Premium Imports TN', rating: 4.5, verified: true },
    category: 'saltwater',
    description: 'Imported Atlantic Salmon, flash frozen for freshness. Rich in Omega-3.',
    inStock: true,
  },
  {
    id: '7',
    name: 'Hilsa',
    scientificName: 'Tenualosa ilisha',
    price: 1500,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=300&fit=crop',
    location: 'Kolkata',
    state: 'West Bengal',
    freshness: 'fresh',
    seller: { id: 's1', name: 'Bengal Fresh Fish', rating: 4.8, verified: true },
    category: 'freshwater',
    description: 'The king of fish! Seasonal Hilsa with its distinctive taste. A Bengali delicacy.',
    inStock: true,
  },
  {
    id: '8',
    name: 'Crab (Mud)',
    scientificName: 'Scylla serrata',
    price: 900,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
    location: 'Mangalore',
    state: 'Karnataka',
    freshness: 'live',
    seller: { id: 's7', name: 'Coastal Karnataka Fresh', rating: 4.6, verified: true },
    category: 'shellfish',
    description: 'Live mud crabs, heavy and meaty. Perfect for crab masala or butter garlic preparations.',
    inStock: true,
  },
];

export const categories = [
  { id: 'all', name: 'All Fish', icon: '🐟' },
  { id: 'freshwater', name: 'Freshwater', icon: '🏞️' },
  { id: 'saltwater', name: 'Saltwater', icon: '🌊' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦀' },
  { id: 'prawns', name: 'Prawns', icon: '🦐' },
];

export const locations = [
  'All India',
  'West Bengal',
  'Maharashtra',
  'Kerala',
  'Goa',
  'Tamil Nadu',
  'Karnataka',
  'Bihar',
  'Andhra Pradesh',
  'Odisha',
];
