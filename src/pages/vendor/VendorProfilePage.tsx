import React, { useState } from 'react';
import { Save, Building2, Mail, Phone, MapPin, CreditCard, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VendorProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        companyName: 'RentPro Equipment',
        email: 'vendor@rentpro.com',
        phone: '+91 98765 43210',
        address: '123 Business Park, Mumbai, Maharashtra 400001',
        gstin: '27AABCU9603R1ZM',
        pan: 'AABCU9603R',
        bankName: 'HDFC Bank',
        accountNumber: '****5678',
        ifsc: 'HDFC0001234',
    });

    const handleSave = () => {
        toast.success('Profile updated successfully');
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Vendor Profile & Settings</h1>
                    <p className="text-muted-foreground">Manage your company information and preferences</p>
                </div>
                <Button
                    variant={isEditing ? 'outline' : 'default'}
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
            </div>

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company">Company Info</TabsTrigger>
                    <TabsTrigger value="banking">Banking Details</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* Company Info Tab */}
                <TabsContent value="company">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{formData.companyName}</h2>
                                <p className="text-muted-foreground">Vendor Account</p>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gstin">GSTIN</Label>
                                    <Input
                                        id="gstin"
                                        value={formData.gstin}
                                        disabled
                                        className="bg-muted/50"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        GSTIN cannot be changed. Contact support for assistance.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pan">PAN</Label>
                                <Input
                                    id="pan"
                                    value={formData.pan}
                                    disabled
                                    className="bg-muted/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        disabled={!isEditing}
                                        className="pl-10 min-h-[80px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Banking Details Tab */}
                <TabsContent value="banking">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <CreditCard className="h-6 w-6 text-primary" />
                            <h3 className="text-lg font-semibold">Banking & Payout Details</h3>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bankName">Bank Name</Label>
                                <Input
                                    id="bankName"
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">Account Number</Label>
                                    <Input
                                        id="accountNumber"
                                        value={formData.accountNumber}
                                        disabled
                                        className="bg-muted/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ifsc">IFSC Code</Label>
                                    <Input
                                        id="ifsc"
                                        value={formData.ifsc}
                                        disabled
                                        className="bg-muted/50"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                To update banking details, please contact support with proper documentation.
                            </p>
                        </div>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <Bell className="h-6 w-6 text-primary" />
                            <h3 className="text-lg font-semibold">Notification Preferences</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">New Orders</p>
                                    <p className="text-sm text-muted-foreground">Get notified when you receive new orders</p>
                                </div>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Upcoming Pickups</p>
                                    <p className="text-sm text-muted-foreground">Reminders for scheduled pickups</p>
                                </div>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Overdue Returns</p>
                                    <p className="text-sm text-muted-foreground">Alerts for overdue equipment returns</p>
                                </div>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Payment Received</p>
                                    <p className="text-sm text-muted-foreground">Notifications when payments are received</p>
                                </div>
                                <input type="checkbox" defaultChecked className="h-4 w-4" />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b">
                            <Shield className="h-6 w-6 text-primary" />
                            <h3 className="text-lg font-semibold">Security Settings</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Change Password</h4>
                                <div className="space-y-3">
                                    <Input type="password" placeholder="Current Password" />
                                    <Input type="password" placeholder="New Password" />
                                    <Input type="password" placeholder="Confirm New Password" />
                                    <Button>Update Password</Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-2">Active Sessions</h4>
                                <p className="text-sm text-muted-foreground mb-3">Manage your active login sessions</p>
                                <Button variant="outline" className="text-destructive">
                                    Logout All Devices
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
