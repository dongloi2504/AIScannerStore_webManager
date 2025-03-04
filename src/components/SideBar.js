import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../Styles/Sidebar.css";

const Sidebar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(true);
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
    navigate("/");
    console.log("logged out");
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-logo">Admin</div>

        {/* Menu chính */}
        <nav className="sidebar-menu">
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
