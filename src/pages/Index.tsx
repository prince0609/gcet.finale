import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Package, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/products/ProductCard';

export default function HomePage() {
  const featuredProducts = mockProducts.slice(0, 4);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Professional Equipment<br />
            On Rent
          </h1>
          <p className="text-lg lg:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Cameras, audio gear, lighting, and accessories for photographers, filmmakers, and content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" className="gradient-accent text-accent-foreground hover:opacity-90 px-8">
                Browse Equipment
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" className="gradient-accent text-accent-foreground hover:opacity-90 px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-muted-foreground">Equipment Items</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">10K+</p>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">50+</p>
              <p className="text-muted-foreground">Cities Covered</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">4.8⭐</p>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Camera, label: 'Cameras', count: 15 },
              { icon: Package, label: 'Audio', count: 8 },
              { icon: TrendingUp, label: 'Lighting', count: 6 },
              { icon: Users, label: 'Accessories', count: 4 },
            ].map((cat) => (
              <Link key={cat.label} to={`/products?category=${cat.label}`} className="group">
                <div className="bg-card rounded-xl border p-6 text-center card-hover">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <cat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{cat.label}</h3>
                  <p className="text-sm text-muted-foreground">{cat.count} items</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold">Featured Equipment</h2>
            <Link to="/products">
              <Button variant="ghost">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} rentalPeriod="daily" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Renting?</h2>
          <p className="mb-8 opacity-90">Join thousands of professionals using RentEase for their equipment needs.</p>
          <Link to="/signup">
            <Button size="lg" className="gradient-accent text-accent-foreground">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
