import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { validateGSTIN, formatGSTIN, getStateFromGSTIN, validatePassword, getPasswordStrength, validateEmail } from '@/utils/validation';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    gstin: '',
    password: '',
    confirmPassword: '',
    couponCode: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const handleChange = (field: string, value: string) => {
    let processedValue = value;
    
    if (field === 'gstin') {
      processedValue = formatGSTIN(value);
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Validate GSTIN in real-time
    if (field === 'gstin' && processedValue.length === 15) {
      const validation = validateGSTIN(processedValue);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, gstin: validation.message }));
      }
    }

    // Validate coupon code
    if (field === 'couponCode' && value.length > 0) {
      // Mock validation - in real app would call API
      setTimeout(() => {
        if (value.toUpperCase() === 'WELCOME10' || value.toUpperCase() === 'FIRST50') {
          setCouponStatus('valid');
        } else if (value.length >= 4) {
          setCouponStatus('invalid');
        }
      }, 500);
    } else if (field === 'couponCode' && value.length === 0) {
      setCouponStatus('idle');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.companyName.trim() || formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    const gstinValidation = validateGSTIN(formData.gstin);
    if (!gstinValidation.valid) {
      newErrors.gstin = gstinValidation.message;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        gstin: formData.gstin,
        password: formData.password,
      });

      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ form: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const detectedState = getStateFromGSTIN(formData.gstin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <span className="text-xl font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-2xl font-bold text-foreground">RentEase</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Start renting professional equipment today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 shadow-card space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                placeholder="Your company name"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className={`pl-10 ${errors.companyName ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.companyName && <p className="text-xs text-destructive">{errors.companyName}</p>}
          </div>

          {/* GSTIN */}
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN *</Label>
            <Input
              id="gstin"
              type="text"
              placeholder="e.g., 27ABCDE1234F1Z5"
              value={formData.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
              maxLength={15}
              className={`uppercase ${errors.gstin ? 'border-destructive' : formData.gstin.length === 15 && !errors.gstin ? 'border-success' : ''}`}
            />
            {errors.gstin && <p className="text-xs text-destructive">{errors.gstin}</p>}
            {detectedState && !errors.gstin && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                State: {detectedState}
              </p>
            )}
            <p className="text-xs text-muted-foreground">15-digit GST Identification Number for invoicing</p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.password && (
              <div className="flex gap-1 mt-1">
                {['weak', 'fair', 'good', 'strong'].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'weak' && level === 'weak' ? 'bg-destructive' :
                      passwordStrength === 'fair' && ['weak', 'fair'].includes(level) ? 'bg-warning' :
                      passwordStrength === 'good' && ['weak', 'fair', 'good'].includes(level) ? 'bg-info' :
                      passwordStrength === 'strong' ? 'bg-success' :
                      'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
            <div className="relative">
              <Input
                id="couponCode"
                type="text"
                placeholder="Enter coupon code"
                value={formData.couponCode}
                onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase())}
                className={`uppercase ${
                  couponStatus === 'valid' ? 'border-success pr-10' :
                  couponStatus === 'invalid' ? 'border-destructive pr-10' : ''
                }`}
              />
              {couponStatus === 'valid' && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
              )}
              {couponStatus === 'invalid' && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
              )}
            </div>
            {couponStatus === 'valid' && (
              <p className="text-xs text-success">Coupon applied! You'll get a discount on your first order.</p>
            )}
            {couponStatus === 'invalid' && (
              <p className="text-xs text-destructive">Invalid coupon code</p>
            )}
          </div>

          {errors.form && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{errors.form}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium">Customer:</span> customer@demo.com / demo123</p>
            <p><span className="font-medium">Vendor:</span> vendor@demo.com / demo123</p>
            <p><span className="font-medium">Admin:</span> admin@demo.com / demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
