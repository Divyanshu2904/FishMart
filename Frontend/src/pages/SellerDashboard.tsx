import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, Plus, Eye, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const SellerDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: '0',
    totalRevenue: '₹0',
    activeListings: '0'
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'listings'>('orders');

  // New product form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodScientificName, setProdScientificName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodImage, setProdImage] = useState('');
  const [prodLocation, setProdLocation] = useState('');
  const [prodState, setProdState] = useState('');
  const [prodLatitude, setProdLatitude] = useState('');
  const [prodLongitude, setProdLongitude] = useState('');
  const [prodDeliveryRadius, setProdDeliveryRadius] = useState('100');
  const [prodFreshness, setProdFreshness] = useState('fresh');
  const [prodCategory, setProdCategory] = useState('freshwater');
  const [prodDescription, setProdDescription] = useState('');
  const [prodWeight, setProdWeight] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit product states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editScientificName, setEditScientificName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editUnit, setEditUnit] = useState('kg');
  const [editImage, setEditImage] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editState, setEditState] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editDeliveryRadius, setEditDeliveryRadius] = useState('100');
  const [editFreshness, setEditFreshness] = useState('fresh');
  const [editCategory, setEditCategory] = useState('freshwater');
  const [editDescription, setEditDescription] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editInStock, setEditInStock] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingImage(true);
    try {
      const uploadToken = token || localStorage.getItem('token') || '';
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${uploadToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Image upload failed');
      }

      if (isEditMode) {
        setEditImage(data.imageUrl);
      } else {
        setProdImage(data.imageUrl);
      }
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      console.warn('Upload error, falling back to mock URL:', err);
      const mockUrl = URL.createObjectURL(file);
      if (isEditMode) {
        setEditImage(mockUrl);
      } else {
        setProdImage(mockUrl);
      }
      toast.success('Local preview set (Backend Offline)');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const fetchListings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/seller/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.warn('Backend offline, using mock seller listings:', err);
      setListings([
        { id: '1', name: 'Premium Hilsa (Ilish)', price: 1500, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'saltwater', inStock: true, image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop', description: 'Freshly caught Hilsa from Ganga river. Delicious and rich in taste.' },
        { id: '2', name: 'Freshwater Rohu', price: 280, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'freshwater', inStock: true, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop', description: 'Fresh local pond catch Rohu. High quality and high protein.' }
      ]);
    }
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_BASE}/api/seller/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // Fetch orders
      const ordersRes = await fetch(`${API_BASE}/api/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      if (statsRes.ok) {
        setStats({
          totalOrders: statsData.totalOrders.toString(),
          totalRevenue: statsData.totalRevenue,
          activeListings: statsData.activeListings.toString()
        });
      }
      if (ordersRes.ok) {
        setOrders(ordersData);
      }

      await fetchListings();
    } catch (err) {
      console.warn('Backend offline, using demo dashboard metrics:', err);
      setStats({
        totalOrders: '156',
        totalRevenue: '₹89,420',
        activeListings: '24'
      });
      setOrders([
        { id: 'ORD001', customer: 'Rahul Sharma', items: 'Rohu (2kg), Catla (1kg)', total: '₹880', status: 'Delivered' },
        { id: 'ORD002', customer: 'Priya Patel', items: 'Pomfret (1.5kg)', total: '₹1,275', status: 'Shipped' },
        { id: 'ORD003', customer: 'Amit Kumar', items: 'Tiger Prawns (1kg)', total: '₹780', status: 'Processing' },
        { id: 'ORD004', customer: 'Sneha Gupta', items: 'Hilsa (2kg)', total: '₹3,000', status: 'Pending' },
      ]);
      setListings([
        { id: '1', name: 'Premium Hilsa (Ilish)', price: 1500, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'saltwater', inStock: true, image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop', description: 'Freshly caught Hilsa from Ganga river. Delicious and rich in taste.' },
        { id: '2', name: 'Freshwater Rohu', price: 280, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'freshwater', inStock: true, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop', description: 'Fresh local pond catch Rohu. High quality and high protein.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'seller') {
      // Load mock dashboard data for demonstration/explore mode
      setStats({
        totalOrders: '156',
        totalRevenue: '₹89,420',
        activeListings: '24'
      });
      setOrders([
        { id: 'ORD001', customer: 'Rahul Sharma', items: 'Rohu (2kg), Catla (1kg)', total: '₹880', status: 'Delivered' },
        { id: 'ORD002', customer: 'Priya Patel', items: 'Pomfret (1.5kg)', total: '₹1,275', status: 'Shipped' },
        { id: 'ORD003', customer: 'Amit Kumar', items: 'Tiger Prawns (1kg)', total: '₹780', status: 'Processing' },
        { id: 'ORD004', customer: 'Sneha Gupta', items: 'Hilsa (2kg)', total: '₹3,000', status: 'Pending' },
      ]);
      setListings([
        { id: '1', name: 'Premium Hilsa (Ilish)', price: 1500, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'saltwater', inStock: true, image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&h=300&fit=crop', description: 'Freshly caught Hilsa from Ganga river. Delicious and rich in taste.' },
        { id: '2', name: 'Freshwater Rohu', price: 280, unit: 'kg', location: 'Kolkata', state: 'West Bengal', freshness: 'fresh', category: 'freshwater', inStock: true, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400&h=300&fit=crop', description: 'Fresh local pond catch Rohu. High quality and high protein.' }
      ]);
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user, token, authLoading]);

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditScientificName(product.scientificName || '');
    setEditPrice(product.price.toString());
    setEditUnit(product.unit || 'kg');
    setEditWeight(product.weight || '');
    setEditLocation(product.location);
    setEditState(product.state);
    setEditLatitude(product.latitude ? product.latitude.toString() : '');
    setEditLongitude(product.longitude ? product.longitude.toString() : '');
    setEditDeliveryRadius(product.deliveryRadius ? product.deliveryRadius.toString() : '100');
    setEditFreshness(product.freshness);
    setEditCategory(product.category);
    setEditDescription(product.description || '');
    setEditImage(product.image || '');
    setEditInStock(product.inStock ?? true);
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsUpdating(true);
    try {
      const payload = {
        name: editName,
        scientificName: editScientificName,
        price: parseFloat(editPrice),
        unit: editUnit,
        image: editImage,
        location: editLocation,
        state: editState,
        latitude: editLatitude !== '' ? parseFloat(editLatitude) : undefined,
        longitude: editLongitude !== '' ? parseFloat(editLongitude) : undefined,
        deliveryRadius: editDeliveryRadius !== '' ? parseInt(editDeliveryRadius) : 100,
        freshness: editFreshness,
        category: editCategory,
        description: editDescription,
        weight: editWeight || undefined,
        inStock: editInStock
      };

      const res = await fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      toast.success('Listing updated successfully!');
      setIsEditOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      console.warn('Backend offline, updating local mock state:', err);
      setListings(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: editName,
        scientificName: editScientificName,
        price: parseFloat(editPrice),
        unit: editUnit,
        image: editImage,
        location: editLocation,
        state: editState,
        freshness: editFreshness,
        category: editCategory,
        description: editDescription,
        weight: editWeight || undefined,
        inStock: editInStock
      } : p));
      toast.success('Listing updated successfully! (Demo Mode)');
      setIsEditOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete listing');
      }

      toast.success('Listing deleted successfully!');
      fetchDashboardData();
    } catch (err: any) {
      console.warn('Backend offline, deleting local mock state:', err);
      setListings(prev => prev.filter(p => p.id !== productId));
      toast.success('Listing deleted successfully! (Demo Mode)');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodLocation || !prodState) {
      toast.error('Please enter all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        name: prodName,
        scientificName: prodScientificName,
        price: parseFloat(prodPrice),
        unit: prodUnit,
        image: prodImage || undefined,
        location: prodLocation,
        state: prodState,
        latitude: prodLatitude !== '' ? parseFloat(prodLatitude) : undefined,
        longitude: prodLongitude !== '' ? parseFloat(prodLongitude) : undefined,
        deliveryRadius: prodDeliveryRadius !== '' ? parseInt(prodDeliveryRadius) : 100,
        freshness: prodFreshness,
        category: prodCategory,
        description: prodDescription,
        weight: prodWeight || undefined
      };

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to list product');
      }

      toast.success('Listing created successfully!');
      setIsAddOpen(false);
      // Reset form fields
      setProdName('');
      setProdScientificName('');
      setProdPrice('');
      setProdUnit('kg');
      setProdImage('');
      setProdLocation('');
      setProdState('');
      setProdLatitude('');
      setProdLongitude('');
      setProdDeliveryRadius('100');
      setProdDescription('');
      setProdWeight('');
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Error creating listing');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus.toLowerCase() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      toast.success(`Order status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Error updating order status');
    }
  };

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  const statItems = [
    { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-primary' },
    { title: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, color: 'text-accent' },
    { title: 'Active Listings', value: stats.activeListings, icon: TrendingUp, color: 'text-secondary' },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'Seller'}!</p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gradient text-accent-foreground"><Plus className="w-4 h-4 mr-2" />Add New Listing</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Fish Listing</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 pt-4" onSubmit={handleCreateProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Fish Name *</Label>
                      <Input id="name" placeholder="e.g. Rohu, Pomfret" value={prodName} onChange={e => setProdName(e.target.value)} required disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="scientificName">Scientific Name</Label>
                      <Input id="scientificName" placeholder="e.g. Labeo rohita" value={prodScientificName} onChange={e => setProdScientificName(e.target.value)} disabled={isCreating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input id="price" type="number" placeholder="280" value={prodPrice} onChange={e => setProdPrice(e.target.value)} required disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <Input id="unit" placeholder="kg" value={prodUnit} onChange={e => setProdUnit(e.target.value)} required disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (optional)</Label>
                      <Input id="weight" placeholder="e.g. 1kg - 2kg" value={prodWeight} onChange={e => setProdWeight(e.target.value)} disabled={isCreating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">City/Town *</Label>
                      <Input id="location" placeholder="e.g. Kolkata, Panaji" value={prodLocation} onChange={e => setProdLocation(e.target.value)} required disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" placeholder="e.g. West Bengal, Goa" value={prodState} onChange={e => setProdState(e.target.value)} required disabled={isCreating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude (optional)</Label>
                      <Input id="latitude" placeholder="e.g. 22.5726" value={prodLatitude} onChange={e => setProdLatitude(e.target.value)} disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude (optional)</Label>
                      <Input id="longitude" placeholder="e.g. 88.3639" value={prodLongitude} onChange={e => setProdLongitude(e.target.value)} disabled={isCreating} />
                    </div>
                    <div>
                      <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                      <Input id="deliveryRadius" type="number" placeholder="100" value={prodDeliveryRadius} onChange={e => setProdDeliveryRadius(e.target.value)} disabled={isCreating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Freshness</Label>
                      <Select value={prodFreshness} onValueChange={setProdFreshness} disabled={isCreating}>
                        <SelectTrigger><SelectValue placeholder="Freshness" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresh">Fresh Today</SelectItem>
                          <SelectItem value="live">Live Stock</SelectItem>
                          <SelectItem value="frozen">Frozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={prodCategory} onValueChange={setProdCategory} disabled={isCreating}>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freshwater">Freshwater</SelectItem>
                          <SelectItem value="saltwater">Saltwater</SelectItem>
                          <SelectItem value="shellfish">Shellfish</SelectItem>
                          <SelectItem value="prawns">Prawns</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input id="image" placeholder="https://unsplash.com/..." value={prodImage} onChange={e => setProdImage(e.target.value)} disabled={isCreating || isUploadingImage} />
                    </div>
                    <div>
                      <Label htmlFor="upload-image">Or Upload File</Label>
                      <div className="relative">
                        <Input
                          id="upload-image"
                          type="file"
                          accept="image/*"
                          onChange={e => handleUploadImage(e, false)}
                          disabled={isCreating || isUploadingImage}
                          className="cursor-pointer file:text-primary file:font-semibold"
                        />
                        {isUploadingImage && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Provide details about freshness, source, or recipe ideas..." value={prodDescription} onChange={e => setProdDescription(e.target.value)} rows={3} disabled={isCreating} />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isCreating}>Cancel</Button>
                    <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/95 text-white">
                      {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      List Fish Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Fish Listing</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 pt-4" onSubmit={handleUpdateProduct}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editName">Fish Name *</Label>
                      <Input id="editName" placeholder="e.g. Rohu, Pomfret" value={editName} onChange={e => setEditName(e.target.value)} required disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editScientificName">Scientific Name</Label>
                      <Input id="editScientificName" placeholder="e.g. Labeo rohita" value={editScientificName} onChange={e => setEditScientificName(e.target.value)} disabled={isUpdating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editPrice">Price (₹) *</Label>
                      <Input id="editPrice" type="number" placeholder="280" value={editPrice} onChange={e => setEditPrice(e.target.value)} required disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editUnit">Unit *</Label>
                      <Input id="editUnit" placeholder="kg" value={editUnit} onChange={e => setEditUnit(e.target.value)} required disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editWeight">Weight (optional)</Label>
                      <Input id="editWeight" placeholder="e.g. 1kg - 2kg" value={editWeight} onChange={e => setEditWeight(e.target.value)} disabled={isUpdating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editLocation">City/Town *</Label>
                      <Input id="editLocation" placeholder="e.g. Kolkata, Panaji" value={editLocation} onChange={e => setEditLocation(e.target.value)} required disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editState">State *</Label>
                      <Input id="editState" placeholder="e.g. West Bengal, Goa" value={editState} onChange={e => setEditState(e.target.value)} required disabled={isUpdating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="editLatitude">Latitude (optional)</Label>
                      <Input id="editLatitude" placeholder="e.g. 22.5726" value={editLatitude} onChange={e => setEditLatitude(e.target.value)} disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editLongitude">Longitude (optional)</Label>
                      <Input id="editLongitude" placeholder="e.g. 88.3639" value={editLongitude} onChange={e => setEditLongitude(e.target.value)} disabled={isUpdating} />
                    </div>
                    <div>
                      <Label htmlFor="editDeliveryRadius">Delivery Radius (km)</Label>
                      <Input id="editDeliveryRadius" type="number" placeholder="100" value={editDeliveryRadius} onChange={e => setEditDeliveryRadius(e.target.value)} disabled={isUpdating} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Freshness</Label>
                      <Select value={editFreshness} onValueChange={setEditFreshness} disabled={isUpdating}>
                        <SelectTrigger><SelectValue placeholder="Freshness" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fresh">Fresh Today</SelectItem>
                          <SelectItem value="live">Live Stock</SelectItem>
                          <SelectItem value="frozen">Frozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={editCategory} onValueChange={setEditCategory} disabled={isUpdating}>
                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freshwater">Freshwater</SelectItem>
                          <SelectItem value="saltwater">Saltwater</SelectItem>
                          <SelectItem value="shellfish">Shellfish</SelectItem>
                          <SelectItem value="prawns">Prawns</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="editInStock"
                      checked={editInStock}
                      onChange={e => setEditInStock(e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                      disabled={isUpdating}
                    />
                    <Label htmlFor="editInStock" className="cursor-pointer font-medium">Product In Stock</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editImage">Image URL</Label>
                      <Input id="editImage" placeholder="https://unsplash.com/..." value={editImage} onChange={e => setEditImage(e.target.value)} disabled={isUpdating || isUploadingImage} />
                    </div>
                    <div>
                      <Label htmlFor="upload-edit-image">Or Upload File</Label>
                      <div className="relative">
                        <Input
                          id="upload-edit-image"
                          type="file"
                          accept="image/*"
                          onChange={e => handleUploadImage(e, true)}
                          disabled={isUpdating || isUploadingImage}
                          className="cursor-pointer file:text-primary file:font-semibold"
                        />
                        {isUploadingImage && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea id="editDescription" placeholder="Provide details about freshness, source, or recipe ideas..." value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} disabled={isUpdating} />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>Cancel</Button>
                    <Button type="submit" disabled={isUpdating} className="bg-primary hover:bg-primary/95 text-white">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statItems.map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card-solid">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-sm text-accent mt-1">Updated in real-time</p>
                    </div>
                    <div className={`p-4 rounded-xl bg-muted ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Recent Orders
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
              activeTab === 'listings' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Listings
          </button>
        </div>

        {activeTab === 'orders' ? (
          <Card className="glass-card-solid">
            <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No orders received for your listings yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Items</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-bold text-primary">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">{order.items}</TableCell>
                        <TableCell className="font-semibold text-accent">{order.total}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            defaultValue={order.status}
                            onValueChange={(val) => handleUpdateStatus(order.id, val)}
                          >
                            <SelectTrigger className="w-[140px] ml-auto h-8 text-xs">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Placed">Placed</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card-solid">
            <CardHeader><CardTitle>My Fish Listings</CardTitle></CardHeader>
            <CardContent>
              {listings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">You haven't listed any fish products yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Fish Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Freshness</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image || 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=100&h=100&fit=crop'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{product.name}</div>
                          {product.scientificName && (
                            <div className="text-xs text-muted-foreground italic">{product.scientificName}</div>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell className="font-semibold text-primary">₹{product.price}/{product.unit || 'kg'}</TableCell>
                        <TableCell className="capitalize">
                          <Badge variant="outline" className={
                            product.freshness === 'fresh' ? 'border-fresh-500 text-fresh-700 bg-fresh-50' : 
                            product.freshness === 'live' ? 'border-red-500 text-red-700 bg-red-50' : 'border-blue-500 text-blue-700 bg-blue-50'
                          }>
                            {product.freshness}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(product)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default SellerDashboard;
