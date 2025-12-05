import React, { useState } from "react";
import { Box, Card, Button, Grid, Typography, Tabs, Tab, Table, TableHead, TableBody, TableCell, TableRow } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { StatusBadge, HealthScoreGauge } from "app/components/admin/CommonAdminComponents";
import { H3 } from "app/components/Typography";

export default function TenantDetail() {
  const { selectedTenant, setSelectedTenant, invoices, sandboxes } = useAdmin();
  const [tabValue, setTabValue] = useState(0);

  if (!selectedTenant) return null;

  const tenantInvoices = invoices.filter(inv => inv.tenantId === selectedTenant.id);
  const tenantSandboxes = sandboxes.filter(sb => sb.tenantId === selectedTenant.id);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  return (
    <Box sx={{ p: 3 }}>
        <Button onClick={() => setSelectedTenant(null)} sx={{ mb: 2 }}>&larr; Back to all institutions</Button>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
                <H3>{selectedTenant.name}</H3>
                <Box display="flex" gap={2} mt={1} color="text.secondary">
                    <span>ID: {selectedTenant.id}</span>
                    <StatusBadge status={selectedTenant.status} />
                    <span>Plan: <strong>{selectedTenant.plan}</strong></span>
                </Box>
            </Box>
            <Button variant="outlined">View as Client</Button>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Overview" />
            <Tab label="Health & Adoption" />
            <Tab label="Sandboxes" />
            <Tab label="Billing" />
        </Tabs>

        {/* Tab 0: Overview */}
        {tabValue === 0 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Usage Statistics</Typography>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">Active Users</Typography>
                            <Typography variant="h5">{selectedTenant.usage?.users?.toLocaleString()} / {selectedTenant.config?.provisionedUsers?.toLocaleString()}</Typography>
                        </Box>
                        <Box mb={2}>
                             <Typography variant="body2" color="text.secondary">Storage</Typography>
                             <Typography variant="h5">{selectedTenant.usage?.storage} GB</Typography>
                        </Box>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                     <Card sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Configuration</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}><Typography fontWeight="bold">Data Isolation:</Typography> {selectedTenant.config?.dataIsolation}</Grid>
                            <Grid item xs={6}><Typography fontWeight="bold">Domain:</Typography> {selectedTenant.config?.customDomain || 'N/A'}</Grid>
                            <Grid item xs={6}><Typography fontWeight="bold">Admin:</Typography> {selectedTenant.adminUsername}</Grid>
                            <Grid item xs={6}><Typography fontWeight="bold">Created:</Typography> {selectedTenant.created}</Grid>
                        </Grid>
                     </Card>
                </Grid>
            </Grid>
        )}

        {/* Tab 1: Health */}
        {tabValue === 1 && (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="h6" mb={2}>Health Score</Typography>
                        <HealthScoreGauge score={selectedTenant.healthScore} />
                        <Typography mt={2} color={selectedTenant.healthScore > 50 ? 'success.main' : 'error.main'}>
                            {selectedTenant.healthScore > 50 ? 'Healthy' : 'At Risk'}
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                     <Card sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Key Feature Adoption</Typography>
                        {Object.entries(selectedTenant.featureUsage || {}).map(([key, val]) => (
                            <Box key={key} mb={2}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2">{key}</Typography>
                                    <Typography variant="body2">{(val * 100).toFixed(0)}%</Typography>
                                </Box>
                                <Box sx={{ width: '100%', height: 6, bgcolor: 'grey.200', borderRadius: 1 }}>
                                    <Box sx={{ width: `${val * 100}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
                                </Box>
                            </Box>
                        ))}
                     </Card>
                </Grid>
            </Grid>
        )}

        {/* Tab 2: Sandboxes */}
        {tabValue === 2 && (
             <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Expires</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenantSandboxes.map(sb => (
                            <TableRow key={sb.id}>
                                <TableCell>{sb.name}</TableCell>
                                <TableCell><StatusBadge status={sb.status} /></TableCell>
                                <TableCell>{sb.expires}</TableCell>
                            </TableRow>
                        ))}
                        {tenantSandboxes.length === 0 && <TableRow><TableCell colSpan={3} align="center">No sandboxes found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
             </Card>
        )}

        {/* Tab 3: Billing */}
        {tabValue === 3 && (
            <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenantInvoices.map(inv => (
                            <TableRow key={inv.id}>
                                <TableCell>{inv.id}</TableCell>
                                <TableCell>{inv.issueDate}</TableCell>
                                <TableCell>₹ {inv.amount.toLocaleString()}</TableCell>
                                <TableCell><StatusBadge status={inv.status} /></TableCell>
                            </TableRow>
                        ))}
                        {tenantInvoices.length === 0 && <TableRow><TableCell colSpan={4} align="center">No invoices found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
             </Card>
        )}
    </Box>
  );
}