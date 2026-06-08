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

const SellerDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: '0',
    totalRevenue: '₹0',
    activeListings: '0'
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New product form states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodScientificName, setProdScientificName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodImage, setProdImage] = useState('');
  const [prodLocation, setProdLocation] = useState('');
  const [prodState, setProdState] = useState('');
  const [prodFreshness, setProdFreshness] = useState('fresh');
  const [prodCategory, setProdCategory] = useState('freshwater');
  const [prodDescription, setProdDescription] = useState('');
  const [prodWeight, setProdWeight] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/seller/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      // Fetch orders
      const ordersRes = await fetch('http://localhost:5000/api/seller/orders', {
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
      setLoading(false);
      return;
    }
    fetchDashboardData();
  }, [user, token, authLoading]);

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
        freshness: prodFreshness,
        category: prodCategory,
        description: prodDescription,
        weight: prodWeight || undefined
      };

      const res = await fetch('http://localhost:5000/api/products', {
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
      const res = await fetch(`http://localhost:5000/api/seller/orders/${orderId}/status`, {
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
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>

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

                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" placeholder="https://unsplash.com/..." value={prodImage} onChange={e => setProdImage(e.target.value)} disabled={isCreating} />
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
        </div>

        {/* Stats */}
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

        {/* Recent Orders */}
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
      </div>
    </main>
  );
};

export default SellerDashboard;
