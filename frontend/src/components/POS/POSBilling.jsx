import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  TablePagination, Stack, Divider, Avatar, InputAdornment, Paper,
} from '@mui/material';
import {
  Add, Remove, Delete, Search, ShoppingCartCheckout, PointOfSale,
  Payment, Person, Discount,
} from '@mui/icons-material';
import api from '../../services/api';

export default function POSBilling() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(6);

  useEffect(() => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
    api.get('/customers').then((res) => setCustomers(res.data)).catch(() => {});
  }, []);

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, max_qty: product.stock_quantity }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const newQty = item.quantity + delta;
        if (newQty <= 0 || newQty > item.max_qty) return item;
        return { ...item, quantity: newQty };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = 0;
  const total = subtotal + taxAmount - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const res = await api.post('/sales', {
        customer_id: customerId ? parseInt(customerId) : null,
        payment_method: paymentMethod,
        discount_amount: discount,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: 0,
        })),
      });
      setLastSale(res.data);
      setReceiptOpen(true);
      setCart([]);
      setDiscount(0);
      setCustomerId('');
      api.get('/products').then((r) => setProducts(r.data));
    } catch (err) {
      alert(err.response?.data?.detail || 'Checkout failed');
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7.5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Products</Typography>
              <TextField
                fullWidth
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <TableContainer sx={{ maxHeight: 380 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right" width={80}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p) => (
                      <TableRow key={p.id} hover sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f8ff' } }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1.5}>
                            <Box sx={{
                              width: 36, height: 36, borderRadius: 1.5,
                              bgcolor: p.stock_quantity > 0 ? '#e3f2fd' : '#ffebee',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: p.stock_quantity > 0 ? '#1976d2' : '#d32f2f',
                            }}>
                              <InventoryIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{p.sku}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="primary">${p.price.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={p.stock_quantity}
                            size="small"
                            color={p.stock_quantity <= p.min_stock_level ? 'error' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => addToCart(p)}
                            disabled={p.stock_quantity <= 0}
                            sx={{ minWidth: 36, width: 36, height: 36, p: 0, borderRadius: 1.5 }}
                          >
                            <Add fontSize="small" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredProducts.length}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4.5}>
          <Card sx={{ borderRadius: 3, position: 'sticky', top: 90 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Cart ({cart.length})
                </Typography>
                <Chip
                  icon={<PointOfSale fontSize="small" />}
                  label={paymentMethod}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ maxHeight: 280, overflow: 'auto', mb: 2 }}>
                {cart.length === 0 ? (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Cart is empty
                  </Typography>
                ) : (
                  cart.map((item) => (
                    <Paper
                      key={item.product_id}
                      variant="outlined"
                      sx={{ p: 1.5, mb: 1, borderRadius: 2 }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <Stack direction="row" alignItems="center" gap={0.3}>
                          <IconButton size="small" onClick={() => updateQty(item.product_id, -1)} sx={{ width: 26, height: 26 }}>
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography fontWeight={600} fontSize="0.85rem" width={20} textAlign="center">
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQty(item.product_id, 1)} sx={{ width: 26, height: 26 }}>
                            <Add fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => removeFromCart(item.product_id)} color="error" sx={{ width: 26, height: 26, ml: 0.5 }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>

              <Stack spacing={1.5}>
                <FormControl fullWidth size="small">
                  <InputLabel><Stack direction="row" alignItems="center" gap={0.5}><Person fontSize="small" /> Customer</Stack></InputLabel>
                  <Select value={customerId} label="Customer" onChange={(e) => setCustomerId(e.target.value)}>
                    <MenuItem value="">Walk-in Customer</MenuItem>
                    {customers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel><Stack direction="row" alignItems="center" gap={0.5}><Payment fontSize="small" /> Payment</Stack></InputLabel>
                  <Select value={paymentMethod} label="Payment" onChange={(e) => setPaymentMethod(e.target.value)}>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="mobile">Mobile Payment</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Discount fontSize="small" /></InputAdornment>,
                  }}
                />

                <Divider />

                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" fontWeight={600}>${subtotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">Tax</Typography>
                    <Typography variant="body2" fontWeight={600}>${taxAmount.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" color="text.secondary">Discount</Typography>
                    <Typography variant="body2" fontWeight={600} color="error">-${discount.toFixed(2)}</Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">${total.toFixed(2)}</Typography>
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartCheckout />}
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem' }}
                >
                  Checkout — ${total.toFixed(2)}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={receiptOpen} onClose={() => setReceiptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <PointOfSale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" fontWeight={700}>Payment Successful</Typography>
        </DialogTitle>
        <DialogContent>
          {lastSale && (
            <Box>
              <Typography variant="h5" fontWeight={700} textAlign="center" color="primary" mb={0.5}>
                {lastSale.invoice_number}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                {new Date(lastSale.created_at).toLocaleString()}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lastSale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell align="right" fontWeight={600}>${item.total_price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>Total</Typography>
                <Typography variant="h5" fontWeight={700} color="primary">${lastSale.total_amount.toFixed(2)}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" textAlign="right" mt={0.5}>
                Payment: {lastSale.payment_method}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" onClick={() => setReceiptOpen(false)} sx={{ px: 4 }}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
