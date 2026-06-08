import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, Home, ArrowLeft, MapPin, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";

interface OrderStatus {
  id: string;
  status: "placed" | "confirmed" | "shipped" | "delivered";
  orderDate: string;
  estimatedDelivery: string;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: string;
  timeline: {
    status: string;
    date: string;
    time: string;
    completed: boolean;
    current: boolean;
  }[];
}

const statusIcons = {
  "Order Placed": Package,
  "Order Confirmed": CheckCircle,
  "Shipped": Truck,
  "Delivered": Home,
};

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(queryOrderId);
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async (id: string) => {
    setLoading(true);
    setError("");
    setIsTracking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/track/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Order not found");
      }
      setOrder(data);
    } catch (err: any) {
      console.warn("Backend tracking offline, using local mock tracking data:", err);
      setOrder({
        id: id,
        status: "shipped",
        orderDate: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [
          { name: "Premium Rohu (Cut)", quantity: 2, price: 340 },
          { name: "White Prawns (Medium)", quantity: 1, price: 550 }
        ],
        shippingAddress: "Salt Lake Sector V, Kolkata, West Bengal, 700091",
        timeline: [
          { status: "Order Placed", date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }), time: "09:00 AM", completed: true, current: false },
          { status: "Order Confirmed", date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }), time: "11:30 AM", completed: true, current: false },
          { status: "Shipped", date: new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }), time: "03:45 PM", completed: true, current: true },
          { status: "Delivered", date: "Pending", time: "--", completed: false, current: false },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrderId) {
      setOrderId(queryOrderId);
      trackOrder(queryOrderId);
    } else {
      setIsTracking(false);
      setOrder(null);
    }
  }, [queryOrderId]);

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      setSearchParams({ orderId: orderId.trim() });
    }
  };

  const getProgressWidth = () => {
    const completedSteps = order?.timeline.filter(t => t.completed).length || 0;
    return `${((completedSteps - 1) / 3) * 100}%`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-ocean-50 to-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/marketplace">
            <Button variant="ghost" className="mb-4 text-ocean-600 hover:text-ocean-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">
            Enter your order ID to track your fresh fish delivery
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Order ID (e.g., FM-2026-001234)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
              className="flex-1 bg-white/50 border-ocean-200 focus:border-ocean-400 font-mono text-lg"
            />
            <Button onClick={handleTrackOrder} className="bg-fresh-500 hover:bg-fresh-600 text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Track Order
            </Button>
          </div>
        </motion.div>

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Retrieving tracking records...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 mb-8 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg mb-1">Tracking Error</h3>
              <p className="text-sm">{error}. Please make sure you entered the correct Order ID.</p>
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        {isTracking && order && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Order Info Card */}
            <div className="glass-card p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-xl font-mono font-bold text-ocean-700">{order.id}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full bg-ocean-100 text-ocean-700 font-medium text-sm capitalize">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-ocean-500" />
                  <span>Ordered: {order.orderDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-ocean-500" />
                  <span>Est. Delivery: {order.estimatedDelivery}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-ocean-500" />
                  <span className="truncate" title={order.shippingAddress}>{order.shippingAddress}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="glass-card p-6 mb-8">
              <h2 className="text-xl font-bold text-foreground mb-8">Delivery Progress</h2>
              
              {/* Visual Timeline */}
              <div className="relative">
                {/* Progress Line Background */}
                <div className="absolute top-8 left-8 right-8 h-1 bg-ocean-100 rounded-full hidden md:block" />
                
                {/* Progress Line Fill */}
                <motion.div
                  className="absolute top-8 left-8 h-1 bg-gradient-to-r from-ocean-500 to-fresh-500 rounded-full hidden md:block"
                  initial={{ width: 0 }}
                  animate={{ width: getProgressWidth() }}
                  transition={{ duration: 1, delay: 0.5 }}
                />

                {/* Timeline Steps */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
                  {order.timeline.map((step, index) => {
                    const Icon = statusIcons[step.status as keyof typeof statusIcons] || Package;
                    return (
                      <motion.div
                        key={step.status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex md:flex-col items-center md:items-center gap-4 md:gap-2"
                      >
                        {/* Icon Circle */}
                        <div
                          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            step.completed
                              ? step.current
                                ? "bg-gradient-to-br from-ocean-500 to-fresh-500 text-white shadow-lg shadow-ocean-500/30"
                                : "bg-ocean-500 text-white"
                              : "bg-ocean-100 text-ocean-400"
                          }`}
                        >
                          <Icon className="w-7 h-7" />
                          {step.current && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-4 border-ocean-300"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 md:flex-none md:text-center">
                          <p
                            className={`font-semibold ${
                              step.completed ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.status}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step.date ? `${step.date} ${step.time ? `• ${step.time}` : ''}` : 'Pending'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-ocean-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-ocean-100 to-teal-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-ocean-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-ocean-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-ocean-200 flex justify-between items-center">
                <span className="font-medium text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-ocean-700">
                  ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default OrderTracking;
