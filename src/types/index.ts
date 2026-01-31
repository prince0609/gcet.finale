// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  images: string[];
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
  };
  costPrice: number;
  quantity: number;
  quantityAvailable: number;
  attributes: Record<string, string>;
  isPublished: boolean;
  vendorId: string;
  createdAt: Date;
}

// User Types
export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  companyName: string;
  gstin: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson?: string;
  phone?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  rentalPeriod: 'hourly' | 'daily' | 'weekly';
  startDate: Date;
  endDate: Date;
  variant?: Record<string, string>;
}

// Order Types
export type OrderStatus = 'draft' | 'confirmed' | 'delivered' | 'return_pending' | 'returned' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface RentalOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerGstin: string;
  vendorId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  securityDeposit: number;
  total: number;
  shippingAddress: Address;
  pickupDate?: Date;
  returnDate?: Date;
  actualReturnDate?: Date;
  lateFee?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  rentalPeriod: 'hourly' | 'daily' | 'weekly';
  periodCount: number;
  unitPrice: number;
  total: number;
  startDate: Date;
  endDate: Date;
  serialNumbers?: string[];
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerCompany: string;
  customerGstin: string;
  vendorId: string;
  vendorName: string;
  vendorGstin: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  period: string;
  rate: number;
  amount: number;
}

// Quotation Types
export type QuotationStatus = 'draft' | 'sent' | 'confirmed' | 'expired' | 'cancelled';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  securityDeposit: number;
  total: number;
  status: QuotationStatus;
  validUntil: Date;
  createdAt: Date;
}

// Document Types
export interface PickupSlip {
  id: string;
  slipNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerGstin: string;
  pickupAddress: Address;
  items: {
    name: string;
    serialNumber: string;
    quantity: number;
  }[];
  instructions?: string;
  createdAt: Date;
}

export interface ReturnSlip {
  id: string;
  slipNumber: string;
  orderId: string;
  orderNumber: string;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  items: {
    name: string;
    serialNumber: string;
    condition: 'good' | 'damaged' | 'missing';
    notes?: string;
  }[];
  lateFee: number;
  additionalCharges: number;
  finalSettlement: number;
  createdAt: Date;
}

// Settings Types
export interface RentalSettings {
  hourlyMultiplier: number;
  dailyMultiplier: number;
  weeklyMultiplier: number;
  securityDepositPercent: number;
  cgstRate: number;
  sgstRate: number;
  companyGstin: string;
  companyName: string;
  companyAddress: Address;
  lateFeePerDay: number;
}

// Filter Types
export interface ProductFilters {
  search: string;
  category: string;
  brand: string;
  priceRange: [number, number];
  rentalPeriod: 'hourly' | 'daily' | 'weekly';
  availableOnly: boolean;
  sortBy: 'price_asc' | 'price_desc' | 'popularity' | 'newest';
}

// Report Types
export interface DashboardMetrics {
  totalRevenue: number;
  revenueChange: number;
  ordersToday: number;
  ordersChange: number;
  activeRentals: number;
  activeRentalsChange: number;
  averageRating: number;
  totalReviews: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}
