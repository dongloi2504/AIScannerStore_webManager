import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './Authen/AdminLogin';
import StoreManagement from './Admin/StoreManagement';
import ManagerManagement from './Admin/ManagerManagement';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/store-management" element={<StoreManagement />} />
        <Route path="/manager-management" element={<ManagerManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;