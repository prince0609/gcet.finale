import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { ShoppingCart, ArrowLeft, Check, Calendar, Package, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MainLayout } from '@/components/layout';
import { mockProducts } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const product = mockProducts.find((p) => p.id === id);

  const [rentalPeriod, setRentalPeriod] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState<Date>(addDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 8));
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </MainLayout>
    );
  }

  const price = product.pricing[rentalPeriod];
  const periodLabel = rentalPeriod === 'hourly' ? 'hour' : rentalPeriod === 'daily' ? 'day' : 'week';
  const isAvailable = product.quantityAvailable >= quantity;

  const calculatePeriodCount = (): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    switch (rentalPeriod) {
      case 'hourly':
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60)));
      case 'daily':
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      case 'weekly':
        return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)));
      default:
        return 1;
    }
  };

  const periodCount = calculatePeriodCount();
  const subtotal = price * periodCount * quantity;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleAddToCart = () => {
    addItem(product, startDate, endDate, quantity, rentalPeriod);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{product.category}</span>
                <span>•</span>
                <span>{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Pricing Options */}
            <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold">Rental Pricing</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['hourly', 'daily', 'weekly'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setRentalPeriod(period)}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      rentalPeriod === period
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-card hover:border-muted'
                    }`}
                  >
                    <div className="text-xs text-muted-foreground capitalize">{period}</div>
                    <div className="font-bold">₹{product.pricing[period]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <Badge variant={isAvailable ? 'default' : 'destructive'} className={isAvailable ? 'bg-success' : ''}>
                {product.quantityAvailable}/{product.quantity} available
              </Badge>
            </div>

            {/* Rental Configuration */}
            <div className="space-y-4 bg-card rounded-xl border p-4">
              <h3 className="font-semibold">Configure Your Rental</h3>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(startDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(endDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        disabled={(date) => date <= startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(v) => setQuantity(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(5, product.quantityAvailable) }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ₹{price} × {periodCount} {periodLabel}s × {quantity}
                </span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 gradient-accent text-accent-foreground hover:opacity-90"
                disabled={!isAvailable}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="flex-1" disabled={!isAvailable}>
                Reserve Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <Package className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Free Pickup</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Insurance Included</p>
              </div>
              <div className="text-center">
                <Check className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Quality Checked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
