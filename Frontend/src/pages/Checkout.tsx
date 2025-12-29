import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-accent" /></div>
          <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
          <p className="text-muted-foreground mb-6">Your fresh fish will be delivered soon.</p>
          <Button asChild><Link to="/marketplace">Continue Shopping</Link></Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card-solid">
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Shipping Address</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4"><div><Label>First Name</Label><Input placeholder="John" /></div><div><Label>Last Name</Label><Input placeholder="Doe" /></div></div>
                <div><Label>Address</Label><Input placeholder="123 Street Name" /></div>
                <div className="grid sm:grid-cols-3 gap-4"><div><Label>City</Label><Input placeholder="Mumbai" /></div><div><Label>State</Label><Input placeholder="Maharashtra" /></div><div><Label>PIN Code</Label><Input placeholder="400001" /></div></div>
                <div><Label>Phone</Label><Input placeholder="+91 98765 43210" /></div>
              </CardContent>
            </Card>
            <Card className="glass-card-solid">
              <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Payment</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">Cash on Delivery available for all orders.</p></CardContent>
            </Card>
          </div>
          <div>
            <Card className="glass-card-solid sticky top-24">
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm"><span>{item.product.name} x{item.quantity}</span><span>₹{item.product.price * item.quantity}</span></div>
                ))}
                <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">₹{totalPrice}</span></div>
                <Button className="w-full btn-gradient text-accent-foreground" size="lg" onClick={handlePlaceOrder}>Place Order</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
