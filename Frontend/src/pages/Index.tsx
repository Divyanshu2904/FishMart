import { motion } from 'framer-motion';
import { Search, ArrowRight, Truck, Shield, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { products } from '@/data/products';
import { ProductCard } from '@/components/products/ProductCard';

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-aqua-light/10">
    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aqua/5 rounded-full blur-3xl" />
      {/* Fish silhouettes */}
      <motion.div animate={{ x: [0, 100, 0], y: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute top-1/4 left-1/4 text-6xl opacity-10">🐟</motion.div>
      <motion.div animate={{ x: [0, -80, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute bottom-1/3 right-1/4 text-5xl opacity-10">🐠</motion.div>
    </div>

    <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            🐟 India's #1 Fish Marketplace
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Fresh Fish Marketplace
          <span className="block gradient-text">Direct from Sellers to Buyers</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with local fishermen and verified sellers for the freshest catch. Quality guaranteed, delivered to your doorstep.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search fish by name or location" className="pl-12 h-14 text-lg bg-card/80 backdrop-blur border-border/50" />
          </div>
          <Button size="lg" className="h-14 px-8 btn-gradient text-accent-foreground" asChild>
            <Link to="/marketplace">Explore Fresh Fish <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" size="lg" className="h-12" asChild>
            <Link to="/seller">Become a Seller</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
);

const FeaturesSection = () => (
  <section className="py-16 bg-card">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Clock, title: 'Fresh Today', desc: 'Same-day catch delivery' },
          { icon: Shield, title: 'Quality Assured', desc: 'Verified sellers only' },
          { icon: Truck, title: 'Fast Delivery', desc: 'Cold chain logistics' },
          { icon: Star, title: 'Best Prices', desc: 'Direct from source' },
        ].map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4 p-6 glass-card-solid rounded-xl">
            <div className="p-3 bg-primary/10 rounded-lg"><f.icon className="w-6 h-6 text-primary" /></div>
            <div><h3 className="font-semibold">{f.title}</h3><p className="text-sm text-muted-foreground">{f.desc}</p></div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedProducts = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Fresh Catch</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">Handpicked selection of the freshest fish from verified sellers across India</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 8).map((product, i) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Button size="lg" className="btn-ocean text-primary-foreground" asChild>
          <Link to="/marketplace">View All Products <ArrowRight className="ml-2 w-5 h-5" /></Link>
        </Button>
      </div>
    </div>
  </section>
);

const Index = () => (
  <main>
    <HeroSection />
    <FeaturesSection />
    <FeaturedProducts />
  </main>
);

export default Index;
