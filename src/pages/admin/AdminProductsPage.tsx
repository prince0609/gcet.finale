import React, { useState } from 'react';
import { LayoutGrid, List, Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockProducts } from '@/data/mockData';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ViewMode = 'kanban' | 'list';

interface Product {
    id: string;
    name: string;
    category: string;
    brand: string;
    vendorId: string;
    pricing: { hourly: number; daily: number; weekly: number };
    quantity: number;
    quantityAvailable: number;
    costPrice: number;
}

export default function AdminProductsPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>(mockProducts as Product[]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        brand: '',
        description: '',
        hourly: '',
        daily: '',
        weekly: '',
        quantity: '',
        vendor: '',
        costPrice: '',
    });

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: '',
            category: '',
            brand: '',
            description: '',
            hourly: '',
            daily: '',
            weekly: '',
            quantity: '',
            vendor: '',
            costPrice: '',
        });
    };

    const handleAddProduct = () => {
        const newProduct: Product = {
            id: `prod-${Date.now()}`,
            name: formData.name,
            category: formData.category,
            brand: formData.brand,
            vendorId: formData.vendor,
            pricing: {
                hourly: Number(formData.hourly),
                daily: Number(formData.daily),
                weekly: Number(formData.weekly),
            },
            quantity: Number(formData.quantity),
            quantityAvailable: Number(formData.quantity),
            costPrice: Number(formData.costPrice),
        };

        setProducts([...products, newProduct]);
        setIsAddDialogOpen(false);
        resetForm();
    };

    const handleEditProduct = () => {
        if (!selectedProduct) return;

        const updatedProducts = products.map(p =>
            p.id === selectedProduct.id
                ? {
                    ...p,
                    name: formData.name,
                    category: formData.category,
                    brand: formData.brand,
                    vendorId: formData.vendor,
                    pricing: {
                        hourly: Number(formData.hourly),
                        daily: Number(formData.daily),
                        weekly: Number(formData.weekly),
                    },
                    quantity: Number(formData.quantity),
                    costPrice: Number(formData.costPrice),
                }
                : p
        );

        setProducts(updatedProducts);
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        resetForm();
    };

    const handleDeleteProduct = () => {
        if (!selectedProduct) return;

        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
    };

    const openEditDialog = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            brand: product.brand || '',
            description: '',
            hourly: product.pricing.hourly.toString(),
            daily: product.pricing.daily.toString(),
            weekly: product.pricing.weekly.toString(),
            quantity: product.quantity.toString(),
            vendor: product.vendorId,
            costPrice: product.costPrice.toString(),
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-64"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button
                            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('kanban')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                                <DialogDescription>Create a new product for rental</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Product Name</Label>
                                        <Input
                                            placeholder="e.g., Sony Alpha A7 III"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Camera">Camera</SelectItem>
                                                <SelectItem value="Audio">Audio</SelectItem>
                                                <SelectItem value="Lighting">Lighting</SelectItem>
                                                <SelectItem value="Accessories">Accessories</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Brand</Label>
                                        <Input
                                            placeholder="e.g., Sony"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vendor Name</Label>
                                        <Input
                                            placeholder="Vendor name"
                                            value={formData.vendor}
                                            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Hourly Rate (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="150"
                                            value={formData.hourly}
                                            onChange={(e) => setFormData({ ...formData, hourly: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Daily Rate (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="350"
                                            value={formData.daily}
                                            onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weekly Rate (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="800"
                                            value={formData.weekly}
                                            onChange={(e) => setFormData({ ...formData, weekly: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            placeholder="5"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cost Price (₹)</Label>
                                        <Input
                                            type="number"
                                            placeholder="150000"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddProduct}>Create Product</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Update product details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Camera">Camera</SelectItem>
                                        <SelectItem value="Audio">Audio</SelectItem>
                                        <SelectItem value="Lighting">Lighting</SelectItem>
                                        <SelectItem value="Accessories">Accessories</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Input
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vendor Name</Label>
                                <Input
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Hourly Rate (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.hourly}
                                    onChange={(e) => setFormData({ ...formData, hourly: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Daily Rate (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.daily}
                                    onChange={(e) => setFormData({ ...formData, daily: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Weekly Rate (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.weekly}
                                    onChange={(e) => setFormData({ ...formData, weekly: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.costPrice}
                                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditProduct}>Update Product</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{selectedProduct?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="bg-card rounded-xl border p-4 hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                                <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Vendor: {product.vendorId}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Daily Rate</p>
                                        <p className="font-semibold">₹{product.pricing.daily}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Available</p>
                                        <p className="font-semibold">{product.quantityAvailable}/{product.quantity}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDialog(product)}>
                                        <Pencil className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => openDeleteDialog(product)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-card rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-semibold">Product Name</th>
                                    <th className="p-4 font-semibold">Vendor</th>
                                    <th className="p-4 font-semibold">Category</th>
                                    <th className="p-4 font-semibold">Qty</th>
                                    <th className="p-4 font-semibold">Unit Price</th>
                                    <th className="p-4 font-semibold">Sales Price</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">{product.vendorId}</td>
                                        <td className="p-4">
                                            <Badge variant="outline">{product.category}</Badge>
                                        </td>
                                        <td className="p-4 text-sm">{product.quantity}</td>
                                        <td className="p-4 text-sm">₹{product.costPrice.toLocaleString()}</td>
                                        <td className="p-4 text-sm font-semibold">₹{product.pricing.daily}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openDeleteDialog(product)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
