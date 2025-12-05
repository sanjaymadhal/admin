import React from "react";
import { Box, Card, Typography } from "@mui/material";

export default function AuditLogs() {
  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h5" mb={3} fontWeight={700}>Audit Logs</Typography>
        <Card sx={{ p: 5, textAlign: 'center', color: 'text.secondary', border: '1px dashed #e5e7eb' }}>
            <Typography variant="h6">Audit Logs functionality coming soon.</Typography>
            <Typography variant="body2">This module tracks all administrator actions.</Typography>
        </Card>
    </Box>
  );
}