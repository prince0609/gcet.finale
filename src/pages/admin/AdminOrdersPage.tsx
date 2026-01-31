import React, { useState } from 'react';
import { LayoutGrid, List, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

type ViewMode = 'kanban' | 'list';

const statusColumns = [
    { id: 'draft', label: 'Draft', color: 'bg-muted' },
    { id: 'confirmed', label: 'Confirmed', color: 'bg-info/10' },
    { id: 'delivered', label: 'Delivered', color: 'bg-success/10' },
    { id: 'return_pending', label: 'Return Pending', color: 'bg-warning/10' },
];

export default function AdminOrdersPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = mockOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getOrdersByStatus = (status: string) => {
        return filteredOrders.filter(order => order.status === status);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-success/10 text-success';
            case 'confirmed':
                return 'bg-info/10 text-info';
            case 'draft':
                return 'bg-muted text-muted-foreground';
            case 'return_pending':
                return 'bg-warning/10 text-warning';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Orders</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
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
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statusColumns.map((column) => (
                        <div key={column.id} className="bg-card rounded-xl border p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">{column.label}</h3>
                                <Badge variant="secondary">{getOrdersByStatus(column.id).length}</Badge>
                            </div>
                            <div className="space-y-3">
                                {getOrdersByStatus(column.id).map((order) => (
                                    <Link key={order.id} to={`/admin/orders/${order.id}`}>
                                        <div className={`${column.color} rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="font-semibold text-sm">{order.orderNumber}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{order.customerName}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">
                                                    {order.createdAt && format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                                </p>
                                                <p className="font-semibold text-sm">₹{order.total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {getOrdersByStatus(column.id).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No orders</p>
                                )}
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
                                    <th className="p-4 font-semibold">Order ID</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Customer</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Payment</th>
                                    <th className="p-4 font-semibold">Amount</th>
                                    <th className="p-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-4">
                                            <p className="font-medium">{order.orderNumber}</p>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {order.createdAt && format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{order.customerName}</p>
                                                <p className="text-xs text-muted-foreground">{order.customerCompany}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={getStatusBadgeClass(order.status)}>
                                                {order.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                                                {order.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="p-4 font-semibold">₹{order.total.toLocaleString()}</td>
                                        <td className="p-4">
                                            <Link to={`/admin/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
