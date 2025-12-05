import React from "react";
import { Box, Card, Table, TableBody, TableCell, TableHead, TableRow, Typography, LinearProgress, Button } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { H3 } from "app/components/Typography";
import { StatusBadge } from "app/components/admin/CommonAdminComponents";
import { ParcLoading } from "app/components";

export default function Sandboxes() {
  const { sandboxes = [], loading } = useAdmin(); // Default to empty

  if (loading) return <ParcLoading />;
  
  const safeSandboxes = sandboxes || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <H3>Sandbox Environments</H3>
        <Button variant="contained">Create Sandbox</Button>
      </Box>
      <Card>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Status</TableCell>
              <TableCell width="25%">Resource Usage</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeSandboxes.map(sb => (
              <TableRow key={sb.id}>
                <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary">{sb.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{sb.url}</Typography>
                </TableCell>
                <TableCell>{sb.tenantName}</TableCell>
                <TableCell><StatusBadge status={sb.status}>{sb.status}</StatusBadge></TableCell>
                <TableCell>
                    <Box mb={1}>
                        <Box display="flex" justifyContent="space-between" fontSize="0.75rem">
                            <span>CPU</span><span>{sb.usage.cpu}%</span>
                        </Box>
                        <LinearProgress variant="determinate" value={sb.usage.cpu} sx={{ height: 4, borderRadius: 2 }} />
                    </Box>
                    <Box>
                        <Box display="flex" justifyContent="space-between" fontSize="0.75rem">
                            <span>Storage</span><span>{sb.usage.storage}GB</span>
                        </Box>
                        <LinearProgress variant="determinate" color="success" value={(sb.usage.storage / sb.usage.storageCapacity) * 100} sx={{ height: 4, borderRadius: 2 }} />
                    </Box>
                </TableCell>
                <TableCell>{sb.expires || 'Never'}</TableCell>
                <TableCell>
                    <Button size="small" color="error">Stop</Button>
                </TableCell>
              </TableRow>
            ))}
            {safeSandboxes.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No active sandboxes.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}