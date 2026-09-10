import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Challans } from './pages/Challans';
import { StockLogs } from './pages/StockLogs';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Enterprise Portal */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />

                {/* Customer CRM: Admin, Sales, Accounts */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                  <Route path="/customers" element={<Customers />} />
                </Route>

                {/* Products & Inventory: Admin, Warehouse, Sales */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES']} />}>
                  <Route path="/products" element={<Products />} />
                </Route>

                {/* Sales Challans: Admin, Sales, Accounts */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
                  <Route path="/challans" element={<Challans />} />
                </Route>

                {/* Stock Logs: Admin, Warehouse, Accounts */}
                <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'ACCOUNTS']} />}>
                  <Route path="/stock-logs" element={<StockLogs />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
