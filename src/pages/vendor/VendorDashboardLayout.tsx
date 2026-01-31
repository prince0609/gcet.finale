import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  TruckIcon,
  RotateCcw,
  FileText,
  BarChart3,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/vendor' },
  { icon: Package, label: 'Products', path: '/vendor/products' },
  { icon: ShoppingBag, label: 'Orders', path: '/vendor/orders' },
  { icon: TruckIcon, label: 'Pickups', path: '/vendor/pickups' },
  { icon: RotateCcw, label: 'Returns', path: '/vendor/returns' },
  { icon: FileText, label: 'Invoices', path: '/vendor/invoices' },
  { icon: BarChart3, label: 'Reports', path: '/vendor/reports' },
  { icon: User, label: 'Profile', path: '/vendor/profile' },
];

export default function VendorDashboardLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Main Header with Navigation */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-sm text-muted-foreground">Vendor Portal</h2>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 ${location.pathname === item.path ? 'bg-secondary' : ''
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-50">
        {navItems.slice(0, 4).map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-col h-14 gap-1 ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}
