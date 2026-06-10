import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories, locations, products as mockProducts } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('All India');
  const [freshness, setFreshness] = useState('all');
  const [productsList, setProductsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, freshness, location, search, nearMe, minPrice, maxPrice]);

  const handleNearMeToggle = () => {
    if (nearMe) {
      setNearMe(false);
      toast.info("Nearby filter turned off");
      return;
    }

    if (coords) {
      setNearMe(true);
      toast.success("Nearby filter active!");
      return;
    }

    toast.info("Requesting location permissions...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setNearMe(true);
        toast.success("Location detected! Showing nearest sellers.");
      },
      (err) => {
        console.error("Error getting location:", err);
        toast.error("Could not access location. Please check browser permissions.");
        setNearMe(false);
      }
    );
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'all') queryParams.append('category', category);
        if (freshness && freshness !== 'all') queryParams.append('freshness', freshness);
        if (location && location !== 'All India') queryParams.append('state', location);
        if (search) queryParams.append('search', search);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        queryParams.append('page', currentPage.toString());
        queryParams.append('limit', '8');

        if (coords) {
          queryParams.append('userLat', coords.latitude.toString());
          queryParams.append('userLon', coords.longitude.toString());
        }
        if (nearMe && coords) {
          queryParams.append('nearMe', 'true');
        }

        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            setProductsList(data.products || []);
            setTotalPages(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            if (data.length === 0) {
              const localFiltered = mockProducts.filter((p) => {
                const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
                const matchCategory = category === 'all' || p.category === category;
                const matchLocation = location === 'All India' || p.state === location;
                const matchFreshness = freshness === 'all' || p.freshness === freshness;
                const matchMinPrice = !minPrice || p.price >= parseFloat(minPrice);
                const matchMaxPrice = !maxPrice || p.price <= parseFloat(maxPrice);
                return matchSearch && matchCategory && matchLocation && matchFreshness && matchMinPrice && matchMaxPrice;
              });
              setTotalPages(Math.ceil(localFiltered.length / 8) || 1);
              setProductsList(localFiltered.slice((currentPage - 1) * 8, currentPage * 8));
            } else {
              setTotalPages(Math.ceil(data.length / 8) || 1);
              setProductsList(data.slice((currentPage - 1) * 8, currentPage * 8));
            }
          }
        } else {
          throw new Error('API failed');
        }
      } catch (err) {
        console.error('Error fetching products, falling back to mock:', err);
        const localFiltered = mockProducts.filter((p) => {
          const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
          const matchCategory = category === 'all' || p.category === category;
          const matchLocation = location === 'All India' || p.state === location;
          const matchFreshness = freshness === 'all' || p.freshness === freshness;
          const matchMinPrice = !minPrice || p.price >= parseFloat(minPrice);
          const matchMaxPrice = !maxPrice || p.price <= parseFloat(maxPrice);
          return matchSearch && matchCategory && matchLocation && matchFreshness && matchMinPrice && matchMaxPrice;
        });
        setTotalPages(Math.ceil(localFiltered.length / 8) || 1);
        setProductsList(localFiltered.slice((currentPage - 1) * 8, currentPage * 8));
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, freshness, location, search, currentPage, coords, nearMe, minPrice, maxPrice]);

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Fresh Fish Marketplace</h1>
          <p className="text-muted-foreground">Browse the freshest catch from verified sellers across India</p>
        </div>

        {/* Filters */}
        <div className="glass-card-solid rounded-xl p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Search fish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-between w-full lg:w-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>{locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={freshness} onValueChange={setFreshness}>
                <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Freshness" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="fresh">Fresh Today</SelectItem>
                  <SelectItem value="live">Live Stock</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 bg-background/50 border rounded-lg px-2.5 py-1.5 h-10 w-full sm:w-auto">
                <span className="text-xs font-medium text-muted-foreground">Price (₹):</span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-16 h-7 text-xs px-2 border-none shadow-none focus-visible:ring-0"
                />
                <span className="text-muted-foreground text-xs">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-16 h-7 text-xs px-2 border-none shadow-none focus-visible:ring-0"
                />
              </div>
              <Button
                variant={nearMe ? "default" : "outline"}
                onClick={handleNearMeToggle}
                className={
                  nearMe
                    ? "bg-fresh-500 hover:bg-fresh-600 text-white font-medium flex items-center gap-2 h-10 w-full sm:w-auto"
                    : "border-ocean-200 text-ocean-700 hover:bg-ocean-50 flex items-center gap-2 h-10 w-full sm:w-auto"
                }
              >
                <MapPin className={`w-4 h-4 ${nearMe ? "animate-pulse text-white" : "text-ocean-500"}`} />
                {nearMe ? "Near Me" : "Near Me"}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading ? 'Searching...' : `Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Fetching fresh fish from our database...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsList.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {productsList.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">No fish found matching your criteria</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-ocean-600 hover:bg-ocean-700 text-white"
                        : "border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                    }
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Marketplace;
