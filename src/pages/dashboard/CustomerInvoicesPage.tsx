import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/mockData';

export default function CustomerInvoicesPage() {
  const navigate = useNavigate();
  const customerInvoices = mockInvoices.filter((i) => i.customerId === 'cust-1');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      sent: 'bg-info/10 text-info',
      paid: 'bg-success/10 text-success',
      overdue: 'bg-destructive/10 text-destructive',
      cancelled: 'bg-muted text-muted-foreground',
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
          <h1 className="text-2xl font-bold">My Invoices</h1>
          <p className="text-muted-foreground">View and download your invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Order #</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customerInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-success/10 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-success" />
                      </div>
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm">{invoice.orderNumber}</span>
                  </td>
                  <td>
                    <p className="text-sm">{format(invoice.createdAt, 'dd MMM yyyy')}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(invoice.dueDate, 'dd MMM')}
                    </p>
                  </td>
                  <td>
                    <p className="font-semibold">₹{invoice.total.toLocaleString()}</p>
                    {invoice.amountDue > 0 && (
                      <p className="text-xs text-warning">
                        Due: ₹{invoice.amountDue.toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
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
