import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'vendor':
        return '/vendor';
      default:
        return '/dashboard';
    }
  };

  const getProfileLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/profile';
      case 'vendor':
        return '/vendor/profile';
      default:
        return '/dashboard/profile';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <span className="text-xl font-bold text-foreground">RentEase</span>
        </Link>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search equipment..."
              className="w-full pl-10 bg-secondary/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 ${location.pathname === '/'
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground'
              }`}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 ${location.pathname === '/products' || location.pathname.startsWith('/products/')
              ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground'
              }`}
          >
            Browse
          </Link>

          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              className={`text-sm font-medium transition-colors hover:text-primary relative pb-1 ${location.pathname.includes('dashboard') || location.pathname.includes('vendor') || location.pathname.includes('admin')
                ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-muted-foreground'
                }`}
            >
              Dashboard
            </Link>
          )}

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={getProfileLink()}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card p-4 animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search equipment..." className="w-full pl-10" />
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md transition-colors ${location.pathname === '/'
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-secondary'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-3 py-2 rounded-md transition-colors ${location.pathname === '/products' || location.pathname.startsWith('/products/')
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-secondary'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Equipment
            </Link>
            <Link
              to="/cart"
              className={`px-3 py-2 rounded-md transition-colors flex items-center justify-between ${location.pathname === '/cart'
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-secondary'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className={`px-3 py-2 rounded-md transition-colors ${location.pathname.includes('dashboard') || location.pathname.includes('vendor') || location.pathname.includes('admin')
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-secondary'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="px-3 py-2 rounded-md hover:bg-secondary text-left text-destructive"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md hover:bg-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
