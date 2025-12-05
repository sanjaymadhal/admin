import React, { useState, useMemo } from "react";
import { 
  Grid, Card, Box, Typography, Button, IconButton, Table, TableBody, 
  TableCell, TableHead, TableRow, Chip, Avatar, LinearProgress, useTheme, 
  Divider, Tooltip, Stack, MenuItem, Select, Paper
} from "@mui/material";
import { useAdmin } from "app/contexts/AdminContext";
import { ParcLoading } from "app/components";

// --- Icons (SVG) ---
const Icons = {
  TrendingUp: ({ size=16, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  TrendingDown: ({ size=16, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
  Users: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  Server: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
  DollarSign: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  Activity: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  More: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>,
  Alert: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  Download: ({ size=20, color="currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
};

// --- 1. Custom Visualization Components ---

// Sparkline for KPI Cards
const Sparkline = ({ data, color, height = 30 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d - min) / range) * 100;
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height, opacity: 0.6 }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// Donut Chart for Plan Distribution
const DonutChart = ({ data, size = 140 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativeAngle = 0;

    return (
        <Box position="relative" width={size} height={size} display="flex" alignItems="center" justifyContent="center">
            <svg viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                {data.map((slice, i) => {
                    if (slice.value === 0) return null;
                    const slicePercent = slice.value / total;
                    const x1 = Math.cos(2 * Math.PI * cumulativeAngle);
                    const y1 = Math.sin(2 * Math.PI * cumulativeAngle);
                    cumulativeAngle += slicePercent;
                    const x2 = Math.cos(2 * Math.PI * cumulativeAngle);
                    const y2 = Math.sin(2 * Math.PI * cumulativeAngle);
                    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                    const pathData = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                    
                    return (
                        <Tooltip key={i} title={`${slice.label}: ${slice.value}`}>
                            <path d={pathData} fill={slice.color} stroke="white" strokeWidth="0.05" />
                        </Tooltip>
                    );
                })}
                <circle cx="0" cy="0" r="0.7" fill="white" />
            </svg>
            <Box position="absolute" textAlign="center">
                <Typography variant="h6" fontWeight={800} color="text.primary">{total}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>TOTAL</Typography>
            </Box>
        </Box>
    );
};

// Bar Chart for Revenue
const BarChart = ({ data, height = 220, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const theme = useTheme();

    return (
        <Box height={height} width="100%" display="flex" alignItems="flex-end" justifyContent="space-between" gap={1} pt={2}>
            {data.map((d, i) => (
                <Box key={i} flex={1} display="flex" flexDirection="column" alignItems="center" height="100%">
                    <Tooltip title={`Revenue: ₹${d.value.toLocaleString()}`}>
                        <Box 
                            sx={{ 
                                width: '60%', 
                                bgcolor: color, 
                                borderRadius: '4px 4px 0 0', 
                                height: `${(d.value / maxVal) * 85}%`,
                                transition: 'height 0.5s ease',
                                mt: 'auto',
                                '&:hover': { opacity: 0.8 }
                            }} 
                        />
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary" mt={1} fontSize="0.7rem">{d.label}</Typography>
                </Box>
            ))}
        </Box>
    );
};

// Area Chart for Traffic
const AreaChart = ({ data, height = 220, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxVal) * 90;
        return `${x},${y}`;
    }).join(" ");

    return (
        <Box height={height} width="100%" position="relative" overflow="hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                <path d={`M0 100 L${points} L100 100 Z`} fill={`url(#grad-${color})`} />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Box display="flex" justifyContent="space-between" mt={1} px={1}>
                {data.filter((_, i) => i % 2 === 0).map((d, i) => ( // Show every other label
                    <Typography key={i} variant="caption" color="text.secondary">{d.label}</Typography>
                ))}
            </Box>
        </Box>
    );
};

// --- 2. Widget Components ---

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color, sparkData }) => (
    <Card sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>{title}</Typography>
                <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ my: 0.5, fontSize: '1.75rem' }}>{value}</Typography>
            </Box>
            <Avatar variant="rounded" sx={{ bgcolor: `${color}15`, color: color, width: 44, height: 44 }}>
                <Icon size={22} />
            </Avatar>
        </Box>
        <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Chip 
                    label={`${trend === 'up' ? '+' : ''}${trendValue}`} 
                    size="small" 
                    sx={{ 
                        bgcolor: trend === 'up' ? '#ecfdf5' : '#fef2f2', 
                        color: trend === 'up' ? '#059669' : '#dc2626', 
                        fontWeight: 700, 
                        height: 22, 
                        fontSize: '0.7rem',
                        borderRadius: 1 
                    }} 
                />
                <Typography variant="caption" color="text.secondary">vs last month</Typography>
            </Box>
            <Sparkline data={sparkData} color={color} />
        </Box>
    </Card>
);

const AtRiskTable = ({ tenants }) => {
    const atRisk = tenants.filter(t => t.healthScore < 60 && t.status === 'Active').sort((a,b) => a.healthScore - b.healthScore);
    
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>Institution</TableCell>
                    <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 600 }}>Health</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 600 }}>Churn Risk</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {atRisk.length > 0 ? atRisk.slice(0, 4).map((t) => (
                    <TableRow key={t.id} hover>
                        <TableCell>
                            <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.plan}</Typography>
                        </TableCell>
                        <TableCell align="center">
                            <Chip label={t.healthScore} size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700, borderRadius: 1 }} />
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant="body2" fontWeight={700} color="error.main">{t.churnRisk}%</Typography>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow><TableCell colSpan={3} align="center"><Typography variant="caption" color="text.secondary">No institutions at risk</Typography></TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
};

