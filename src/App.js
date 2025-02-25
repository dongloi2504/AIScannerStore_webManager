import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './Authen/AdminLogin';
import StoreManagement from './Admin/StoreManagement';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/store-management" element={<StoreManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;