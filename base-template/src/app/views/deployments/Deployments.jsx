import React, { useState } from "react";
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, Button, styled } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import ParcLoading from "app/components/ParcLoading";

const StatusBadge = styled("span")(({ theme, status }) => {
  const s = status?.toLowerCase() || '';
  let bg = theme.palette.grey[300], color = theme.palette.grey[800];
  if (['completed', 'success'].includes(s)) { bg = theme.palette.success.light; color = theme.palette.success.dark; }
  else if (['in progress'].includes(s)) { bg = theme.palette.info.light; color = theme.palette.info.dark; }
  else if (['failed', 'rolled back'].includes(s)) { bg = theme.palette.error.light; color = theme.palette.error.dark; }
  return { display: "inline-block", padding: "4px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: bg, color: color, textTransform: 'capitalize' };
});

const initialReleaseCandidates = [
    { id: 'pl_4', version: 'v1.2.4', buildDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), commitMessage: 'REF: Optimize database queries', commitSha: 'm1n2o3p' },
    { id: 'pl_1', version: 'v1.2.3', buildDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), commitMessage: 'FEAT: Add user profile caching', commitSha: 'a1b2c3d' },
];

export default function Deployments() {
  const { deployments = [], loading } = useAdmin();
  // Using local state for RCs since it's static in this demo
  const [releaseCandidates] = useState(initialReleaseCandidates); 

  if (loading) return <ParcLoading />;
  
  const safeDeployments = Array.isArray(deployments) ? deployments : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={700}>Release & Deployments</Typography>
      
      <Typography variant="h6" mb={2}>Release Candidates</Typography>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3} mb={4}>
        {releaseCandidates.map(rc => (
            <Card key={rc.id} sx={{ p: 2, border: '1px solid #e5e7eb' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="h6">{rc.version}</Typography>
                    <StatusBadge status="UAT Approved">UAT Approved</StatusBadge>
                </Box>
                <Typography variant="body2" mb={1}>{rc.commitMessage}</Typography>
                <Typography variant="caption" color="text.secondary">Built on {new Date(rc.buildDate).toLocaleDateString()}</Typography>
                <Box mt={2} display="flex" gap={1}>
                    <Button variant="contained" size="small" fullWidth>Deploy</Button>
                </Box>
            </Card>
        ))}
      </Box>

      <Typography variant="h6" mb={2}>Deployment History</Typography>
      <Card>
        <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell>Triggered By</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {safeDeployments.map(d => (
                    <TableRow key={d.id}>
                        <TableCell>{new Date(d.triggeredAt).toLocaleString()}</TableCell>
                        <TableCell>{d.strategy}</TableCell>
                        <TableCell>{d.triggeredBy}</TableCell>
                        <TableCell><StatusBadge status={d.status}>{d.status}</StatusBadge></TableCell>
                    </TableRow>
                ))}
                 {safeDeployments.length === 0 && <TableRow><TableCell colSpan={4} align="center">No history found.</TableCell></TableRow>}
            </TableBody>
        </Table>
      </Card>
    </Box>
  );
}