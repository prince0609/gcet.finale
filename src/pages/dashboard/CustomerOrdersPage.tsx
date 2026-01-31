import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Package, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/mockData';

export default function CustomerOrdersPage() {
  const navigate = useNavigate();
  const customerOrders = mockOrders.filter((o) => o.customerId === 'cust-1');

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

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      partial: 'bg-info/10 text-info',
      paid: 'bg-success/10 text-success',
    };
    return <Badge className={styles[status] || ''}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your rental orders</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Items</th>
                <th>Period</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(order.createdAt, 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-[200px]">
                      <p className="truncate text-sm">
                        {order.items.map((i) => i.productName).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                      </p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">
                      {order.items[0]?.startDate && format(order.items[0].startDate, 'dd MMM')}
                      {' → '}
                      {order.items[0]?.endDate && format(order.items[0].endDate, 'dd MMM')}
                    </p>
                  </td>
                  <td>
                    <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{getPaymentBadge(order.paymentStatus)}</td>
                  <td>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
