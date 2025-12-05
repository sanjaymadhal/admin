import React, { useState } from "react";
import { Box, Card, Stack, Typography, Divider, Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { H3, Small } from "app/components/Typography";
import { StatusBadge } from "app/components/admin/CommonAdminComponents";
import { ParcLoading } from "app/components";

export default function Pipelines() {
  const { pipelines = [], loading } = useAdmin();
  const [viewLogs, setViewLogs] = useState(null);

  if (loading) return <ParcLoading />;
  
  const safePipelines = pipelines || [];

  return (
    <Box sx={{ p: 3 }}>
      <H3 mb={3}>CI/CD Pipelines</H3>
      <Stack spacing={2}>
        {safePipelines.map(pl => (
          <Card key={pl.id} sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" fontSize="1rem">{pl.commitMessage}</Typography>
                <Small color="text.secondary" display="block" mt={0.5}>
                    Branch: <strong>{pl.branch}</strong> &bull; Commit: {pl.commitSha} &bull; Author: {pl.author}
                </Small>
              </Box>
              <StatusBadge status={pl.status} />
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box display="flex" gap={2} overflow="auto" pb={1}>
              {pl.stages.map((stage, idx) => (
                <Card key={idx} variant="outlined" sx={{ 
                    minWidth: 160, p: 2, flexShrink: 0,
                    bgcolor: stage.status === 'Success' ? '#f0fdf4' : stage.status === 'Failed' ? '#fef2f2' : 'background.default',
                    borderColor: stage.status === 'Success' ? 'success.light' : stage.status === 'Failed' ? 'error.light' : 'divider'
                }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={600}>{stage.name}</Typography>
                    {stage.status === 'Success' && <span>✅</span>}
                    {stage.status === 'Failed' && <span>❌</span>}
                  </Box>
                  <StatusBadge status={stage.status} />
                  {stage.duration && <Typography variant="caption" display="block" mt={1} color="text.secondary">{stage.duration}</Typography>}
                  {stage.status === 'Failed' && (
                      <Button size="small" color="error" fullWidth sx={{ mt: 1 }} onClick={() => setViewLogs(stage)}>View Logs</Button>
                  )}
                </Card>
              ))}
            </Box>
          </Card>
        ))}
        {safePipelines.length === 0 && <Typography align="center" color="text.secondary">No active pipelines.</Typography>}
      </Stack>

      {viewLogs && (
          <Dialog open={true} onClose={() => setViewLogs(null)} fullWidth>
              <DialogTitle>Logs: {viewLogs.name}</DialogTitle>
              <DialogContent>
                  <Box bgcolor="#111827" color="#10b981" p={2} borderRadius={1} fontFamily="monospace" fontSize="0.875rem">
                      {">"} Error: Test suite failed... <br/>
                      {">"} {viewLogs.details} <br/>
                      {">"} Process exited with code 1
                  </Box>
              </DialogContent>
          </Dialog>
      )}
    </Box>
  );
}