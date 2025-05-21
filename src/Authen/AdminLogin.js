import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { loginAdmin } from '../ServiceApi/apiAuth';
import { getEditRequestsByStore } from '../ServiceApi/apiManager';
import { useAuth } from './AuthContext';
import { Helmet } from 'react-helmet';
import { Role } from '../const/Role';

function AdminLogin() {
  const [UserEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setAuth, setHasNotification } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginAdmin({ UserEmail, password });

      if (data && data.isSuccess && data.accessToken) {
        // ✅ Lưu thông tin vào context + localStorage
        setAuth(data.userInfo, data.accessToken);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem("staffId", data.userInfo.staffId);

        // ✅ Gọi API kiểm tra request PENDING
        try {
          const response = await getEditRequestsByStore({
            storeId: data.userInfo.storeId,
            pageNumber: 1,
            pageSize: 2147483647,
          });

          console.log("📦 Raw response:", response);

          const requests = response?.items ?? [];
          console.log("📄 Parsed requests:", requests);

          // In từng cái cho chắc
          requests.forEach((r, i) => {
            console.log(`🔍 Request #${i + 1}:`, r.status);
          });

          const pending = requests.filter(r => r.status === "PENDING");
          console.log("🔔 PENDING count:", pending.length);

          if (pending.length > 0) {
            setHasNotification(true);
          }
        } catch (err) {
          console.error("❌ Lỗi khi gọi getEditRequestsByStore:", err);
        }

        // ✅ Điều hướng tùy theo role
        let link = '/product-management';
        if (data.userInfo.role === Role.HELPDESK) {
          link = '/device-management';
        }
        navigate(link);
      } else {
        alert(data?.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
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
            <img src="./logo.jpg" alt="Login Illustration" />
          </div>
          <div className="login-form-container">
            <h2 className="login-title">Login</h2>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="text"
                  value={UserEmail}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Input email"
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
                  placeholder="Input password"
                  required
                />
              </div>
              <button type="submit" className="login-btn">LOGIN</button>
            </form>

            <div className="extra-links">
              <subtitle>Contact Administration if you forgot your password</subtitle>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
