import React, { useState } from 'react';
import { Download, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export default function VendorReportsPage() {
    const [dateRange, setDateRange] = useState('30days');

    // Mock revenue data
    const revenueData = [
        { date: new Date(2026, 0, 1), orders: 5, revenue: 45000 },
        { date: new Date(2026, 0, 5), orders: 3, revenue: 32000 },
        { date: new Date(2026, 0, 10), orders: 7, revenue: 68000 },
        { date: new Date(2026, 0, 15), orders: 4, revenue: 38000 },
        { date: new Date(2026, 0, 20), orders: 6, revenue: 52000 },
        { date: new Date(2026, 0, 25), orders: 8, revenue: 74000 },
        { date: new Date(2026, 0, 30), orders: 5, revenue: 48000 },
    ];

    // Mock product performance
    const productPerformance = [
        { product: 'Canon EOS R5', rentals: 45, revenue: 112500, avgDuration: 5 },
        { product: 'Sony A7 IV', rentals: 38, revenue: 95000, avgDuration: 4.5 },
        { product: 'DJI Ronin RS3', rentals: 32, revenue: 72000, avgDuration: 4 },
        { product: 'Godox AD600', rentals: 28, revenue: 50400, avgDuration: 3.5 },
        { product: 'Rode Wireless GO II', rentals: 25, revenue: 30000, avgDuration: 3 },
    ];

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Analyze your business performance</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-background"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="year">This Year</option>
                    </select>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <h3 className="text-2xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</h3>
                            <p className="text-sm text-success mt-1">+15.3% from previous period</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-success" />
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-2">{totalOrders}</h3>
                    <p className="text-sm text-info mt-1">+8.2% from previous period</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <h3 className="text-2xl font-bold mt-2">
                        ₹{Math.round(totalRevenue / totalOrders).toLocaleString()}
                    </h3>
                    <p className="text-sm text-primary mt-1">+6.5% from previous period</p>
                </Card>
                <Card className="p-6">
                    <p className="text-sm text-muted-foreground">Total Rentals</p>
                    <h3 className="text-2xl font-bold mt-2">
                        {productPerformance.reduce((sum, p) => sum + p.rentals, 0)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Across all products</p>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-80 flex items-center justify-center bg-secondary/20 rounded-lg">
                    <p className="text-muted-foreground">Revenue Chart Visualization</p>
                </div>
            </Card>

            {/* Revenue Report Table */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Report</h3>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Number of Orders</th>
                                <th>Revenue (Before Tax)</th>
                                <th>Tax (18%)</th>
                                <th>Revenue (After Tax)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueData.map((data, index) => {
                                const tax = data.revenue * 0.18;
                                const afterTax = data.revenue + tax;
                                return (
                                    <tr key={index}>
                                        <td>{format(data.date, 'dd MMM yyyy')}</td>
                                        <td>{data.orders}</td>
                                        <td>₹{data.revenue.toLocaleString()}</td>
                                        <td>₹{tax.toLocaleString()}</td>
                                        <td className="font-semibold">₹{afterTax.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                            <tr className="font-bold bg-secondary/20">
                                <td>Total</td>
                                <td>{totalOrders}</td>
                                <td>₹{totalRevenue.toLocaleString()}</td>
                                <td>₹{(totalRevenue * 0.18).toLocaleString()}</td>
                                <td>₹{(totalRevenue * 1.18).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Product Performance */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Product Performance</h3>
                    <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Total Rentals</th>
                                <th>Total Revenue</th>
                                <th>Avg Duration (days)</th>
                                <th>Avg Revenue/Rental</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productPerformance.map((product, index) => (
                                <tr key={index}>
                                    <td className="font-medium">{product.product}</td>
                                    <td>{product.rentals}</td>
                                    <td className="font-semibold">₹{product.revenue.toLocaleString()}</td>
                                    <td>{product.avgDuration}</td>
                                    <td>₹{Math.round(product.revenue / product.rentals).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
