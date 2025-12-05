import React, { useState } from "react";
import { Box, Card, Grid, CardContent, CardActions, Button, CardMedia, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { H3, Paragraph } from "app/components/Typography";
import { ParcLoading } from "app/components";

export default function Marketplace() {
  const { addOns = [], loading } = useAdmin();
  const [selectedAddon, setSelectedAddon] = useState(null);

  if (loading) return <ParcLoading />;
  
  const safeAddons = addOns || [];

  return (
    <Box sx={{ p: 3 }}>
      <H3 mb={3}>Add-On Marketplace</H3>
      <Grid container spacing={3}>
        {safeAddons.map(addon => (
          <Grid item xs={12} sm={6} md={4} key={addon.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box p={2} bgcolor="#f9fafb" display="flex" justifyContent="center">
                  <img src={addon.logo} alt={addon.name} style={{ width: 64, height: 64, objectFit: 'contain' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{addon.name}</Typography>
                <Paragraph color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>{addon.shortDescription}</Paragraph>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {addon.categories.map(cat => (
                    <Chip key={cat} label={cat} size="small" />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    ${addon.pricing.amount}/{addon.pricing.unit === 'month' ? 'mo' : 'user'}
                </Typography>
                <Button size="small" variant="contained" onClick={() => setSelectedAddon(addon)}>Details</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedAddon && (
          <Dialog open={true} onClose={() => setSelectedAddon(null)} maxWidth="md" fullWidth>
              <DialogTitle>{selectedAddon.name}</DialogTitle>
              <DialogContent dividers>
                  <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                          <img src={selectedAddon.gallery[0]} alt="Preview" style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb' }} />
                          <Typography variant="h6" mt={2}>About this Add-on</Typography>
                          <Typography color="text.secondary" paragraph>{selectedAddon.longDescription}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                              <Typography variant="subtitle2" color="text.secondary">Provider</Typography>
                              <Typography variant="body1" mb={2}>{selectedAddon.provider}</Typography>
                              
                              <Typography variant="subtitle2" color="text.secondary">Pricing</Typography>
                              <Typography variant="h6" color="primary.main" mb={2}>
                                  ${selectedAddon.pricing.amount} <small>/{selectedAddon.pricing.unit}</small>
                              </Typography>
                              
                              <Button variant="contained" fullWidth size="large">Install</Button>
                          </Card>
                      </Grid>
                  </Grid>
              </DialogContent>
              <DialogActions>
                  <Button onClick={() => setSelectedAddon(null)}>Close</Button>
              </DialogActions>
          </Dialog>
      )}
    </Box>
  );
}