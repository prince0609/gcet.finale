import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function VendorInvoicesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const invoices = [
        {
            id: 'INV-2024-001',
            orderId: 'ORD-1234',
            customer: 'BuildCo Ltd',
            invoiceDate: new Date(2026, 0, 15),
            dueDate: new Date(2026, 1, 15),
            total: 52000,
            paid: 52000,
            status: 'Paid',
            paymentMode: 'Online',
        },
        {
            id: 'INV-2024-002',
            orderId: 'ORD-1235',
            customer: 'Event Planners',
            invoiceDate: new Date(2026, 0, 20),
            dueDate: new Date(2026, 1, 20),
            total: 38000,
            paid: 20000,
            status: 'Partially Paid',
            paymentMode: 'Partial',
        },
        {
            id: 'INV-2024-003',
            orderId: 'ORD-1236',
            customer: 'Photo Pro',
            invoiceDate: new Date(2026, 0, 25),
            dueDate: new Date(2026, 1, 25),
            total: 64000,
            paid: 0,
            status: 'Pending',
            paymentMode: 'Pending',
        },
        {
            id: 'INV-2024-004',
            orderId: 'ORD-1237',
            customer: 'Film Studio',
            invoiceDate: new Date(2026, 0, 28),
            dueDate: new Date(2026, 1, 28),
            total: 95000,
            paid: 95000,
            status: 'Paid',
            paymentMode: 'Bank Transfer',
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Paid: 'bg-success/10 text-success',
            'Partially Paid': 'bg-info/10 text-info',
            Pending: 'bg-warning/10 text-warning',
            Overdue: 'bg-destructive/10 text-destructive',
        };
        return <Badge className={styles[status] || ''}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Invoice & Payments</h1>
                    <p className="text-muted-foreground">Manage invoices and track payments</p>
                </div>
                <Button className="gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                </Button>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by invoice ID, order ID, or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Invoices</p>
                    <p className="text-2xl font-bold mt-1">{invoices.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Billed</p>
                    <p className="text-2xl font-bold mt-1">
                        ₹{invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        ₹{invoices.reduce((sum, inv) => sum + inv.paid, 0).toLocaleString()}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        ₹{invoices.reduce((sum, inv) => sum + (inv.total - inv.paid), 0).toLocaleString()}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Invoice Date</th>
                                <th>Due Date</th>
                                <th>Total Amount</th>
                                <th>Paid Amount</th>
                                <th>Due Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td><span className="font-medium">{invoice.id}</span></td>
                                    <td><span className="text-sm">{invoice.orderId}</span></td>
                                    <td>{invoice.customer}</td>
                                    <td>{format(invoice.invoiceDate, 'dd MMM yyyy')}</td>
                                    <td>
                                        <span className={new Date() > invoice.dueDate && invoice.status !== 'Paid' ? 'text-destructive' : ''}>
                                            {format(invoice.dueDate, 'dd MMM yyyy')}
                                        </span>
                                    </td>
                                    <td><span className="font-semibold">₹{invoice.total.toLocaleString()}</span></td>
                                    <td><span className="text-success">₹{invoice.paid.toLocaleString()}</span></td>
                                    <td>
                                        <span className={invoice.total - invoice.paid > 0 ? 'text-warning font-semibold' : 'text-muted-foreground'}>
                                            ₹{(invoice.total - invoice.paid).toLocaleString()}
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(invoice.status)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/vendor/invoices/${invoice.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
