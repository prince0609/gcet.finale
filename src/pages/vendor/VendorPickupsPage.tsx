import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Eye, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function VendorPickupsPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const pickups = [
        {
            id: 'PKP-001',
            orderId: 'ORD-1234',
            customer: 'Acme Corp',
            scheduledDate: new Date(2026, 0, 31, 14, 0),
            location: 'Warehouse A',
            status: 'Pending',
            items: 3,
            contactPerson: 'John Doe',
            contactPhone: '+91 98765 43210',
        },
        {
            id: 'PKP-002',
            orderId: 'ORD-1235',
            customer: 'Tech Solutions',
            scheduledDate: new Date(2026, 1, 1, 10, 30),
            location: 'Site B - Construction Area',
            status: 'Confirmed',
            items: 5,
            contactPerson: 'Jane Smith',
            contactPhone: '+91 98765 43211',
        },
        {
            id: 'PKP-003',
            orderId: 'ORD-1236',
            customer: 'Creative Studio',
            scheduledDate: new Date(2026, 1, 1, 15, 0),
            location: 'Warehouse A',
            status: 'Completed',
            items: 2,
            contactPerson: 'Mike Johnson',
            contactPhone: '+91 98765 43212',
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            Pending: 'bg-warning/10 text-warning',
            Confirmed: 'bg-info/10 text-info',
            Completed: 'bg-success/10 text-success',
        };
        return <Badge className={styles[status] || ''}>{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold">Pickup Management</h1>
                <p className="text-muted-foreground">Schedule and process equipment pickups</p>
            </div>

            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by pickup ID, order ID, or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Pickups</p>
                    <p className="text-2xl font-bold mt-1">{pickups.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold mt-1 text-warning">
                        {pickups.filter(p => p.status === 'Pending').length}
                    </p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold mt-1 text-success">
                        {pickups.filter(p => p.status === 'Completed').length}
                    </p>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Pickup ID</th>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Scheduled Date & Time</th>
                                <th>Location</th>
                                <th>Items</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pickups.map((pickup) => (
                                <tr key={pickup.id}>
                                    <td><span className="font-medium">{pickup.id}</span></td>
                                    <td><span className="text-sm">{pickup.orderId}</span></td>
                                    <td>{pickup.customer}</td>
                                    <td>
                                        <div>
                                            <p className="font-medium">{format(pickup.scheduledDate, 'dd MMM yyyy')}</p>
                                            <p className="text-sm text-muted-foreground">{format(pickup.scheduledDate, 'hh:mm a')}</p>
                                        </div>
                                    </td>
                                    <td>{pickup.location}</td>
                                    <td>{pickup.items} items</td>
                                    <td>
                                        <div>
                                            <p className="text-sm">{pickup.contactPerson}</p>
                                            <p className="text-xs text-muted-foreground">{pickup.contactPhone}</p>
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(pickup.status)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/vendor/pickups/${pickup.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {pickup.status !== 'Completed' && (
                                                <Button variant="outline" size="sm">
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Mark Picked
                                                </Button>
                                            )}
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
            </Card>
        </div>
    );
}
