import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const stats = [
  { title: 'Total Orders', value: '156', change: '+12%', icon: Package, color: 'text-primary' },
  { title: 'Total Revenue', value: '₹89,420', change: '+8%', icon: DollarSign, color: 'text-accent' },
  { title: 'Active Listings', value: '24', change: '+3', icon: TrendingUp, color: 'text-secondary' },
];

const orders = [
  { id: 'ORD001', customer: 'Rahul Sharma', items: 'Rohu (2kg), Catla (1kg)', total: '₹880', status: 'Delivered' },
  { id: 'ORD002', customer: 'Priya Patel', items: 'Pomfret (1.5kg)', total: '₹1,275', status: 'Shipped' },
  { id: 'ORD003', customer: 'Amit Kumar', items: 'Tiger Prawns (1kg)', total: '₹780', status: 'Processing' },
  { id: 'ORD004', customer: 'Sneha Gupta', items: 'Hilsa (2kg)', total: '₹3,000', status: 'Pending' },
];

const SellerDashboard = () => (
  <main className="min-h-screen pt-24 pb-16 bg-muted/30">
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Bengal Fresh Fish!</p>
        </div>
        <Button className="btn-gradient text-accent-foreground"><Plus className="w-4 h-4 mr-2" />Add New Listing</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card-solid">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-sm text-accent mt-1">{stat.change} this month</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{order.items}</TableCell>
                  <TableCell className="font-semibold">{order.total}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Delivered' ? 'default' : order.status === 'Shipped' ? 'secondary' : 'outline'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </main>
);

export default SellerDashboard;
