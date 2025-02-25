// AdminLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { loginAdmin } from '../ServiceApi/apiAuth';

function AdminLogin() {
  const [UserEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập
      const data = await loginAdmin({ UserEmail, password });
      console.log('Login success:', data);

      // Giả sử backend trả về accessToken trong data.accessToken
      if (data && data.accessToken) {
        // Lưu token vào localStorage
        localStorage.setItem('token', data.accessToken);
      }

      // Chuyển sang trang StoreManagement
      navigate('/store-management');
    } catch (error) {
      console.error('Login failed:', error);
      // Hiển thị thông báo lỗi (nếu cần)
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="login-illustration">
          <img
            src="https://storage.googleapis.com/a1aa/image/5dg7ZGHWpw-g4Jc34mNRjVZ1oeR1RaSF4rM9kWv8iIA.jpg"
            alt="Login Illustration"
          />
        </div>
        <div className="login-form-container">
          <div className="company-logo">company</div>
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="text"
                value={UserEmail}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
            <button type="submit" className="login-btn">
              LOGIN
            </button>
          </form>
          <div className="extra-links">
            <a href="#forgot-password">Forgot your password?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
