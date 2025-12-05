import React, { useState } from "react";
import { 
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Button, 
  TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
  Grid, Typography, Tabs, Tab, styled, Checkbox, FormControlLabel, Chip, Divider
} from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import ParcLoading from "app/components/ParcLoading";

// --- Internal Styled Components ---
const StatusBadge = styled("span")(({ theme, status }) => {
  const s = status?.toLowerCase() || '';
  let bg = theme.palette.grey[300], color = theme.palette.grey[800];
  if (['active', 'compliant', 'paid', 'resolved'].includes(s)) { bg = theme.palette.success.light; color = theme.palette.success.dark; }
  else if (['pending', 'needs review', 'in progress', 'due'].includes(s)) { bg = theme.palette.warning.light; color = theme.palette.warning.dark; }
  else if (['inactive', 'non-compliant', 'overdue'].includes(s)) { bg = theme.palette.error.light; color = theme.palette.error.dark; }
  return { display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: bg, color: color, textTransform: 'capitalize' };
});

// --- CLIENT PORTAL MODAL (Missing Feature 1) ---
const ClientPortalModal = ({ tenant, onClose, invoices }) => {
    const [tab, setTab] = useState(0);
    const outstanding = invoices.find(inv => ['Due', 'Overdue'].includes(inv.status));

    return (
        <Dialog open={true} onClose={onClose} fullScreen>
            <Box bgcolor="background.default" height="100vh" display="flex" flexDirection="column">
                <Box p={2} bgcolor="white" borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6"><strong>{tenant.name}</strong> Portal</Typography>
                    <Button onClick={onClose} color="inherit">Close Portal</Button>
                </Box>
                <Box display="flex" justifyContent="center" bgcolor="white" borderBottom={1} borderColor="divider">
                    <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                        <Tab label="Dashboard" />
                        <Tab label="Billing" />
                        <Tab label="Support" />
                    </Tabs>
                </Box>
                <Box p={4} maxWidth={1000} width="100%" mx="auto" flexGrow={1} overflow="auto">
                    {tab === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 3 }}>
                                    <Typography variant="h6" mb={2}>Billing Snapshot</Typography>
                                    {outstanding ? (
                                        <Box>
                                            <Typography variant="h4" color="primary.main">₹ {outstanding.amount.toLocaleString()}</Typography>
                                            <Typography color="error" fontWeight="bold">Status: {outstanding.status}</Typography>
                                            <Typography color="text.secondary">Due: {outstanding.dueDate}</Typography>
                                            <Button variant="contained" fullWidth sx={{ mt: 2 }}>Pay Now</Button>
                                        </Box>
                                    ) : <Typography>All caught up!</Typography>}
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ p: 3 }}>
                                    <Typography variant="h6" mb={2}>Usage</Typography>
                                    <Box mb={2}>
                                        <Box display="flex" justifyContent="space-between"><Typography>Users</Typography><Typography>{tenant.usage?.users} / {tenant.config?.provisionedUsers}</Typography></Box>
                                        <Box height={8} bgcolor="grey.200" borderRadius={4} mt={1}><Box width="40%" height="100%" bgcolor="success.main" borderRadius={4}/></Box>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
                    {tab === 1 && <Typography variant="h6">Invoice history would appear here...</Typography>}
                    {tab === 2 && <Typography variant="h6">Support ticket interface...</Typography>}
                </Box>
            </Box>
        </Dialog>
    );
};

