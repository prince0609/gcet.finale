import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, FileText, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOrders, mockInvoices } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Filter orders for current customer (demo)
  const customerOrders = mockOrders.filter((o) => o.customerId === 'cust-1').slice(0, 3);
  const customerInvoices = mockInvoices.filter((i) => i.customerId === 'cust-1').slice(0, 3);

  const activeRentals = customerOrders.filter((o) => o.status === 'delivered').length;
  const pendingReturns = customerOrders.filter((o) => o.status === 'return_pending').length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      confirmed: 'bg-info/10 text-info border-info/20',
      delivered: 'bg-success/10 text-success border-success/20',
      return_pending: 'bg-warning/10 text-warning border-warning/20',
      returned: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return <Badge className={styles[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">{user?.companyName}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="metric-value">{activeRentals}</p>
              <p className="metric-label">Active Rentals</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="metric-value">{pendingReturns}</p>
              <p className="metric-label">Pending Returns</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="metric-value">{customerInvoices.length}</p>
              <p className="metric-label">Invoices</p>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="metric-value">₹{(12450).toLocaleString()}</p>
              <p className="metric-label">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          <Link to="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {customerOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.items.map((i) => i.productName).join(', ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(order.status)}
                <p className="text-sm text-muted-foreground mt-1">
                  {format(order.createdAt, 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Invoices</h2>
          <Link to="/dashboard/invoices">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {customerInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Order: {invoice.orderNumber}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{invoice.total.toLocaleString()}</p>
                <Badge
                  className={
                    invoice.status === 'paid'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }
                >
                  {invoice.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
