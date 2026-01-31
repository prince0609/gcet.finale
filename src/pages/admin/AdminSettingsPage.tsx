import React, { useState } from 'react';
import { Upload, Plus, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const reportData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 38000 },
    { month: 'Mar', revenue: 52000 },
    { month: 'Apr', revenue: 48000 },
    { month: 'May', revenue: 61000 },
];

const mockUsers = [
    { id: 1, name: 'Admin User', email: 'admin@rentflow.com', role: 'Admin' },
    { id: 2, name: 'Vendor 1', email: 'vendor1@example.com', role: 'Vendor' },
    { id: 3, name: 'Customer 1', email: 'customer1@example.com', role: 'Customer' },
];

const mockAttributes = [
    { id: 1, name: 'Color', values: ['Black', 'White', 'Silver', 'Red'] },
    { id: 2, name: 'Size', values: ['Small', 'Medium', 'Large'] },
    { id: 3, name: 'Brand', values: ['Sony', 'Canon', 'Nikon'] },
];

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Settings</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                    <TabsTrigger value="general">Setting</TabsTrigger>
                    <TabsTrigger value="rental">Rental Period</TabsTrigger>
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* General Settings Tab */}
                <TabsContent value="general" className="space-y-6">
                    <div className="bg-card rounded-xl border p-6">
                        <h2 className="text-lg font-semibold mb-6">General Settings</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input placeholder="RentFlow Pro" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" placeholder="contact@rentflow.com" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input placeholder="+91 98765 43210" />
                                </div>
                                <div className="space-y-2">
                                    <Label>GST Number</Label>
                                    <Input placeholder="27ABCDE1234F1Z5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Company Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <Button variant="outline">Upload Logo</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input placeholder="Street address" className="mb-2" />
                                <div className="grid grid-cols-3 gap-2">
                                    <Input placeholder="City" />
                                    <Input placeholder="State" />
                                    <Input placeholder="PIN Code" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline">Cancel</Button>
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Rental Period Tab */}
                <TabsContent value="rental" className="space-y-6">
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Rental Period Configuration</h2>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Period
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-xs">Period Type</Label>
                                    <p className="font-medium">Hourly</p>
                                </div>
                                <div>
                                    <Label className="text-xs">Duration</Label>
                                    <p className="font-medium">1 Hour</p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-xs">Period Type</Label>
                                    <p className="font-medium">Daily</p>
                                </div>
                                <div>
                                    <Label className="text-xs">Duration</Label>
                                    <p className="font-medium">1 Day</p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-xs">Period Type</Label>
                                    <p className="font-medium">Weekly</p>
                                </div>
                                <div>
                                    <Label className="text-xs">Duration</Label>
                                    <p className="font-medium">7 Days</p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <Label className="text-xs">Period Type</Label>
                                    <p className="font-medium">Monthly</p>
                                </div>
                                <div>
                                    <Label className="text-xs">Duration</Label>
                                    <p className="font-medium">30 Days</p>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Attributes Tab */}
                <TabsContent value="attributes" className="space-y-6">
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Product Attributes</h2>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Attribute
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {mockAttributes.map((attr) => (
                                <div key={attr.id} className="p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold">{attr.name}</h3>
                                            <p className="text-sm text-muted-foreground">{attr.values.length} values</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.values.map((value, idx) => (
                                            <Badge key={idx} variant="secondary">{value}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">User Management</h2>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="p-4 font-semibold">Name</th>
                                        <th className="p-4 font-semibold">Email</th>
                                        <th className="p-4 font-semibold">Role</th>
                                        <th className="p-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockUsers.map((user) => (
                                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm">{user.email}</td>
                                            <td className="p-4">
                                                <Badge variant="outline">{user.role}</Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm">Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    <div className="bg-card rounded-xl border p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Reports & Analytics</h2>
                            <div className="flex gap-2">
                                <Select defaultValue="monthly">
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                                <p className="text-2xl font-bold">₹2,44,000</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                                <p className="text-2xl font-bold">156</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Avg Order Value</p>
                                <p className="text-2xl font-bold">₹1,564</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
