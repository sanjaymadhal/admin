import React, { useMemo, useState } from 'react';
import { Card, Box, Typography, Grid, LinearProgress, styled } from "@mui/material";

// --- Custom SVG Chart Component (Migrated from Admin) ---
const SvgChart = ({ title, data, chartType, formatValue }) => {
    const [activeIdx, setActiveIdx] = useState(null);
    const width = 300, height = 150, padding = { top: 10, right: 0, bottom: 20, left: 0 };
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const yMax = maxValue === 0 ? 1 : maxValue * 1.2;
    const xScale = (index) => (width / data.length) * (index + 0.5);
    const yScale = (value) => chartHeight - (value / yMax) * chartHeight;
    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');
    const areaPath = `${linePath} L ${xScale(data.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;

    return (
        <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" mb={2}>{title}</Typography>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                <g transform={`translate(${padding.left}, ${padding.top})`}>
                    {[0, 0.5, 1].map(tick => (
                        <line key={tick} x1="0" x2={width} y1={yScale(yMax * tick)} y2={yScale(yMax * tick)} stroke="#e5e7eb" strokeDasharray="2, 2" />
                    ))}
                    {chartType === 'area' && <path d={areaPath} fill="#4f46e5" fillOpacity="0.1" />}
                    {chartType === 'area' && <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2" />}
                    {data.map((d, i) => (
                        <g key={d.name} onMouseOver={() => setActiveIdx(i)} onMouseOut={() => setActiveIdx(null)}>
                            {chartType === 'bar' && (
                                <rect 
                                    x={xScale(i) - (width / data.length / 2) * 0.7}
                                    y={yScale(d.value)}
                                    width={(width / data.length) * 0.7}
                                    height={chartHeight - yScale(d.value)}
                                    fill="#4f46e5"
                                    style={{ transition: 'fill 0.2s', cursor: 'pointer' }}
                                />
                            )}
                            {chartType === 'area' && (
                                <circle cx={xScale(i)} cy={yScale(d.value)} r="4" fill="#fff" stroke="#4f46e5" strokeWidth="2" style={{ cursor: 'pointer' }} />
                            )}
                        </g>
                    ))}
                    {data.map((d, i) => (
                        <text key={d.name} x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#6b7280">{d.name}</text>
                    ))}
                    {activeIdx !== null && (
                         <g transform={`translate(${xScale(activeIdx)}, ${yScale(data[activeIdx].value) - 15})`}>
                            <rect x="-35" y="-22" width="70" height="24" rx="4" fill="#1f2937" opacity="0.9"/>
                            <text x="0" y="-7" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">{formatValue(data[activeIdx].value)}</text>
                        </g>
                    )}
                </g>
            </svg>
        </Card>
    )
};

const UsageCard = ({ title, value, unit }) => (
    <Card sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight="bold" mt={1}>
            {value} <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{unit}</span>
        </Typography>
    </Card>
);

export const TenantUsageOverview = ({ tenants }) => {
    const totalUsage = useMemo(() => {
        const activeTenants = tenants.filter(t => t.status === 'Active');
        if (!activeTenants.length) return { avgCpu: '0.0', totalStorage: '0.00', totalUsers: 0 };
        const totalCpu = activeTenants.reduce((sum, t) => sum + (t.usage?.cpu || 0), 0);
        const totalStorage = activeTenants.reduce((sum, t) => sum + (t.usage?.storage || 0), 0);
        const totalUsers = activeTenants.reduce((sum, t) => sum + (t.usage?.users || 0), 0);
        return { avgCpu: (totalCpu / activeTenants.length).toFixed(1), totalStorage: (totalStorage / 1024).toFixed(2), totalUsers };
    }, [tenants]);

    return (
        <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            <UsageCard title="Avg. CPU" value={totalUsage.avgCpu} unit="%" />
            <UsageCard title="Total Storage" value={totalUsage.totalStorage} unit="TB" />
            <UsageCard title="Total Users" value={totalUsage.totalUsers.toLocaleString()} unit="" />
        </Box>
    );
};

export const TenantGrowthCharts = ({ tenants }) => {
    // Simplified logic for demo purposes
    const generateChartData = () => {
        const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
        return {
            newTenants: months.map((m, i) => ({ name: m, value: Math.floor(Math.random() * 5) + 1 })),
            users: months.map((m, i) => ({ name: m, value: (i + 1) * 1200 + Math.floor(Math.random() * 500) })),
            storage: months.map((m, i) => ({ name: m, value: (i + 1) * 150 + Math.floor(Math.random() * 50) }))
        };
    };
    const { newTenants, users, storage } = useMemo(() => generateChartData(), [tenants]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}><SvgChart title="New Inst. / Month" data={newTenants} chartType="bar" formatValue={v => v} /></Grid>
            <Grid item xs={12} md={4}><SvgChart title="Cumulative Users" data={users} chartType="area" formatValue={v => v.toLocaleString()} /></Grid>
            <Grid item xs={12} md={4}><SvgChart title="Storage (GB)" data={storage} chartType="area" formatValue={v => v.toLocaleString()} /></Grid>
        </Grid>
    );
};

export const TenantUsageComparison = ({ tenants }) => {
    const [metric, setMetric] = useState('cpu');
    const activeTenants = tenants.filter(t => t.status === 'Active');
    const topTenants = [...activeTenants].sort((a, b) => (b.usage?.[metric] || 0) - (a.usage?.[metric] || 0)).slice(0, 5);
    const maxValue = topTenants.length > 0 ? topTenants[0].usage[metric] : 0;
    
    const metrics = [{ key: 'cpu', label: 'CPU', unit: '%' }, { key: 'storage', label: 'Storage', unit: 'GB' }, { key: 'users', label: 'Users', unit: '' }];

    return (
        <Card sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Top 5 by Usage</Typography>
                <Box>
                    {metrics.map(m => (
                        <Typography 
                            key={m.key} 
                            component="span" 
                            sx={{ cursor: 'pointer', ml: 1.5, fontWeight: 600, color: metric === m.key ? 'primary.main' : 'text.secondary', borderBottom: metric === m.key ? '2px solid' : 'none' }}
                            onClick={() => setMetric(m.key)}
                        >
                            {m.label}
                        </Typography>
                    ))}
                </Box>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
                {topTenants.map(t => (
                    <Box key={t.id}>
                        <Box display="flex" justifyContent="space-between" fontSize="0.875rem" mb={0.5}>
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                            <span>{t.usage[metric].toLocaleString()} {metrics.find(m => m.key === metric).unit}</span>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={maxValue > 0 ? (t.usage[metric] / maxValue) * 100 : 0} 
                            sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100', '& .MuiLinearProgress-bar': { bgcolor: metric === 'cpu' ? 'primary.main' : metric === 'storage' ? 'success.main' : 'warning.main' } }} 
                        />
                    </Box>
                ))}
            </Box>
        </Card>
    );
};