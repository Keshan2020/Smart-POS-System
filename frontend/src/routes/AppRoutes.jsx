import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/Auth/PrivateRoute';
import Login from '../components/Auth/Login';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import POSBilling from '../components/POS/POSBilling';
import Products from '../components/Products/Products';
import Categories from '../components/Products/Categories';
import Customers from '../components/Dashboard/Customers';
import Sales from '../components/POS/Sales';
import Reports from '../components/Reports/Reports';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pos" element={<POSBilling />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="customers" element={<Customers />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
