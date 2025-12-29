import { Link } from 'react-router-dom';
import { Fish, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Signup = () => (
  <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
    <div className="w-full max-w-md px-4">
      <div className="glass-card-solid rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-xl mb-4"><Fish className="w-8 h-8 text-primary" /></div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join India's #1 Fish Marketplace</p>
        </div>
        <form className="space-y-4">
          <div><Label htmlFor="name">Full Name</Label><div className="relative mt-1"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="name" placeholder="John Doe" className="pl-10" /></div></div>
          <div><Label htmlFor="email">Email</Label><div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="email" type="email" placeholder="you@example.com" className="pl-10" /></div></div>
          <div><Label htmlFor="password">Password</Label><div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="password" type="password" placeholder="••••••••" className="pl-10" /></div></div>
          <div><Label>I want to</Label><RadioGroup defaultValue="buyer" className="flex gap-4 mt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="buyer" id="buyer" /><Label htmlFor="buyer" className="font-normal">Buy Fish</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="seller" id="seller" /><Label htmlFor="seller" className="font-normal">Sell Fish</Label></div></RadioGroup></div>
          <Button className="w-full btn-gradient text-accent-foreground" size="lg">Create Account <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link></p>
      </div>
    </div>
  </main>
);

export default Signup;
