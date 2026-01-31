import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFilters } from '@/types';
import { categories, brands } from '@/data/mockData';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  onClear: () => void;
  productCount: number;
}

export function ProductFiltersPanel({ filters, onFiltersChange, onClear, productCount }: ProductFiltersProps) {
  const hasActiveFilters = 
    filters.category !== '' || 
    filters.brand !== '' || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 2000 ||
    filters.availableOnly;

  return (
    <div className="bg-card rounded-xl border p-4 space-y-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-7">
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {productCount} {productCount === 1 ? 'product' : 'products'} found
      </p>

      {/* Rental Period */}
      <div className="space-y-2">
        <Label>Rental Period</Label>
        <Select 
          value={filters.rentalPeriod} 
          onValueChange={(value) => onFiltersChange({ ...filters, rentalPeriod: value as 'hourly' | 'daily' | 'weekly' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <Label>Category</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.category === category}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, category: checked ? category : '' })
                }
              />
              <label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-3">
        <Label>Brand</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brand === brand}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, brand: checked ? brand : '' })
                }
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Price Range</Label>
          <span className="text-xs text-muted-foreground">
            ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}+
          </span>
        </div>
        <Slider
          value={filters.priceRange}
          min={0}
          max={2000}
          step={50}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, priceRange: value as [number, number] })
          }
          className="mt-2"
        />
      </div>

      {/* Availability */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="available-only"
          checked={filters.availableOnly}
          onCheckedChange={(checked) => 
            onFiltersChange({ ...filters, availableOnly: checked as boolean })
          }
        />
        <label
          htmlFor="available-only"
          className="text-sm cursor-pointer"
        >
          Available only
        </label>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as ProductFilters['sortBy'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
