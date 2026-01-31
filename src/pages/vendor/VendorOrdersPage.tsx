import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

export default function VendorOrdersPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock quotations data
    const quotations = [
        {
            id: 'QT-2024-001',
            customer: 'Acme Corp',
            createdDate: new Date(2026, 0, 25),
            status: 'Sent',
            expiryDate: new Date(2026, 1, 10),
            total: 45000,
        },
        {
            id: 'QT-2024-002',
            customer: 'Tech Solutions',
            createdDate: new Date(2026, 0, 28),
            status: 'Draft',
            expiryDate: new Date(2026, 1, 15),
            total: 32000,
        },
        {
            id: 'QT-2024-003',
            customer: 'Creative Studio',
            createdDate: new Date(2026, 0, 30),
            status: 'Sent',
            expiryDate: new Date(2026, 1, 20),
            total: 28500,
        },
    ];

    // Mock rental orders data
    const rentalOrders = [
        {
            id: 'ORD-1234',
            customer: 'BuildCo Ltd',
            rentalStart: new Date(2026, 1, 1),
            rentalEnd: new Date(2026, 1, 7),
            status: 'In Progress',
            paymentStatus: 'Paid',
            total: 52000,
        },
        {
            id: 'ORD-1235',
            customer: 'Event Planners',
            rentalStart: new Date(2026, 1, 5),
            rentalEnd: new Date(2026, 1, 10),
            status: 'Confirmed',
            paymentStatus: 'Partial',
            total: 38000,
        },
        {
            id: 'ORD-1236',
            customer: 'Photo Pro',
            rentalStart: new Date(2026, 0, 20),
            rentalEnd: new Date(2026, 0, 28),
            status: 'Completed',
            paymentStatus: 'Paid',
            total: 64000,
        },
        {
            id: 'ORD-1237',
            customer: 'Film Studio',
            rentalStart: new Date(2026, 1, 10),
            rentalEnd: new Date(2026, 1, 20),
            status: 'Confirmed',
            paymentStatus: 'Pending',
            total: 95000,
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Draft: 'bg-muted text-muted-foreground',
            Sent: 'bg-info/10 text-info',
            Confirmed: 'bg-success/10 text-success',
            'In Progress': 'bg-primary/10 text-primary',
            Completed: 'bg-success/10 text-success',
            Cancelled: 'bg-destructive/10 text-destructive',
        };
        return <Badge className={styles[status] || ''}>{status}</Badge>;
    };

    const getPaymentBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'bg-warning/10 text-warning',
            Partial: 'bg-info/10 text-info',
            Paid: 'bg-success/10 text-success',
        };
        return <Badge className={styles[status] || ''}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Order Management</h1>
                <p className="text-muted-foreground">Manage quotations and rental orders</p>
            </div>

            {/* Filters & Search */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by order ID or customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md bg-background"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="quotations">Quotations ({quotations.length})</TabsTrigger>
                    <TabsTrigger value="orders">Rental Orders ({rentalOrders.length})</TabsTrigger>
                </TabsList>

                {/* Quotations Tab */}
                <TabsContent value="quotations">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Quote ID</th>
                                        <th>Customer</th>
                                        <th>Created Date</th>
                                        <th>Status</th>
                                        <th>Expiry Date</th>
                                        <th>Total Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotations.map((quote) => (
                                        <tr key={quote.id}>
                                            <td>
                                                <span className="font-medium">{quote.id}</span>
                                            </td>
                                            <td>{quote.customer}</td>
                                            <td>{format(quote.createdDate, 'dd MMM yyyy')}</td>
                                            <td>{getStatusBadge(quote.status)}</td>
                                            <td>
                                                <span className={new Date() > quote.expiryDate ? 'text-destructive' : ''}>
                                                    {format(quote.expiryDate, 'dd MMM yyyy')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-semibold">₹{quote.total.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/vendor/quotations/${quote.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>

                {/* Rental Orders Tab */}
                <TabsContent value="orders">
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Rental Period</th>
                                        <th>Status</th>
                                        <th>Payment</th>
                                        <th>Amount</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rentalOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>
                                                <span className="font-medium">{order.id}</span>
                                            </td>
                                            <td>{order.customer}</td>
                                            <td>
                                                <div>
                                                    <p className="text-sm">
                                                        {format(order.rentalStart, 'dd MMM')} → {format(order.rentalEnd, 'dd MMM yyyy')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {Math.ceil((order.rentalEnd.getTime() - order.rentalStart.getTime()) / (1000 * 60 * 60 * 24))} days
                                                    </p>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td>{getPaymentBadge(order.paymentStatus)}</td>
                                            <td>
                                                <span className="font-semibold">₹{order.total.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/vendor/orders/${order.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Invoice
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold mt-1">{rentalOrders.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                    <p className="text-2xl font-bold mt-1 text-primary">
                        {rentalOrders.filter(o => o.status === 'In Progress').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Pending Quotations</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {quotations.filter(q => q.status === 'Draft').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        ₹{rentalOrders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                    </p>
                </Card>
            </div>
        </div>
    );
}
