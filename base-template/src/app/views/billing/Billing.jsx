import React, { useState } from "react";
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { H3 } from "app/components/Typography";
import { StatusBadge, StatCard } from "app/components/admin/CommonAdminComponents";
import { ParcLoading } from "app/components";

export default function Billing() {
  const { invoices = [], loading } = useAdmin(); // Default to empty array
  const [viewingInvoice, setViewingInvoice] = useState(null);

  if (loading) return <ParcLoading />;

  // Safely calculate stats
  const safeInvoices = invoices || [];
  const mtdRevenue = safeInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const outstanding = safeInvoices
    .filter(inv => ['Due', 'Overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <Box sx={{ p: 3 }}>
      <H3 mb={3}>Billing & Invoices</H3>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 3 }}>
         <StatCard title="Revenue (MTD)" value={formatCurrency(mtdRevenue)} />
         <StatCard title="Outstanding" value={formatCurrency(outstanding)} />
         <StatCard title="Total Invoices" value={safeInvoices.length} />
      </Box>

      <Card>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Recent Invoices</Typography>
            <Button variant="contained">Generate Report</Button>
        </Box>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Institution</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeInvoices.map(inv => (
              <TableRow key={inv.id} hover>
                <TableCell sx={{ color: 'primary.main', fontWeight: 500 }}>{inv.id}</TableCell>
                <TableCell>{inv.tenantName}</TableCell>
                <TableCell>{inv.issueDate}</TableCell>
                <TableCell>{inv.dueDate}</TableCell>
                <TableCell align="right">{formatCurrency(inv.amount)}</TableCell>
                <TableCell><StatusBadge status={inv.status}>{inv.status}</StatusBadge></TableCell>
                <TableCell>
                    <Button size="small" onClick={() => setViewingInvoice(inv)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
            {safeInvoices.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No invoices found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {viewingInvoice && (
        <Dialog open={true} onClose={() => setViewingInvoice(null)} maxWidth="md" fullWidth>
            <DialogTitle display="flex" justifyContent="space-between">
                Invoice {viewingInvoice.id}
                <StatusBadge status={viewingInvoice.status}>{viewingInvoice.status}</StatusBadge>
            </DialogTitle>
            <DialogContent dividers>
                <Box mb={2}>
                    <Typography variant="subtitle2">Billed To:</Typography>
                    <Typography variant="h6">{viewingInvoice.tenantName}</Typography>
                </Box>
                <Table size="small">
                    <TableHead><TableRow><TableCell>Description</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead>
                    <TableBody>
                        {viewingInvoice.items.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>{item.description} (x{item.quantity})</TableCell>
                                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(viewingInvoice.amount)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setViewingInvoice(null)}>Close</Button>
                <Button variant="contained">Download PDF</Button>
            </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}