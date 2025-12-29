import { Fish, Users, Truck, Shield } from 'lucide-react';

const About = () => (
  <main className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About FishMart</h1>
        <p className="text-xl text-muted-foreground">Connecting India's fishermen directly with consumers for the freshest catch, fair prices, and sustainable fishing practices.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { icon: Fish, title: '10,000+', desc: 'Fish Varieties' },
          { icon: Users, title: '5,000+', desc: 'Verified Sellers' },
          { icon: Truck, title: '50+', desc: 'Cities Covered' },
          { icon: Shield, title: '100%', desc: 'Quality Assured' },
        ].map((stat) => (
          <div key={stat.title} className="text-center p-6 glass-card-solid rounded-xl">
            <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-3xl font-bold">{stat.title}</h3>
            <p className="text-muted-foreground">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto prose prose-lg">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-6">FishMart was founded with a simple mission: to bring the freshest fish from India's waters directly to your table, while ensuring fair prices for our hardworking fishermen.</p>
        <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
        <p className="text-muted-foreground">We work directly with fishing communities across India, eliminating middlemen and ensuring you get the freshest catch at the best prices. Every seller on our platform is verified, and every fish is quality-checked before delivery.</p>
      </div>
    </div>
  </main>
);

export default About;
