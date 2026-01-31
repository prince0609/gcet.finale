import React, { useState } from 'react';
import { Search, Eye, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/mockData';
import { format } from 'date-fns';

export default function AdminInvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInvoices = mockInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Invoices</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                    />
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-card rounded-xl border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b">
                            <tr className="text-left">
                                <th className="p-4 font-semibold">Invoice Number</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Order Number</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Due Date</th>
                                <th className="p-4 font-semibold">Amount</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="p-4">
                                        <p className="font-medium">{invoice.invoiceNumber}</p>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{invoice.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{invoice.customerCompany}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">{invoice.orderNumber}</td>
                                    <td className="p-4 text-sm">
                                        {invoice.createdAt && format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="p-4 text-sm">
                                        {invoice.dueDate && format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="p-4 font-semibold">₹{invoice.total.toLocaleString()}</td>
                                    <td className="p-4">
                                        <Badge className={invoice.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                                            {invoice.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
