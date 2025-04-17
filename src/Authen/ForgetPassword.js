import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetCustomerPassword } from '../ServiceApi/apiAuth';
import './AdminLogin.css';

export default function ForgetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const attemptId = searchParams.get("id");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetCustomerPassword({ attemptId, token, newPassword });
      alert("Password reset successful!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="login-form-container">
          <h2 className="login-title">Reset password</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset"}
            </button>

            <div className="extra-links">
              <p>Password must contain:</p>
              <ul>
                <li>Minimum of 8 characters</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
