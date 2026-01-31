import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/mockData';
import { format } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const order = mockOrders.find(o => o.id === id);

    if (!order) {
        return (
            <div className="space-y-6">
                <Link to="/admin/orders">
                    <Button variant="ghost">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>
                <p>Order not found</p>
            </div>
        );
    }

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin/orders">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                        <p className="text-sm text-muted-foreground">
                            Created on {order.createdAt && format(new Date(order.createdAt), 'MMMM dd, yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Details */}
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Order Details</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Status:</span>
                                <Select defaultValue={order.status}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="return_pending">Return Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Invoice Number</p>
                                <p className="font-medium">INV/{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rental Period</p>
                                <p className="font-medium">
                                    {order.pickupDate && format(new Date(order.pickupDate), 'MMM dd')} -
                                    {order.returnDate && format(new Date(order.returnDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Order Date</p>
                                <p className="font-medium">
                                    {order.createdAt && format(new Date(order.createdAt), 'MMM dd, yyyy')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Delivery Date</p>
                                <p className="font-medium">
                                    {order.pickupDate && format(new Date(order.pickupDate), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold">Description</th>
                                        <th className="p-3 text-center text-sm font-semibold">Quantity</th>
                                        <th className="p-3 text-right text-sm font-semibold">Unit Price</th>
                                        <th className="p-3 text-right text-sm font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="p-3">
                                                <p className="font-medium">{item.productName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.periodCount} {item.rentalPeriod}
                                                </p>
                                            </td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">₹{item.unitPrice.toLocaleString()}</td>
                                            <td className="p-3 text-right font-semibold">₹{item.total.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (18%)</span>
                                <span>₹{order.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Security Deposit</span>
                                <span>₹{order.securityDeposit.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>₹{order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                        <p className="text-sm text-muted-foreground">
                            There should be a warranty cover for the standard items and conditions.
                            Warranty should cover only for the standard items.
                        </p>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-4">Customer Information</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Company</p>
                                <p className="font-medium">{order.customerCompany}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">GSTIN</p>
                                <p className="font-medium">{order.customerGstin}</p>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-4">Delivery Address</h3>
                        <div className="space-y-1 text-sm">
                            <p>{order.shippingAddress.contactPerson}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                            <p>{order.shippingAddress.pincode}</p>
                            <p className="pt-2 text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card rounded-xl border p-6">
                        <h3 className="font-semibold mb-4">Actions</h3>
                        <div className="space-y-2">
                            <Button className="w-full" variant="outline">Generate Invoice</Button>
                            <Button className="w-full" variant="outline">Send Email</Button>
                            <Button className="w-full" variant="outline">Add Note</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
