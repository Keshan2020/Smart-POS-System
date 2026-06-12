import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Toolbar,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = () => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  };

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', description: '' });
    setDialogOpen(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editCat) { await api.put(`/categories/${editCat.id}`, form); }
      else { await api.post('/categories', form); }
      setDialogOpen(false);
      loadCategories();
    } catch (err) { alert(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await api.delete(`/categories/${id}`);
      loadCategories();
    }
  };

  return (
    <Box>
      <Toolbar sx={{ px: 0, minHeight: 'auto !important', mb: 2 }}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Category</Button>
      </Toolbar>
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{c.name}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{c.description || '-'}</Typography></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(c)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(c.id)} color="error"><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editCat ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="dense" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField fullWidth label="Description" margin="dense" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
