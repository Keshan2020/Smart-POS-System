import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Toolbar, Chip,
} from '@mui/material';
import { Edit, Add } from '@mui/icons-material';
import api from '../../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCust, setEditCust] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = () => {
    api.get('/customers').then((res) => setCustomers(res.data)).catch(() => {});
  };

  const openCreate = () => {
    setEditCust(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setDialogOpen(true);
  };

  const openEdit = (c) => {
    setEditCust(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editCust) { await api.put(`/customers/${editCust.id}`, form); }
      else { await api.post('/customers', form); }
      setDialogOpen(false);
      loadCustomers();
    } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  return (
    <Box>
      <Toolbar sx={{ px: 0, minHeight: 'auto !important', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>Customers</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Customer</Button>
      </Toolbar>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">Loyalty Points</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{c.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{c.email || '-'}</Typography></TableCell>
                    <TableCell>{c.phone || '-'}</TableCell>
                    <TableCell align="center"><Chip label={c.loyalty_points} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCust ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="dense" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField fullWidth label="Email" margin="dense" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField fullWidth label="Phone" margin="dense" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField fullWidth label="Address" margin="dense" multiline rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
