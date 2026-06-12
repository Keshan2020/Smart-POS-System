import { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Alert, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, Stack,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import api from '../services/api';

const statCards = [
  {
    label: "Today's Sales", key: 'total_sales_today', prefix: '$',
    icon: <TrendingUpIcon />, color: '#1976d2', bgColor: '#e3f2fd',
  },
  {
    label: 'Transactions', key: 'total_transactions_today',
    icon: <ShoppingCartIcon />, color: '#2e7d32', bgColor: '#e8f5e9',
  },
  {
    label: 'Total Products', key: 'total_products',
    icon: <InventoryIcon />, color: '#ed6c02', bgColor: '#fff3e0',
  },
  {
    label: 'Customers', key: 'total_customers',
    icon: <PeopleIcon />, color: '#7b1fa2', bgColor: '#f3e5f5',
  },
  {
    label: 'Low Stock', key: 'low_stock_count',
    icon: <WarningIcon />, color: '#d32f2f', bgColor: '#ffebee',
  },
];

function StatCard({ card, value }) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
              {card.label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value !== null && value !== undefined ? `${card.prefix || ''}${value}` : '-'}
            </Typography>
          </Box>
          <Avatar sx={{ width: 52, height: 52, bgcolor: card.bgColor, color: card.color }}>
            {card.icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [connection, setConnection] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/test')
      .then((res) => setConnection(res.data))
      .catch((err) => { setError(err.message); setConnection(null); });

    api.get('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  if (error && !connection) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        Backend connection failed: {error}
      </Alert>
    );
  }

  if (!connection) {
    return (
      <Box>
        <LinearProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Connecting to backend...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Alert
        icon={<CheckCircleIcon />}
        severity="success"
        sx={{ borderRadius: 2, mb: 4, '& .MuiAlert-message': { fontSize: '0.875rem' } }}
      >
        {connection.message}
      </Alert>

      {!stats && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

      <Grid container spacing={3} mb={4}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={card.key}>
            <StatCard card={card} value={stats ? stats[card.key] : null} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Recent Sales</Typography>
              {stats?.recent_sales?.length === 0 ? (
                <Typography color="text.secondary" py={4} textAlign="center">No sales today</Typography>
              ) : stats?.recent_sales ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Cashier</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.recent_sales.map((sale) => (
                        <TableRow key={sale.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{sale.invoice_number}</Typography>
                          </TableCell>
                          <TableCell>{sale.cashier_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Typography fontWeight={600}>${sale.total_amount.toFixed(2)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={sale.payment_method} size="small" color={sale.payment_method === 'cash' ? 'success' : 'primary'} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">Loading...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Top Products Today</Typography>
              {stats?.top_products?.length === 0 ? (
                <Typography color="text.secondary" py={4} textAlign="center">No products sold today</Typography>
              ) : stats?.top_products ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.top_products.map((product, i) => (
                        <TableRow key={i} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                              <Box sx={{
                                width: 32, height: 32, borderRadius: 1.5,
                                bgcolor: i === 0 ? '#fff3e0' : i === 1 ? '#e8f5e9' : '#e3f2fd',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 700, color: i === 0 ? '#ed6c02' : i === 1 ? '#2e7d32' : '#1976d2',
                              }}>
                                {i + 1}
                              </Box>
                              <Typography variant="body2">{product.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={product.quantity} size="small" color="primary" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">Loading...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
