import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import BusinessDashboard from "../components/dashboard/BusinessDashboard";
import { useAuth } from "../Authen/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import "../Styles/Report.css";
const Report = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <BusinessDashboard storeId={user?.storeId} />
      </div>
    </div>
  );
};

export default Report;
