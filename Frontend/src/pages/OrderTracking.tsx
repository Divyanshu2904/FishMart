import { useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, Home, ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

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

const sampleOrder: OrderStatus = {
  id: "FM-2024-001234",
  status: "shipped",
  orderDate: "December 25, 2024",
  estimatedDelivery: "December 28, 2024",
  items: [
    { name: "Fresh Rohu Fish", quantity: 2, price: 280 },
    { name: "Live Prawns", quantity: 1, price: 450 },
    { name: "Salmon Fillet", quantity: 1, price: 890 },
  ],
  shippingAddress: "123 Marine Drive, Mumbai, Maharashtra 400001",
  timeline: [
    { status: "Order Placed", date: "Dec 25", time: "10:30 AM", completed: true, current: false },
    { status: "Order Confirmed", date: "Dec 25", time: "11:15 AM", completed: true, current: false },
    { status: "Shipped", date: "Dec 26", time: "09:00 AM", completed: true, current: true },
    { status: "Delivered", date: "Dec 28", time: "Expected", completed: false, current: false },
  ],
};

const statusIcons = {
  "Order Placed": Package,
  "Order Confirmed": CheckCircle,
  "Shipped": Truck,
  "Delivered": Home,
};

const OrderTracking = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(sampleOrder);
  const [isTracking, setIsTracking] = useState(true);

  const handleTrackOrder = () => {
    if (orderId.trim()) {
      setIsTracking(true);
      setOrder(sampleOrder);
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
              placeholder="Enter Order ID (e.g., FM-2024-001234)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-white/50 border-ocean-200 focus:border-ocean-400"
            />
            <Button onClick={handleTrackOrder} className="bg-fresh-500 hover:bg-fresh-600 text-white">
              Track Order
            </Button>
          </div>
        </motion.div>

        {/* Order Details */}
        {isTracking && order && (
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
                  <p className="text-xl font-bold text-ocean-700">{order.id}</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full bg-ocean-100 text-ocean-700 font-medium text-sm">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                  <span className="truncate">{order.shippingAddress}</span>
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
                            {step.date} • {step.time}
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
                    <p className="font-semibold text-ocean-700">₹{item.price * item.quantity}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-ocean-200 flex justify-between items-center">
                <span className="font-medium text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-ocean-700">
                  ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}
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
