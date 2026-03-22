import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import RoleGuard from './components/RoleGuard';
import UserDetail from './pages/UserDetail';
import ProductDetailPage from './pages/ProductDetailPage';

// Компонент для проверки авторизации
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Открытые маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Защищенные маршруты */}
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/products/:id" element={
          <ProtectedRoute>
            <ProductDetailPage />
          </ProtectedRoute>
        } />

        {/* Управление пользователями (только админ) */}
        <Route path="/users" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <UsersPage />
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* Детальная страница пользователя (только админ) */}
        <Route path="/users/:id" element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <UserDetail />
            </RoleGuard>
          </ProtectedRoute>
        } />

        {/* Перенаправления */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;