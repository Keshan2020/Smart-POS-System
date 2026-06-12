import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Chip, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Divider,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../services/api';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => { loadSales(); }, []);

  const loadSales = () => {
    api.get('/sales').then((res) => setSales(res.data)).catch(() => {});
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSelectedSale(res.data);
      setDetailOpen(true);
    } catch (err) {
      alert('Error loading sale detail');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Sales History</Typography>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Cashier</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
                  <TableRow key={s.id} hover sx={{ cursor: 'pointer' }} onClick={() => viewDetail(s.id)}>
                    <TableCell><Typography variant="body2" fontWeight={600}>{s.invoice_number}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{new Date(s.created_at).toLocaleString()}</Typography></TableCell>
                    <TableCell>{s.cashier_name || 'N/A'}</TableCell>
                    <TableCell>{s.customer_name || 'Walk-in'}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>${s.total_amount.toFixed(2)}</Typography></TableCell>
                    <TableCell><Chip label={s.payment_method} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={s.payment_status} color="success" size="small" variant="outlined" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={sales.length} page={page}
            onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} />
        </CardContent>
      </Card>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>Sale Detail — {selectedSale?.invoice_number}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box>
              <Stack direction="row" spacing={4} mb={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body2" fontWeight={500}>{new Date(selectedSale.created_at).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Cashier</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedSale.cashier_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Customer</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedSale.customer_name || 'Walk-in'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Payment</Typography>
                  <Typography variant="body2" fontWeight={500}>{selectedSale.payment_method}</Typography>
                </Box>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Discount</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell align="right">${item.discount.toFixed(2)}</TableCell>
                      <TableCell align="right" fontWeight={600}>${item.total_price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="flex-end" spacing={4}>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography fontWeight={600}>${selectedSale.subtotal.toFixed(2)}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography fontWeight={600} color="error">-${selectedSale.discount_amount.toFixed(2)}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">${selectedSale.total_amount.toFixed(2)}</Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
