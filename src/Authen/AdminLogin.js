import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { loginAdmin } from '../ServiceApi/apiAuth';
import { useAuth } from './AuthContext';
import { Helmet } from 'react-helmet';

function AdminLogin() {
  const [UserEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginAdmin({ UserEmail, password });
      if (data && data.isSuccess && data.accessToken) {
	    setAuth(data.userInfo, data.accessToken);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem("staffId", data.userInfo.staffId);
        navigate('/product-management');
      } else {
        // Thay vì hiển thị lỗi lên console, dùng alert
        alert(data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('An error occurred while logging in. Please try again.');
    }
  };

  return (
	<>
	<Helmet>
	  <title>AIScannerStore | Login</title>
	</Helmet>
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
	</>
  );
}

export default AdminLogin;
