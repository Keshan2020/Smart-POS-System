import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 270;
const collapsedWidth = 80;
const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'POS Billing', icon: <PointOfSaleIcon />, path: '/pos' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Sales', icon: <ShoppingCartIcon />, path: '/sales' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const pageTitle = navItems.find((i) => i.path === location.pathname)?.text || 'Dashboard';

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2.5 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PointOfSaleIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#fff" fontSize="1.1rem">
          SmartPOS
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      <List sx={{ flex: 1, py: 1.5 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => { navigate(item.path); if (isMobile) setMobileOpen(false); }}
                sx={{
                  mx: 1.5, py: 1.2, borderRadius: 2,
                  backgroundColor: active ? 'rgba(25,118,210,0.15)' : 'transparent',
                  '&:hover': { backgroundColor: active ? 'rgba(25,118,210,0.2)' : 'rgba(255,255,255,0.06)' },
                  '&.Mui-selected': { backgroundColor: 'rgba(25,118,210,0.15)', '&:hover': { backgroundColor: 'rgba(25,118,210,0.2)' } },
                }}
              >
                <ListItemIcon sx={{
                  color: active ? '#90caf9' : 'rgba(255,255,255,0.55)',
                  minWidth: 40,
                  '& .MuiSvgIcon-root': { fontSize: 22 },
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.85rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
      <Box sx={{ px: 2.5, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: '#1976d2', fontSize: '0.9rem', fontWeight: 600 }}>
            {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={600} lineHeight={1.3}>
              {user?.full_name || user?.username}
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.4)" fontSize="0.7rem">
              {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, backgroundColor: '#1a2030', color: '#fff' } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, backgroundColor: '#1a2030', color: '#fff', borderRight: 'none' },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: '#fff',
            color: '#1a2030',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ height: 70, px: { xs: 2, sm: 3 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h5" fontWeight={700} fontSize="1.15rem" sx={{ flexGrow: 1 }}>
              {pageTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: '#67748e' }}>
                <NotificationsNoneIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: '#67748e' }}>
                <SettingsIcon />
              </IconButton>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2', fontSize: '0.85rem', fontWeight: 600 }}>
                  {(user?.full_name || user?.username || 'U')[0].toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{ mt: 1 }}
            >
              <MenuItem disabled sx={{ opacity: 1, '&.Mui-disabled': { opacity: 1 } }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user?.full_name || user?.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, overflow: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
