import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  rentalPeriod: 'hourly' | 'daily' | 'weekly';
}

export function ProductCard({ product, rentalPeriod }: ProductCardProps) {
  const price = product.pricing[rentalPeriod];
  const periodLabel = rentalPeriod === 'hourly' ? 'hour' : rentalPeriod === 'daily' ? 'day' : 'week';
  const isAvailable = product.quantityAvailable > 0;

  return (
    <div className="group bg-card rounded-xl border overflow-hidden card-hover">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary/30 overflow-hidden">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={isAvailable ? 'default' : 'destructive'}
            className={isAvailable ? 'bg-success text-success-foreground' : ''}
          >
            {isAvailable ? `${product.quantityAvailable}/${product.quantity} available` : 'Out of Stock'}
          </Badge>
        </div>
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Link to={`/products/${product.id}`}>
            <Button size="sm" variant="secondary" className="gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.category}</span>
          <span>•</span>
          <span>{product.brand}</span>
        </div>

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">₹{price.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/{periodLabel}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to={`/products/${product.id}`} className="flex-1">
            <Button 
              className="w-full gradient-accent text-accent-foreground hover:opacity-90 gap-2"
              disabled={!isAvailable}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
