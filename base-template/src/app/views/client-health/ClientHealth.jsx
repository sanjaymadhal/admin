import React from "react";
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import ParcLoading from "app/components/ParcLoading";

const HealthScoreGauge = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={2 * Math.PI * 20}
          strokeDashoffset={(score > 0 ? 2 * Math.PI * 20 * (1 - score / 100) : 2 * Math.PI * 20)}
        />
      </svg>
      <Typography variant="caption" sx={{ position: 'absolute', fontWeight: 700 }}>{score}</Typography>
    </Box>
  );
};

export default function ClientHealth() {
  const { tenants = [], loading } = useAdmin();

  if (loading) return <ParcLoading />;
  const activeTenants = (tenants || []).filter(t => t.status === 'Active');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>Client Health</Typography>
      <Card>
        <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                    <TableCell>Institution</TableCell>
                    <TableCell align="center">Health Score</TableCell>
                    <TableCell align="center">Churn Risk</TableCell>
                    <TableCell>Plan</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {activeTenants.map(t => (
                    <TableRow key={t.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{t.name}</TableCell>
                        <TableCell align="center"><HealthScoreGauge score={t.healthScore} /></TableCell>
                        <TableCell align="center">
                            <Typography fontWeight="bold" color={t.churnRisk > 50 ? 'error.main' : 'success.main'}>
                                {t.churnRisk}%
                            </Typography>
                        </TableCell>
                        <TableCell>{t.plan}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </Card>
    </Box>
  );
}