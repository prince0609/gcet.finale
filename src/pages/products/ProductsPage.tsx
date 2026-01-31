import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFiltersPanel } from '@/components/products/ProductFilters';
import { mockProducts } from '@/data/mockData';
import { ProductFilters } from '@/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const defaultFilters: ProductFilters = {
  search: '',
  category: '',
  brand: '',
  priceRange: [0, 2000],
  rentalPeriod: 'daily',
  availableOnly: false,
  sortBy: 'popularity',
};

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter((p) => p.brand === filters.brand);
    }

    // Price range filter
    result = result.filter((p) => {
      const price = p.pricing[filters.rentalPeriod];
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Availability filter
    if (filters.availableOnly) {
      result = result.filter((p) => p.quantityAvailable > 0);
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricing[filters.rentalPeriod] - b.pricing[filters.rentalPeriod]);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricing[filters.rentalPeriod] - a.pricing[filters.rentalPeriod]);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // popularity - keep original order
        break;
    }

    return result;
  }, [filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Equipment</h1>
          <p className="text-muted-foreground">
            Professional rental equipment for photographers, filmmakers, and content creators
          </p>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cameras, mics, lights..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            {/* Mobile Filters */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 overflow-y-auto h-full">
                  <ProductFiltersPanel
                    filters={filters}
                    onFiltersChange={(f) => {
                      setFilters(f);
                    }}
                    onClear={clearFilters}
                    productCount={filteredProducts.length}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* View Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ProductFiltersPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClear={clearFilters}
              productCount={filteredProducts.length}
            />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    rentalPeriod={filters.rentalPeriod}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
