import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ProductsPage from "./pages/products/ProductsPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";

// Customer Dashboard
import CustomerDashboardLayout from "./pages/dashboard/CustomerDashboardLayout";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import CustomerOrdersPage from "./pages/dashboard/CustomerOrdersPage";
import CustomerInvoicesPage from "./pages/dashboard/CustomerInvoicesPage";
import CustomerProfilePage from "./pages/dashboard/CustomerProfilePage";

// Vendor Dashboard
import VendorDashboardLayout from "./pages/vendor/VendorDashboardLayout";
import VendorDashboard from "./pages/vendor/VendorDashboard";

// Admin Dashboard
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminInvoicesPage from "./pages/admin/AdminInvoicesPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              {/* Customer Dashboard */}
              <Route path="/dashboard" element={<CustomerDashboardLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrdersPage />} />
                <Route path="invoices" element={<CustomerInvoicesPage />} />
                <Route path="profile" element={<CustomerProfilePage />} />
              </Route>

              {/* Vendor Dashboard */}
              <Route path="/vendor" element={<VendorDashboardLayout />}>
                <Route index element={<VendorDashboard />} />
                <Route path="orders" element={<VendorDashboard />} />
                <Route path="products" element={<VendorDashboard />} />
                <Route path="invoices" element={<VendorDashboard />} />
                <Route path="settings" element={<VendorDashboard />} />
              </Route>

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                <Route path="invoices" element={<AdminInvoicesPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
