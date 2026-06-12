import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Stack,
} from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <Box sx={{
        position: 'absolute', top: -100, right: -100, width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -80, left: -80, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
      }} />
      <Card sx={{ maxWidth: 420, width: '100%', mx: 2, borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1} mb={4}>
            <Box sx={{
              width: 56, height: 56, borderRadius: 2,
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PointOfSaleIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Smart POS System</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
          </Stack>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" margin="normal" required value={username}
              onChange={(e) => setUsername(e.target.value)} />
            <TextField fullWidth label="Password" type="password" margin="normal" required value={password}
              onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ mt: 2.5, py: 1.5, borderRadius: 2, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
