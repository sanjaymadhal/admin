import { Card, Box, Typography, styled } from "@mui/material";

export const StatusBadge = styled("span")(({ theme, status }) => {
  let bg = theme.palette.grey[300];
  let color = theme.palette.grey[800];
  const s = status?.toLowerCase().replace(/ /g, '-');
  
  if (['active', 'success', 'paid', 'compliant', 'resolved', 'healthy', 'completed', 'uat-approved'].includes(s)) {
    bg = theme.palette.success.light;
    color = theme.palette.success.dark;
  } else if (['pending', 'in-progress', 'due', 'needs-review', 'warning', 'medium', 'provisioning'].includes(s)) {
    bg = theme.palette.warning.light;
    color = theme.palette.warning.dark;
  } else if (['inactive', 'failed', 'overdue', 'non-compliant', 'error', 'urgent', 'high', 'rolled-back', 'expired'].includes(s)) {
    bg = theme.palette.error.light;
    color = theme.palette.error.dark;
  }

  return {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "capitalize",
    backgroundColor: bg,
    color: color,
  };
});

export const StatCard = ({ title, value, change, isPositive, unit }) => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
    <Typography variant="h4" fontWeight={700} my={1}>
      {value}
      {unit && <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '4px' }}>{unit}</span>}
    </Typography>
    {change && (
      <Typography variant="body2" color={isPositive ? "success.main" : "error.main"} fontWeight={600}>
        {change} vs last month
      </Typography>
    )}
  </Card>
);

export const HealthCard = ({ title, status, details }) => {
    let color = '#ef4444'; // error
    if (status === 'Healthy') color = '#10b981';
    if (status === 'Issues') color = '#f59e0b';

    return (
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
                <Typography variant="body2" color="text.secondary">{details}</Typography>
            </Box>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
        </Card>
    );
};

export const HealthScoreGauge = ({ score }) => {
  const getColor = (s) => (s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="40" height="40" viewBox="0 0 50 50" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 20}
          strokeDashoffset={(score > 0 ? 2 * Math.PI * 20 * (1 - score / 100) : 2 * Math.PI * 20)}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <Typography variant="caption" sx={{ position: 'absolute', fontWeight: 700 }}>
        {score}
      </Typography>
    </Box>
  );
};