import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  TruckIcon,
  AlertCircle,
  ArrowRight,
  Eye,
  CheckCircle,
  ShoppingBag,
  BarChart3,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function VendorDashboard() {
  // Mock KPI data
  const kpis = [
    {
      title: 'Monthly Revenue',
      value: '₹1,24,500',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'Active Rentals',
      value: '23',
      subtitle: 'Items with customers',
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Upcoming Pickups',
      value: '5',
      subtitle: 'Today & tomorrow',
      icon: TruckIcon,
      color: 'text-info',
    },
    {
      title: 'Overdue Returns',
      value: '2',
      subtitle: 'Requires attention',
      icon: AlertCircle,
      color: 'text-warning',
    },
  ];

  // Mock upcoming pickups
  const upcomingPickups = [
    {
      id: 'ORD-1234',
      customer: 'Acme Corp',
      date: new Date(2026, 0, 31, 14, 0),
      location: 'Warehouse A',
      status: 'Pending',
      items: 3,
    },
    {
      id: 'ORD-1235',
      customer: 'Tech Solutions',
      date: new Date(2026, 1, 1, 10, 30),
      location: 'Site B',
      status: 'Confirmed',
      items: 5,
    },
    {
      id: 'ORD-1236',
      customer: 'Creative Studio',
      date: new Date(2026, 1, 1, 15, 0),
      location: 'Warehouse A',
      status: 'Pending',
      items: 2,
    },
  ];

  // Mock upcoming returns
  const upcomingReturns = [
    {
      id: 'ORD-1220',
      customer: 'BuildCo Ltd',
      plannedDate: new Date(2026, 0, 31),
      status: 'Due Today',
      items: 4,
      isOverdue: false,
    },
    {
      id: 'ORD-1218',
      customer: 'Event Planners',
      plannedDate: new Date(2026, 0, 30),
      status: 'Overdue',
      items: 2,
      isOverdue: true,
    },
    {
      id: 'ORD-1225',
      customer: 'Photo Pro',
      plannedDate: new Date(2026, 1, 2),
      status: 'Upcoming',
      items: 6,
      isOverdue: false,
    },
  ];

  // Mock top products
  const topProducts = [
    { name: 'Canon EOS R5', rentals: 45, revenue: 67500 },
    { name: 'Sony A7 IV', rentals: 38, revenue: 57000 },
    { name: 'DJI Ronin RS3', rentals: 32, revenue: 48000 },
    { name: 'Godox AD600', rentals: 28, revenue: 42000 },
    { name: 'Rode Wireless GO II', rentals: 25, revenue: 37500 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/vendor/products/new">
            <Button className="gradient-primary text-primary-foreground">
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                {kpi.change && (
                  <p className={`text-sm mt-1 ${kpi.color}`}>{kpi.change} from last month</p>
                )}
                {kpi.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{kpi.subtitle}</p>
                )}
              </div>
              <div className={`h-12 w-12 rounded-lg bg-${kpi.color.replace('text-', '')}/10 flex items-center justify-center`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">7 Days</Button>
              <Button variant="ghost" size="sm">30 Days</Button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-secondary/20 rounded-lg">
            <p className="text-muted-foreground">Chart: Revenue over time</p>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Rented Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.rentals} rentals</p>
                  </div>
                </div>
                <p className="font-semibold">₹{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Pickups */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Pickups</h3>
          <Link to="/vendor/pickups">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPickups.map((pickup) => (
                <tr key={pickup.id}>
                  <td>
                    <span className="font-medium">{pickup.id}</span>
                  </td>
                  <td>{pickup.customer}</td>
                  <td>
                    <div>
                      <p className="font-medium">{format(pickup.date, 'dd MMM yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{format(pickup.date, 'hh:mm a')}</p>
                    </div>
                  </td>
                  <td>{pickup.location}</td>
                  <td>{pickup.items} items</td>
                  <td>
                    <Badge className={pickup.status === 'Confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                      {pickup.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Picked
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upcoming Returns */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upcoming Returns</h3>
          <Link to="/vendor/returns">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Planned Return</th>
                <th>Items</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingReturns.map((returnItem) => (
                <tr key={returnItem.id}>
                  <td>
                    <span className="font-medium">{returnItem.id}</span>
                  </td>
                  <td>{returnItem.customer}</td>
                  <td>
                    <p className={returnItem.isOverdue ? 'text-destructive font-medium' : ''}>
                      {format(returnItem.plannedDate, 'dd MMM yyyy')}
                    </p>
                  </td>
                  <td>{returnItem.items} items</td>
                  <td>
                    <Badge className={
                      returnItem.isOverdue
                        ? 'bg-destructive/10 text-destructive'
                        : returnItem.status === 'Due Today'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-info/10 text-info'
                    }>
                      {returnItem.status}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline" size="sm">
                      Process Return
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/vendor/orders">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <ShoppingBag className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">View All Orders</h3>
            <p className="text-sm text-muted-foreground">Manage quotations and rental orders</p>
          </Card>
        </Link>
        <Link to="/vendor/reports">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <BarChart3 className="h-8 w-8 text-success mb-3" />
            <h3 className="font-semibold mb-1">View Reports</h3>
            <p className="text-sm text-muted-foreground">Analyze revenue and performance</p>
          </Card>
        </Link>
        <Link to="/vendor/invoices">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <FileText className="h-8 w-8 text-info mb-3" />
            <h3 className="font-semibold mb-1">Manage Invoices</h3>
            <p className="text-sm text-muted-foreground">Track payments and generate invoices</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
