import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Chip, Stack,
  Avatar, Divider, Paper,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../../services/api';

const summaryCards = [
  { label: 'Total Sales', key: 'total_sales', prefix: '$', icon: <TrendingUpIcon />, color: '#1976d2', bg: '#e3f2fd' },
  { label: 'Transactions', key: 'total_transactions', icon: <ReceiptIcon />, color: '#2e7d32', bg: '#e8f5e9' },
  { label: 'Avg Transaction', key: 'average_transaction', prefix: '$', icon: <AccountBalanceWalletIcon />, color: '#7b1fa2', bg: '#f3e5f5' },
];

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
    loadData(thirtyDaysAgo, today);
  }, []);

  const loadData = (start, end) => {
    api.get('/reports/sales-summary', { params: { start_date: start, end_date: end } })
      .then((res) => setSummary(res.data)).catch(() => {});
    api.get('/reports/top-products', { params: { start_date: start, end_date: end, limit: 10 } })
      .then((res) => setTopProducts(res.data)).catch(() => {});
    api.get('/reports/daily-sales', { params: { days: 30 } })
      .then((res) => setDailySales(res.data)).catch(() => {});
  };

  const handleFilter = () => {
    loadData(startDate, endDate);
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 4, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FilterAltIcon color="primary" />
          <Typography variant="body2" fontWeight={600}>Filter</Typography>
        </Stack>
        <TextField type="date" size="small" label="Start Date" value={startDate}
          onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <TextField type="date" size="small" label="End Date" value={endDate}
          onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />
        <Button variant="contained" onClick={handleFilter} startIcon={<CalendarTodayIcon />}>
          Apply
        </Button>
      </Paper>

      {summary && (
        <Grid container spacing={3} mb={4}>
          {summaryCards.map((card) => (
            <Grid item xs={12} sm={4} key={card.key}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                        {card.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {card.prefix || ''}{summary[card.key]?.toFixed ? summary[card.key].toFixed(2) : summary[card.key] || 0}
                      </Typography>
                    </Box>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: card.bg, color: card.color }}>
                      {card.icon}
                    </Avatar>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <StorefrontIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Top Products</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {topProducts.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>No data available</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Qty Sold</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((p, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Chip label={i + 1} size="small"
                              color={i === 0 ? 'primary' : i === 1 ? 'success' : 'default'}
                              variant="outlined" sx={{ minWidth: 28 }} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>{p.total_quantity}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} color="primary">${p.total_revenue.toFixed(2)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Daily Sales (30 days)</Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {dailySales.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>No data available</Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Transactions</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailySales.map((d, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Typography variant="body2">{d.date}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={d.count} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600} color="primary">${d.revenue.toFixed(2)}</Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
