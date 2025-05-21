import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Styles/Sidebar.css";
import { CanAccess } from "./CanAccess.js";
import { Role } from "../const/Role.js";
import { useAuth } from "../Authen/AuthContext";
import useNotificationSocket from "../hooks/useNotificationSocket";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();

  // ✅ Hook kết nối WebSocket
  useNotificationSocket(user?.staffId); // chỉ để khởi động socket
  const { hasNotification, setHasNotification } = useAuth(); // dùng context chung


  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof onToggle === "function") {
      onToggle(newState);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("staffId");
    setAuth(null, null);
    navigate("/");
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-logo">{user.staffName}</div>

        <nav className="sidebar-menu">
          {/* ✅ Dashboard - KHÔNG còn dot đỏ */}
          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/report"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Dashboard
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.STAFF, Role.MANAGER]}>
            <div className="sidebar-item">
              <NavLink
                to={`/store-detail/${user.storeId}`}
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Store Detail
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/store-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Store
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN, Role.MANAGER, Role.STAFF]}>
            <div className="sidebar-item">
              <NavLink
                to="/product-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Product
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/staff-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Staff
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/customer-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Customer
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/category-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Category
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ADMIN, Role.MANAGER]}>
            <div className="sidebar-item">
              <NavLink
                to="/order-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Order
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.HELPDESK]}>
            <div className="sidebar-item">
              <NavLink
                to="/device-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Devices
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ALL]}>
            <div className="sidebar-item">
              <NavLink
                to="/live-order"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Live Orders
              </NavLink>
            </div>
          </CanAccess>

          <CanAccess roles={[Role.ALL]}>
            <div className="sidebar-item">
              <NavLink
                to="/change-password"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Change password
              </NavLink>
            </div>
          </CanAccess>

          {/* ✅ Customer Request - CÓ dot đỏ */}
          <CanAccess roles={[Role.MANAGER]}>
            <div className="sidebar-item">
              <NavLink
                to={`/request-order/${user.storeId}`}
                className={({ isActive }) => {
                  if (isActive) setHasNotification(false); // reset khi user click
                  return isActive ? "sidebar-link active" : "sidebar-link";
                }}
              >
                Customer Request
                {hasNotification && <span className="notif-dot" />}
              </NavLink>
            </div>
          </CanAccess>

          <div className="sidebar-item:last-child ">
            <NavLink to="/" className="sidebar-link" onClick={handleLogout}>
              Logout
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <span style={{ color: "black", fontSize: "24px" }}>☰</span>
      </div>
    </>
  );
};

export default Sidebar;
