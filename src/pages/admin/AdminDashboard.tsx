import React from 'react';
import { TrendingUp, ShoppingCart, Package, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDashboardMetrics, mockOrders, mockRevenueData } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const metrics = mockDashboardMetrics;
    const recentOrders = mockOrders.slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="metric-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Total Revenue</span>
                        <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <p className="metric-value">₹{metrics.totalRevenue.toLocaleString()}</p>
                    <p className="metric-change-positive">+{metrics.revenueChange}% from last month</p>
                </div>
                <div className="metric-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Orders Today</span>
                        <ShoppingCart className="h-4 w-4 text-info" />
                    </div>
                    <p className="metric-value">{metrics.ordersToday}</p>
                    <p className="metric-change-positive">+{metrics.ordersChange} from yesterday</p>
                </div>
                <div className="metric-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Active Rentals</span>
                        <Package className="h-4 w-4 text-warning" />
                    </div>
                    <p className="metric-value">{metrics.activeRentals}</p>
                    <p className="metric-change-negative">{metrics.activeRentalsChange} from yesterday</p>
                </div>
                <div className="metric-card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Total Customers</span>
                        <Users className="h-4 w-4 text-accent" />
                    </div>
                    <p className="metric-value">156</p>
                    <p className="text-xs text-muted-foreground">+12 this month</p>
                </div>
            </div>

            {/* Chart & Recent Orders */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-card rounded-xl border p-6">
                    <h2 className="font-semibold mb-4">Revenue Trend (30 days)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">Recent Orders</h2>
                        <Link to="/admin/orders">
                            <Button variant="ghost" size="sm">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                <div>
                                    <p className="font-medium">{order.orderNumber}</p>
                                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                                    <Badge className={
                                        order.status === 'delivered' ? 'bg-success/10 text-success' :
                                            order.status === 'confirmed' ? 'bg-info/10 text-info' :
                                                order.status === 'draft' ? 'bg-muted text-muted-foreground' :
                                                    'bg-warning/10 text-warning'
                                    }>
                                        {order.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
