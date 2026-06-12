import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Stack, Toolbar,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', price: '', cost_price: '', stock_quantity: '', min_stock_level: '', category_id: '', description: '', barcode: '' });

  useEffect(() => {
    loadProducts();
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const loadProducts = () => {
    api.get('/products').then((res) => setProducts(res.data)).catch(() => {});
  };

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', sku: '', price: '', cost_price: '', stock_quantity: '', min_stock_level: '', category_id: '', description: '', barcode: '' });
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, sku: product.sku, price: product.price, cost_price: product.cost_price, stock_quantity: product.stock_quantity, min_stock_level: product.min_stock_level, category_id: product.category_id || '', description: product.description || '', barcode: product.barcode || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price), cost_price: parseFloat(form.cost_price), stock_quantity: parseInt(form.stock_quantity), min_stock_level: parseInt(form.min_stock_level), category_id: form.category_id ? parseInt(form.category_id) : null };
    try {
      if (editProduct) { await api.put(`/products/${editProduct.id}`, payload); }
      else { await api.post('/products', payload); }
      setDialogOpen(false);
      loadProducts();
    } catch (err) { alert(err.response?.data?.detail || 'Error saving product'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${id}`);
      loadProducts();
    }
  };

  return (
    <Box>
      <Toolbar sx={{ px: 0, minHeight: 'auto !important', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Product</Button>
      </Toolbar>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{p.sku}</Typography></TableCell>
                    <TableCell>{p.category_name || '-'}</TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>${p.price.toFixed(2)}</Typography></TableCell>
                    <TableCell align="right">
                      <Chip label={p.stock_quantity} color={p.stock_quantity <= p.min_stock_level ? 'error' : 'success'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(p.id)} color="error"><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="dense" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField fullWidth label="SKU" margin="dense" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <TextField fullWidth label="Barcode" margin="dense" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          <TextField fullWidth label="Description" margin="dense" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select value={form.category_id} label="Category" onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField fullWidth label="Price" type="number" margin="dense" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <TextField fullWidth label="Cost Price" type="number" margin="dense" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
          <TextField fullWidth label="Stock Quantity" type="number" margin="dense" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
          <TextField fullWidth label="Min Stock Level" type="number" margin="dense" value={form.min_stock_level} onChange={(e) => setForm({ ...form, min_stock_level: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
