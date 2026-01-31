import React, { useState } from 'react';
import { Search, Mail, Phone, MapPin, Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    gstin: string;
    totalOrders: number;
    totalSpent: number;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

// Mock customers data
const mockCustomers: Customer[] = [
    {
        id: 'cust-1',
        name: 'Rahul Sharma',
        email: 'rahul@xyzevents.com',
        phone: '9876543210',
        company: 'XYZ Events Pvt Ltd',
        gstin: '27ABCDE1234F1Z5',
        totalOrders: 12,
        totalSpent: 45000,
        address: '123 MG Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
    },
    {
        id: 'cust-2',
        name: 'Priya Mehta',
        email: 'priya@creative.com',
        phone: '9876543220',
        company: 'Creative Studios',
        gstin: '24XYZAB5678C1D2',
        totalOrders: 8,
        totalSpent: 32000,
        address: '456 Park Street',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700016',
    },
    {
        id: 'cust-3',
        name: 'Vikram Singh',
        email: 'vikram@filmfactory.com',
        phone: '9876543230',
        company: 'Film Factory',
        gstin: '29LMNOP1234Q1R2',
        totalOrders: 15,
        totalSpent: 67000,
        address: '789 Film Nagar',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
    },
    {
        id: 'cust-4',
        name: 'Anita Desai',
        email: 'anita@photoworks.com',
        phone: '9876543240',
        company: 'Photo Works',
        gstin: '27QWERT9876Z1X2',
        totalOrders: 6,
        totalSpent: 28000,
        address: '321 Brigade Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
    },
    {
        id: 'cust-5',
        name: 'Karan Patel',
        email: 'karan@mediapro.com',
        phone: '9876543250',
        company: 'Media Pro',
        gstin: '24ASDFG5432H1J2',
        totalOrders: 10,
        totalSpent: 52000,
        address: '654 SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
    },
    {
        id: 'cust-6',
        name: 'Sneha Reddy',
        email: 'sneha@eventco.com',
        phone: '9876543260',
        company: 'Event Co',
        gstin: '29ZXCVB3210K1L2',
        totalOrders: 4,
        totalSpent: 18000,
        address: '987 Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500034',
    },
];

export default function AdminCustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    const filteredCustomers = mockCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsDetailsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Customers</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-64"
                    />
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-primary">{customer.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{customer.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{customer.company}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.phone}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="text-xs text-muted-foreground">Total Orders</p>
                                <p className="font-semibold">{customer.totalOrders}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Total Spent</p>
                                <p className="font-semibold">₹{customer.totalSpent.toLocaleString()}</p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => handleViewDetails(customer)}
                        >
                            View Details
                        </Button>
                    </div>
                ))}
            </div>

            {/* Customer Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Customer Details</DialogTitle>
                        <DialogDescription>Complete information about the customer</DialogDescription>
                    </DialogHeader>

                    {selectedCustomer && (
                        <div className="space-y-6 py-4">
                            {/* Customer Info */}
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl font-semibold text-primary">{selectedCustomer.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                                    <p className="text-muted-foreground">{selectedCustomer.company}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Contact Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{selectedCustomer.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Phone</p>
                                        <p className="font-medium">{selectedCustomer.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Business Information */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Business Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Company Name</p>
                                        <p className="font-medium">{selectedCustomer.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">GSTIN</p>
                                        <p className="font-medium">{selectedCustomer.gstin}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Address */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Address
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-medium">{selectedCustomer.address}</p>
                                    <p className="text-muted-foreground">
                                        {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Order Statistics */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Order Statistics
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                        <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                        <p className="text-2xl font-bold">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                                    Close
                                </Button>
                                <Button>
                                    View Orders
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