// --- MAIN DASHBOARD ---

export default function DefaultDashboard() {
  const { tenants, loading } = useAdmin();
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30d');

  const safeTenants = tenants || [];
  const activeTenants = safeTenants.filter(t => t.status === 'Active');
  
  // -- Metrics --
  const totalRevenue = 456000;
  const totalUsers = activeTenants.reduce((sum, t) => sum + (t.usage?.users || 0), 0);
  const avgCpu = activeTenants.length ? (activeTenants.reduce((sum, t) => sum + (t.usage?.cpu || 0), 0) / activeTenants.length).toFixed(0) : 0;

  // -- Chart Data --
  const planData = useMemo(() => {
      const counts = { Enterprise: 0, Pro: 0, Basic: 0 };
      safeTenants.forEach(t => counts[t.plan] ? counts[t.plan]++ : counts.Basic++);
      return [
          { label: 'Enterprise', value: counts.Enterprise, color: theme.palette.primary.main },
          { label: 'Pro', value: counts.Pro, color: theme.palette.info.main },
          { label: 'Basic', value: counts.Basic, color: theme.palette.grey[400] }
      ];
  }, [safeTenants, theme]);

  const financialData = [
      { label: 'Jan', value: 32000 }, { label: 'Feb', value: 45000 }, { label: 'Mar', value: 38000 },
      { label: 'Apr', value: 52000 }, { label: 'May', value: 48000 }, { label: 'Jun', value: 65000 }
  ];

  const trafficData = [
      { label: 'Mon', value: 1200 }, { label: 'Tue', value: 1500 }, { label: 'Wed', value: 1100 },
      { label: 'Thu', value: 1800 }, { label: 'Fri', value: 2100 }, { label: 'Sat', value: 1300 }, { label: 'Sun', value: 1400 }
  ];

  const trends = {
      revenue: [65, 59, 80, 81, 56, 55, 40, 70, 75, 80, 85, 90],
      users: [28, 48, 40, 19, 86, 27, 90, 60, 70, 85, 90, 100],
      load: [10, 20, 15, 25, 30, 45, 40, 60, 55, 70, 65, 60],
      inst: [5, 5, 6, 6, 7, 8, 8, 9, 10, 12]
  };

  if (loading) return <ParcLoading />;

  return (
    <Box sx={{ p: 4, maxWidth: 1800, margin: '0 auto', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. Management Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-end">
        <Box>
            <Typography variant="overline" fontWeight={700} color="primary" letterSpacing={1.2}>Admin Console</Typography>
            <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>Executive Dashboard</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
            <Select 
                size="small" 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ bgcolor: 'white', minWidth: 140, borderRadius: 2, fontWeight: 600, boxShadow: 1 }}
            >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last Quarter</MenuItem>
            </Select>
            <Button variant="outlined" startIcon={<Icons.Download size={18} />} sx={{ bgcolor: 'white', borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.primary', border: '1px solid #e2e8f0' }}>Export</Button>
        </Box>
      </Box>

      {/* 2. Primary KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Revenue (MTD)" value={`₹ ${(totalRevenue/1000).toFixed(0)}k`} trend="up" trendValue="12.5%" icon={Icons.DollarSign} color={theme.palette.primary.main} sparkData={trends.revenue} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Active Users" value={totalUsers.toLocaleString()} trend="up" trendValue="8.2%" icon={Icons.Users} color={theme.palette.success.main} sparkData={trends.users} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <KPICard title="System Load" value={`${avgCpu}%`} trend="down" trendValue="2.4%" icon={Icons.Activity} color={theme.palette.warning.main} sparkData={trends.load} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <KPICard title="Total Institutions" value={activeTenants.length} trend="up" trendValue="5.0%" icon={Icons.Server} color={theme.palette.info.main} sparkData={trends.inst} />
        </Grid>
      </Grid>

      {/* 3. Deep Dive Analytics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={700}>Subscription Mix</Typography>
                    <IconButton size="small"><Icons.More size={18}/></IconButton>
                </Box>
                <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                    <DonutChart data={planData} />
                </Box>
                <Stack spacing={1.5} mt={3}>
                    {planData.map((p, i) => (
                        <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1.5}>
                                <Box width={8} height={8} borderRadius="50%" bgcolor={p.color} />
                                <Typography variant="body2" fontWeight={500}>{p.label}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={700}>{p.value}</Typography>
                        </Box>
                    ))}
                </Stack>
            </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Financial Performance</Typography>
                        <Typography variant="caption" color="text.secondary">Monthly Revenue</Typography>
                    </Box>
                    <Chip label="+18% YTD" size="small" color="success" sx={{ borderRadius: 1, height: 24, fontWeight: 700 }} />
                </Box>
                <BarChart data={financialData} color={theme.palette.primary.main} />
            </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
            <Card sx={{ p: 3, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" mb={4}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>User Traffic</Typography>
                        <Typography variant="caption" color="text.secondary">Daily Active Users (DAU)</Typography>
                    </Box>
                    <Chip label="Stable" size="small" sx={{ borderRadius: 1, height: 24, fontWeight: 600, bgcolor: '#f1f5f9' }} />
                </Box>
                <AreaChart data={trafficData} color={theme.palette.info.main} />
            </Card>
        </Grid>
      </Grid>

      {/* 4. Actionable Lists & Infrastructure */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
            <Card sx={{ p: 0, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                <Box p={2.5} borderBottom="1px solid #f0f0f0" display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                        <Icons.Alert size={18} color={theme.palette.error.main} />
                        <Typography variant="subtitle1" fontWeight={700}>At-Risk Institutions</Typography>
                    </Box>
                    <Chip label="High Priority" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                </Box>
                <Box flex={1}>
                    <AtRiskTable tenants={safeTenants} />
                </Box>
                <Box p={2} borderTop="1px solid #f0f0f0" textAlign="center">
                    <Button size="small" color="primary">View All Risks</Button>
                </Box>
            </Card>
        </Grid>

        <Grid item xs={12} md={4}>
            <Card sx={{ p: 0, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3 }}>
                <Box p={2.5} borderBottom="1px solid #f0f0f0">
                    <Typography variant="subtitle1" fontWeight={700}>Infrastructure Health</Typography>
                </Box>
                <Box p={3}>
                    <Stack spacing={4}>
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>API Gateway</Typography>
                                <Typography variant="body2" fontWeight={700} color="success.main">Healthy</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={98} color="success" sx={{ height: 8, borderRadius: 4, bgcolor: '#f0fdf4' }} />
                        </Box>
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>Database Storage</Typography>
                                <Typography variant="body2" fontWeight={700} color="warning.main">75% Used</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={75} color="warning" sx={{ height: 8, borderRadius: 4, bgcolor: '#fffbeb' }} />
                        </Box>
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>Search Cluster</Typography>
                                <Typography variant="body2" fontWeight={700} color="info.main">Low Load</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={25} color="info" sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f9ff' }} />
                        </Box>
                    </Stack>
                </Box>
            </Card>
        </Grid>

        <Grid item xs={12} md={4}>
            <Card sx={{ p: 0, height: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', borderRadius: 3 }}>
                <Box p={2.5} borderBottom="1px solid #f0f0f0">
                    <Typography variant="subtitle1" fontWeight={700}>System Activity</Typography>
                </Box>
                <Box p={0}>
                    {[
                        { text: "Backup completed successfully", time: "10m ago", color: "success.main" },
                        { text: "New tenant 'IIT Bombay' onboarded", time: "45m ago", color: "primary.main" },
                        { text: "High latency detected in US-East", time: "2h ago", color: "error.main" },
                        { text: "Monthly invoices generated", time: "5h ago", color: "info.main" },
                    ].map((item, i) => (
                        <Box key={i} display="flex" p={2} borderBottom="1px solid #f8fafc">
                            <Box mt={0.5} width={8} height={8} borderRadius="50%" bgcolor={item.color} mr={2} flexShrink={0} />
                            <Box>
                                <Typography variant="body2" fontWeight={500}>{item.text}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
};