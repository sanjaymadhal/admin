import React, { useMemo } from "react";
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Grid, Typography, styled } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import ParcLoading from "app/components/ParcLoading";

const StatusBadge = styled("span")(({ theme, status }) => {
  const s = status?.toLowerCase() || '';
  let bg = theme.palette.grey[300], color = theme.palette.grey[800];
  if (['compliant', 'active'].includes(s)) { bg = theme.palette.success.light; color = theme.palette.success.dark; }
  else if (['needs review'].includes(s)) { bg = theme.palette.warning.light; color = theme.palette.warning.dark; }
  else if (['non-compliant'].includes(s)) { bg = theme.palette.error.light; color = theme.palette.error.dark; }
  return { display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: bg, color: color, textTransform: 'capitalize' };
});

const ComplianceIcon = ({ compliant }) => (
    <span style={{ 
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, borderRadius: '50%', 
        backgroundColor: compliant ? '#d1fae5' : '#fee2e2', 
        color: compliant ? '#059669' : '#dc2626',
        fontSize: '14px'
    }}>
        {compliant ? "✓" : "✕"}
    </span>
);

export default function Compliance() {
  const { tenants = [], loading } = useAdmin();

  const summary = useMemo(() => {
    const safeTenants = Array.isArray(tenants) ? tenants : [];
    return {
        compliant: safeTenants.filter(t => t.compliance?.status === 'Compliant').length,
        review: safeTenants.filter(t => t.compliance?.status === 'Needs Review').length,
        nonCompliant: safeTenants.filter(t => t.compliance?.status === 'Non-Compliant').length,
        gdpr: safeTenants.filter(t => t.compliance?.gdpr).length,
        total: safeTenants.length
    };
  }, [tenants]);

  if (loading) return <ParcLoading />;

  const safeTenants = Array.isArray(tenants) ? tenants : [];

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} fontWeight={700}>Compliance Dashboard</Typography>
        
        <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #10b981' }}>
                    <Typography variant="h3" fontWeight={700} color="success.main">{summary.compliant}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Compliant Institutions</Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                 <Card sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                    <Typography variant="h3" fontWeight={700} color="warning.main">{summary.review}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Needs Review</Typography>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                 <Card sx={{ p: 3, textAlign: 'center', borderTop: '4px solid #ef4444' }}>
                    <Typography variant="h3" fontWeight={700} color="error.main">{summary.nonCompliant}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">Non-Compliant</Typography>
                </Card>
            </Grid>
        </Grid>

        <Card>
            <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                        <TableCell>Institution</TableCell>
                        <TableCell>Overall Status</TableCell>
                        <TableCell align="center">GDPR</TableCell>
                        <TableCell align="center">FERPA</TableCell>
                        <TableCell>Data Residency</TableCell>
                        <TableCell align="center">2FA Enforced</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {safeTenants.map(t => (
                        <TableRow key={t.id} hover>
                            <TableCell sx={{ fontWeight: 500 }}>{t.name}</TableCell>
                            <TableCell><StatusBadge status={t.compliance?.status}>{t.compliance?.status}</StatusBadge></TableCell>
                            <TableCell align="center"><ComplianceIcon compliant={t.compliance?.gdpr} /></TableCell>
                            <TableCell align="center"><ComplianceIcon compliant={t.compliance?.ferpa} /></TableCell>
                            <TableCell>{t.compliance?.dataResidency}</TableCell>
                            <TableCell align="center"><ComplianceIcon compliant={t.compliance?.enforced2FA} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    </Box>
  );
}