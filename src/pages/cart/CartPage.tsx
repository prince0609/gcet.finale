import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { ShoppingCart, Trash2, Edit2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, getSubtotal, getTax, getSecurityDeposit, getTotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();

  const getPeriodCount = (startDate: Date, endDate: Date, period: 'hourly' | 'daily' | 'weekly'): number => {
    const diff = differenceInDays(endDate, startDate);
    switch (period) {
      case 'hourly':
        return diff * 24;
      case 'daily':
        return Math.max(1, diff);
      case 'weekly':
        return Math.max(1, Math.ceil(diff / 7));
      default:
        return 1;
    }
  };

  const getItemTotal = (item: typeof items[0]): number => {
    const periodCount = getPeriodCount(item.startDate, item.endDate, item.rentalPeriod);
    return item.product.pricing[item.rentalPeriod] * periodCount * item.quantity;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Browse our equipment and add items to your cart
          </p>
          <Link to="/products">
            <Button className="gradient-primary text-primary-foreground">
              Browse Equipment
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const periodCount = getPeriodCount(item.startDate, item.endDate, item.rentalPeriod);
              const periodLabel = item.rentalPeriod === 'hourly' ? 'hour' : item.rentalPeriod === 'daily' ? 'day' : 'week';
              const itemTotal = getItemTotal(item);

              return (
                <div key={item.id} className="bg-card rounded-xl border p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-secondary/30 rounded-lg overflow-hidden">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link
                          to={`/products/${item.product.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity} × ₹{item.product.pricing[item.rentalPeriod]}/{periodLabel} × {periodCount} {periodLabel}s
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(item.startDate, 'dd MMM')} → {format(item.endDate, 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{itemTotal.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link to="/products">
              <Button variant="ghost" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-24 space-y-4">
              <h2 className="font-semibold text-lg">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>₹{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{getTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit (10%)</span>
                  <span>₹{getSecurityDeposit().toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Security deposit refundable after return
                </p>
              </div>

              <Button
                className="w-full gradient-accent text-accent-foreground hover:opacity-90"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  You'll need to login to complete your order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
