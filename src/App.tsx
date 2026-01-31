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
import VendorProductsPage from "./pages/vendor/VendorProductsPage";
import VendorOrdersPage from "./pages/vendor/VendorOrdersPage";
import VendorPickupsPage from "./pages/vendor/VendorPickupsPage";
import VendorReturnsPage from "./pages/vendor/VendorReturnsPage";
import VendorInvoicesPage from "./pages/vendor/VendorInvoicesPage";
import VendorReportsPage from "./pages/vendor/VendorReportsPage";
import VendorProfilePage from "./pages/vendor/VendorProfilePage";

// Admin Dashboard
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminVendorsPage from "./pages/admin/AdminVendorsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";

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
                <Route path="products" element={<VendorProductsPage />} />
                <Route path="orders" element={<VendorOrdersPage />} />
                <Route path="pickups" element={<VendorPickupsPage />} />
                <Route path="returns" element={<VendorReturnsPage />} />
                <Route path="invoices" element={<VendorInvoicesPage />} />
                <Route path="reports" element={<VendorReportsPage />} />
                <Route path="profile" element={<VendorProfilePage />} />
              </Route>

              {/* Admin Dashboard */}
              <Route path="/admin" element={<AdminDashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="vendors" element={<AdminVendorsPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
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
