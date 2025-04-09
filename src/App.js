import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './Authen/AdminLogin';
import StoreManagement from './Admin/StoreManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProductDetail from './Admin/ProductDetail';
import ManagerManagement from './Admin/ManagerManagement';
import CategoryManagement from './Admin/CategoryManagement';
import ProductManagement from './Admin/ProductManagement';
function App() {
  return (
    <BrowserRouter  basename="/AIScannerStore_build">
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/store-management" element={<StoreManagement />} />
        <Route path="/product-management" element={<ProductManagement />} />
        <Route path="/manager-management" element={<ManagerManagement />} />
        <Route path="/category-management" element={<CategoryManagement />} />
        <Route path="/order-management" element={<OrderManagement />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/store-detail/:storeId" element={<StoreDetail />} />
        <Route path="/inventory-history/:id" element={<InventoryHistoryPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;