// --- TENANT DETAIL VIEW (Missing Feature 2: Full Tabs) ---
const TenantDetail = ({ tenant, onBack, invoices = [], sandboxes = [] }) => {
    const [tabValue, setTabValue] = useState(0);
    const [showPortal, setShowPortal] = useState(false);
    
    // Filter data for this tenant
    const myInvoices = invoices.filter(i => i.tenantId === tenant.id);
    const mySandboxes = sandboxes.filter(s => s.tenantId === tenant.id);
    const myUsers = tenant.users || [];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button onClick={onBack}>&larr; Back to List</Button>
                <Button variant="outlined" color="primary" onClick={() => setShowPortal(true)}>View as Client</Button>
            </Box>
            
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>{tenant.name}</Typography>
                <Box display="flex" gap={2} mt={1} alignItems="center">
                    <StatusBadge status={tenant.status}>{tenant.status}</StatusBadge>
                    <Typography color="text.secondary">Plan: <strong>{tenant.plan}</strong></Typography>
                    <Typography color="text.secondary">ID: {tenant.id}</Typography>
                </Box>
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Overview" />
                <Tab label="Users" />
                <Tab label="Sandboxes" />
                <Tab label="Billing" />
            </Tabs>

            {/* Overview Tab */}
            {tabValue === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Configuration</Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <Typography fontWeight="bold">Data Isolation</Typography><Typography>{tenant.config?.dataIsolation}</Typography>
                                <Typography fontWeight="bold">Subdomain</Typography><Typography>{tenant.config?.subdomain || 'N/A'}</Typography>
                                <Typography fontWeight="bold">Custom Domain</Typography><Typography>{tenant.config?.customDomain || 'N/A'}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Enabled Features</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {Object.keys(tenant.features || {}).length > 0 ? 
                                    Object.keys(tenant.features).map(f => <Chip key={f} label={f} size="small" />) : 
                                    <Typography color="text.secondary">No features configured.</Typography>
                                }
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Users Tab */}
            {tabValue === 1 && (
                <Card>
                    <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">User Management</Typography>
                        <Button variant="contained" size="small">Add User</Button>
                    </Box>
                    <Table>
                        <TableHead><TableRow><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
                        <TableBody>
                            {myUsers.map((u, i) => (
                                <TableRow key={i}>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell><Chip label={u.role} size="small" /></TableCell>
                                    <TableCell><Button size="small" color="error">Remove</Button></TableCell>
                                </TableRow>
                            ))}
                            {myUsers.length === 0 && <TableRow><TableCell colSpan={3} align="center">No users found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Sandboxes Tab */}
            {tabValue === 2 && (
                <Card>
                    <Table>
                        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Expires</TableCell></TableRow></TableHead>
                        <TableBody>
                            {mySandboxes.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell><StatusBadge status={s.status}>{s.status}</StatusBadge></TableCell>
                                    <TableCell>{s.expires}</TableCell>
                                </TableRow>
                            ))}
                            {mySandboxes.length === 0 && <TableRow><TableCell colSpan={3} align="center">No sandboxes found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Billing Tab */}
            {tabValue === 3 && (
                <Card>
                    <Table>
                        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Date</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                        <TableBody>
                            {myInvoices.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.id}</TableCell>
                                    <TableCell>{inv.issueDate}</TableCell>
                                    <TableCell>₹ {inv.amount.toLocaleString()}</TableCell>
                                    <TableCell><StatusBadge status={inv.status}>{inv.status}</StatusBadge></TableCell>
                                </TableRow>
                            ))}
                            {myInvoices.length === 0 && <TableRow><TableCell colSpan={4} align="center">No invoices found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {showPortal && <ClientPortalModal tenant={tenant} invoices={myInvoices} onClose={() => setShowPortal(false)} />}
        </Box>
    );
};

// --- MAIN TENANTS COMPONENT ---
export default function Tenants() {
  const { tenants = [], setTenants, loading, selectedTenant, setSelectedTenant, invoices, sandboxes } = useAdmin();
  const [open, setOpen] = useState(false);
  
  // Advanced Provisioning State (Missing Feature 3)
  const [formData, setFormData] = useState({ 
      name: '', plan: 'Pro', institutionType: 'College', 
      adminEmail: '', subdomain: '', dataIsolation: 'shared-db' 
  });

  if (loading) return <ParcLoading />;

  if (selectedTenant) {
      return <TenantDetail tenant={selectedTenant} onBack={() => setSelectedTenant(null)} invoices={invoices} sandboxes={sandboxes} />;
  }

  const handleSave = () => {
    const newTenant = {
      id: `T${Date.now()}`, 
      name: formData.name,
      institutionType: formData.institutionType,
      plan: formData.plan,
      status: 'Pending', 
      created: new Date().toISOString().split('T')[0],
      usage: { cpu: 0, storage: 0, users: 0 },
      config: { 
          subdomain: formData.subdomain,
          dataIsolation: formData.dataIsolation,
          provisionedUsers: formData.plan === 'Enterprise' ? 5000 : 1000 
      },
      users: [{ email: formData.adminEmail, role: 'Admin' }],
      features: {} // Should populate based on plan
    };
    setTenants([newTenant, ...tenants]);
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Institutions</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>Provision New</Button>
      </Box>

      <Card>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map(t => (
              <TableRow key={t.id} hover onClick={() => setSelectedTenant(t)} sx={{ cursor: 'pointer' }}>
                <TableCell>{t.id}</TableCell>
                <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>{t.name}</TableCell>
                <TableCell>{t.plan}</TableCell>
                <TableCell><StatusBadge status={t.status}>{t.status}</StatusBadge></TableCell>
                <TableCell>{t.usage?.users?.toLocaleString() || 0}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}><Button size="small">Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Advanced Provisioning Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Provision New Institution</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Institution Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></Grid>
            <Grid item xs={6}>
                <Select fullWidth value={formData.institutionType} onChange={e => setFormData({...formData, institutionType: e.target.value})}>
                    <MenuItem value="College">College</MenuItem><MenuItem value="University">University</MenuItem>
                </Select>
            </Grid>
            <Grid item xs={6}>
                <Select fullWidth value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                    <MenuItem value="Basic">Basic</MenuItem><MenuItem value="Pro">Pro</MenuItem><MenuItem value="Enterprise">Enterprise</MenuItem>
                </Select>
            </Grid>
            
            <Grid item xs={12}><Divider sx={{ my: 1 }}>Technical Config</Divider></Grid>
            
            <Grid item xs={12}><TextField fullWidth label="Admin Email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Subdomain" value={formData.subdomain} onChange={e => setFormData({...formData, subdomain: e.target.value})} InputProps={{ endAdornment: <Typography variant="caption">.app.com</Typography> }}/></Grid>
            <Grid item xs={6}>
                <Select fullWidth value={formData.dataIsolation} onChange={e => setFormData({...formData, dataIsolation: e.target.value})}>
                    <MenuItem value="shared-db">Shared DB</MenuItem><MenuItem value="dedicated-db">Dedicated DB</MenuItem>
                </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Provision</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}