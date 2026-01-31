import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function VendorProductsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Mock products data
    const products = [
        {
            id: 1,
            name: 'Canon EOS R5',
            sku: 'CAM-R5-001',
            category: 'Cameras',
            quantity: 5,
            status: 'Published',
            isRentable: true,
            pricePerDay: 2500,
            pricePerWeek: 15000,
            image: '/placeholder.svg',
        },
        {
            id: 2,
            name: 'Sony A7 IV',
            sku: 'CAM-A7-002',
            category: 'Cameras',
            quantity: 3,
            status: 'Published',
            isRentable: true,
            pricePerDay: 2000,
            pricePerWeek: 12000,
            image: '/placeholder.svg',
        },
        {
            id: 3,
            name: 'DJI Ronin RS3',
            sku: 'GIM-RS3-001',
            category: 'Gimbals',
            quantity: 4,
            status: 'Published',
            isRentable: true,
            pricePerDay: 1500,
            pricePerWeek: 9000,
            image: '/placeholder.svg',
        },
        {
            id: 4,
            name: 'Godox AD600',
            sku: 'LGT-AD6-001',
            category: 'Lighting',
            quantity: 8,
            status: 'Published',
            isRentable: true,
            pricePerDay: 1200,
            pricePerWeek: 7200,
            image: '/placeholder.svg',
        },
        {
            id: 5,
            name: 'Rode Wireless GO II',
            sku: 'AUD-RWG-001',
            category: 'Audio',
            quantity: 10,
            status: 'Unpublished',
            isRentable: true,
            pricePerDay: 800,
            pricePerWeek: 4800,
            image: '/placeholder.svg',
        },
        {
            id: 6,
            name: 'Manfrotto Tripod',
            sku: 'ACC-MFT-001',
            category: 'Accessories',
            quantity: 15,
            status: 'Published',
            isRentable: true,
            pricePerDay: 300,
            pricePerWeek: 1800,
            image: '/placeholder.svg',
        },
    ];

    const categories = ['all', 'Cameras', 'Gimbals', 'Lighting', 'Audio', 'Accessories'];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const togglePublish = (productId: number) => {
        console.log('Toggle publish for product:', productId);
        // In real app, this would call an API
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Product Management</h1>
                    <p className="text-muted-foreground">Manage your rental product catalog</p>
                </div>
                <Link to="/vendor/products/new">
                    <Button className="gradient-primary text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters & Search */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 items-center">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-background"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold mt-1">{products.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {products.filter(p => p.status === 'Published').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Unpublished</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {products.filter(p => p.status === 'Unpublished').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Inventory</p>
                    <p className="text-2xl font-bold mt-1">
                        {products.reduce((sum, p) => sum + p.quantity, 0)} units
                    </p>
                </Card>
            </div>

            {/* Products Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Rentable</th>
                                <th>Price/Day</th>
                                <th>Price/Week</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                                                <img src={product.image} alt={product.name} className="h-8 w-8 object-cover" />
                                            </div>
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-sm text-muted-foreground">{product.sku}</span>
                                    </td>
                                    <td>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </td>
                                    <td>
                                        <span className={product.quantity < 3 ? 'text-warning font-medium' : ''}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge className={
                                            product.status === 'Published'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-muted text-muted-foreground'
                                        }>
                                            {product.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        {product.isRentable ? (
                                            <Badge className="bg-info/10 text-info">Yes</Badge>
                                        ) : (
                                            <Badge variant="outline">No</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <span className="font-semibold">₹{product.pricePerDay.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <span className="font-semibold">₹{product.pricePerWeek.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/vendor/products/${product.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/vendor/products/${product.id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => togglePublish(product.id)}
                                            >
                                                {product.status === 'Published' ? (
                                                    <ToggleRight className="h-4 w-4 text-success" />
                                                ) : (
                                                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-muted-foreground">No products found matching your criteria</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
