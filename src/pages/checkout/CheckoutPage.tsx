import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, MapPin, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MainLayout } from '@/components/layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Step = 'review' | 'shipping' | 'payment';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getSubtotal, getTax, getSecurityDeposit, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('review');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingData, setShippingData] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    contactPerson: user?.name || '',
    phone: '',
    instructions: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'full' | 'deposit'>('full');

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'review', label: 'Review', icon: <FileText className="h-4 w-4" /> },
    { key: 'shipping', label: 'Shipping', icon: <MapPin className="h-4 w-4" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> },
  ];

  const handleNext = () => {
    if (currentStep === 'review') {
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      // Validate shipping
      if (!shippingData.street || !shippingData.city || !shippingData.state || !shippingData.pincode || !shippingData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }
      setCurrentStep('payment');
    }
  };

  const handleBack = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('review');
    } else if (currentStep === 'payment') {
      setCurrentStep('shipping');
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/dashboard');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const paymentAmount = paymentMethod === 'full' ? getTotal() : getSecurityDeposit();

  return (
    <MainLayout hideFooter>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`flex items-center gap-2 ${
                  currentStep === step.key
                    ? 'text-primary'
                    : steps.findIndex((s) => s.key === currentStep) > index
                    ? 'text-success'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : steps.findIndex((s) => s.key === currentStep) > index
                      ? 'border-success bg-success text-success-foreground'
                      : 'border-muted-foreground'
                  }`}
                >
                  {steps.findIndex((s) => s.key === currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="hidden sm:inline font-medium">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    steps.findIndex((s) => s.key === currentStep) > index
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step: Review */}
            {currentStep === 'review' && (
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="text-xl font-semibold">Review Your Order</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                      <div className="w-16 h-16 bg-secondary rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {item.rentalPeriod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Shipping */}
            {currentStep === 'shipping' && (
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="text-xl font-semibold">Shipping Details</h2>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Textarea
                      id="street"
                      placeholder="Enter your full address"
                      value={shippingData.street}
                      onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={shippingData.state}
                        onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">PIN Code *</Label>
                      <Input
                        id="pincode"
                        placeholder="6-digit PIN"
                        value={shippingData.pincode}
                        onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                        maxLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="10-digit mobile"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Name"
                      value={shippingData.contactPerson}
                      onChange={(e) => setShippingData({ ...shippingData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Pickup Instructions (Optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any special instructions for pickup..."
                      value={shippingData.instructions}
                      onChange={(e) => setShippingData({ ...shippingData, instructions: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step: Payment */}
            {currentStep === 'payment' && (
              <div className="bg-card rounded-xl border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Payment Options</h2>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'full' | 'deposit')}>
                  <div className="space-y-3">
                    <label
                      htmlFor="full"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        paymentMethod === 'full' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'
                      }`}
                    >
                      <RadioGroupItem value="full" id="full" />
                      <div className="flex-1">
                        <p className="font-medium">Full Payment</p>
                        <p className="text-sm text-muted-foreground">Pay the complete amount now</p>
                      </div>
                      <span className="font-bold">₹{getTotal().toLocaleString()}</span>
                    </label>
                    <label
                      htmlFor="deposit"
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        paymentMethod === 'deposit' ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground'
                      }`}
                    >
                      <RadioGroupItem value="deposit" id="deposit" />
                      <div className="flex-1">
                        <p className="font-medium">Security Deposit Only</p>
                        <p className="text-sm text-muted-foreground">Pay remaining on pickup</p>
                      </div>
                      <span className="font-bold">₹{getSecurityDeposit().toLocaleString()}</span>
                    </label>
                  </div>
                </RadioGroup>

                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Payment will be processed securely via Razorpay</p>
                  <div className="flex gap-2">
                    <div className="h-8 px-3 bg-card rounded flex items-center text-xs font-medium">UPI</div>
                    <div className="h-8 px-3 bg-card rounded flex items-center text-xs font-medium">Cards</div>
                    <div className="h-8 px-3 bg-card rounded flex items-center text-xs font-medium">Net Banking</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              {currentStep !== 'review' ? (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <Button variant="outline" onClick={() => navigate('/cart')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              )}

              {currentStep !== 'payment' ? (
                <Button onClick={handleNext} className="gradient-primary text-primary-foreground">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  className="gradient-accent text-accent-foreground"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${paymentAmount.toLocaleString()}`}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-6 sticky top-24 space-y-4">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>₹{getTax().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span>₹{getSecurityDeposit().toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{getTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
