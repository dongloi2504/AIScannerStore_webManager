import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Styles/Sidebar.css";
import { CanAccess } from "./CanAccess.js";
import { Role } from "../const/Role.js";
import { useAuth } from "../Authen/AuthContext";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, setAuth } = useAuth();
  const navigate = useNavigate();

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
        <div className="sidebar-logo">Admin</div>

        {/* Menu chính */}
        <nav className="sidebar-menu">

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

          <CanAccess roles={[Role.ADMIN, Role.MANAGER]}>
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
                to="/manager-management"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Manager
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

          <CanAccess roles={[Role.ADMIN]}>
            <div className="sidebar-item">
              <NavLink
                to="/report"
                className={({ isActive }) =>
                  isActive ? "sidebar-link active" : "sidebar-link"
                }
              >
                Report
              </NavLink>
            </div>
          </CanAccess>
          
          {/* Sidebar link cho Logout */}
          <div className="sidebar-item:last-child ">
            <NavLink
              to="/"
              className="sidebar-link"
              onClick={handleLogout}
            >
              Logout
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Nút Toggle */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <span style={{ color: "black", fontSize: "24px" }}>☰</span>
      </div>
    </>
  );
};

export default Sidebar;
