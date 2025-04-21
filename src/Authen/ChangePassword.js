import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { changePasswordAdmin } from '../ServiceApi/apiAuth';
import './AdminLogin.css';
import { useAuth } from "./AuthContext";
import { useToast } from "../Context/ToastContext";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [oldPassword, setOldPassword] = useState("");
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
	changePasswordAdmin({ staffId: user.staffId, oldPassword, newPassword })
	.then(res => {
		alert("Password changed");
		navigate(-1);
	}).catch(error => {
		const message =
          typeof error.response?.data === "string" ? error.response.data : "Something went wrong!";
		showToast(message,"error");
	});
	setLoading(false);
  };

  return (
    <div className="admin-login-container">
	    <div className="top-bar" style={{ marginBottom: "1rem" }}>
          <Button onClick={() => navigate(-1)} variant="light" className="back-button">
            &lt;&lt;
          </Button>
        </div>
      <div className="admin-login-box">
        <div className="login-form-container">
          <h2 className="login-title">Reset password</h2>

          <form onSubmit={handleSubmit}>
		    <div className="input-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter old password"
                required
              />
            </div>
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
