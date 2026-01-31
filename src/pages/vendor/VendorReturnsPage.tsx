import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function VendorReturnsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const returns = [
        {
            id: 'RET-001',
            orderId: 'ORD-1220',
            customer: 'BuildCo Ltd',
            plannedDate: new Date(2026, 0, 31),
            actualDate: null,
            status: 'Due Today',
            items: 4,
            isOverdue: false,
            lateFee: 0,
        },
        {
            id: 'RET-002',
            orderId: 'ORD-1218',
            customer: 'Event Planners',
            plannedDate: new Date(2026, 0, 30),
            actualDate: null,
            status: 'Overdue',
            items: 2,
            isOverdue: true,
            lateFee: 2000,
        },
        {
            id: 'RET-003',
            orderId: 'ORD-1225',
            customer: 'Photo Pro',
            plannedDate: new Date(2026, 1, 2),
            actualDate: null,
            status: 'Upcoming',
            items: 6,
            isOverdue: false,
            lateFee: 0,
        },
        {
            id: 'RET-004',
            orderId: 'ORD-1210',
            customer: 'Film Studio',
            plannedDate: new Date(2026, 0, 28),
            actualDate: new Date(2026, 0, 28),
            status: 'Completed',
            items: 3,
            isOverdue: false,
            lateFee: 0,
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Due Today': 'bg-warning/10 text-warning',
            Overdue: 'bg-destructive/10 text-destructive',
            Upcoming: 'bg-info/10 text-info',
            Completed: 'bg-success/10 text-success',
        };
        return <Badge className={styles[status] || ''}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold">Return Management</h1>
                <p className="text-muted-foreground">Process equipment returns and calculate late fees</p>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by return ID, order ID, or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Returns</p>
                    <p className="text-2xl font-bold mt-1">{returns.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold mt-1 text-destructive">
                        {returns.filter(r => r.isOverdue).length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Due Today</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {returns.filter(r => r.status === 'Due Today').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Late Fees Pending</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        ₹{returns.reduce((sum, r) => sum + r.lateFee, 0).toLocaleString()}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Return ID</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Planned Return</th>
                                <th>Actual Return</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th>Late Fee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map((returnItem) => (
                                <tr key={returnItem.id}>
                                    <td><span className="font-medium">{returnItem.id}</span></td>
                                    <td><span className="text-sm">{returnItem.orderId}</span></td>
                                    <td>{returnItem.customer}</td>
                                    <td>
                                        <span className={returnItem.isOverdue ? 'text-destructive font-medium' : ''}>
                                            {format(returnItem.plannedDate, 'dd MMM yyyy')}
                                        </span>
                                    </td>
                                    <td>
                                        {returnItem.actualDate ? (
                                            format(returnItem.actualDate, 'dd MMM yyyy')
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td>{returnItem.items} items</td>
                                    <td>{getStatusBadge(returnItem.status)}</td>
                                    <td>
                                        {returnItem.lateFee > 0 ? (
                                            <span className="font-semibold text-warning">
                                                ₹{returnItem.lateFee.toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            {returnItem.status !== 'Completed' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/vendor/returns/${returnItem.id}`)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Process Return
                                                </Button>
                                            )}
                                            {returnItem.isOverdue && (
                                                <Button variant="ghost" size="sm" className="text-warning">
                                                    <AlertCircle className="h-4 w-4" />
                                                </Button>
                                            )}
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
