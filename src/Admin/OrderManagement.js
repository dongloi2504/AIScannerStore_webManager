import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getOrder, updateManager, createManager, deleteManager} from "../ServiceApi/apiOrder";
import GenericModal from "../components/GenericModal";  

function ManagerManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filters, setFilters] = useState({
    managerName:"",
    managerId: "",
    managerPhone: "",
  });

  // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  const [editingManager, setEditingManager] = useState(null);
  const [editingManagerName, setEditingManagerName] = useState("");
  const [editingManagerPhone, setEditingManagerPhone] = useState("");
  const [editingManagerEmail, setEditingManagerEmail] = useState("");
  const [editingStoreId, setEditingStoreId] = useState("");
  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);
  //   const day = String(date.getDate()).padStart(2, '0');
  //   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  //   const year = date.getFullYear();
  //   const hours = String(date.getHours()).padStart(2, '0');
  //   const minutes = String(date.getMinutes()).padStart(2, '0');
  //   const seconds = String(date.getSeconds()).padStart(2, '0');
  
  //   return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  // };

  useEffect(() => {
    loadManagers();
  }, [currentPage]);

  const loadManagers = async () => {
    try {
      const response = await getOrder({
        pageNumber: currentPage,
        pageSize: pageSize,
        ...filters,
      });
      setManagers(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const allManagerIds = useMemo(() => managers.map((m) => m.managerId), [managers]);

  const handleCheckAll = (e) => {
    setSelectedManagers(e.target.checked ? allManagerIds : []);
  };

  const handleCheckOne = (managerId) => {
    setSelectedManagers((prev) =>
      prev.includes(managerId)
        ? prev.filter((id) => id !== managerId)
        : [...prev, managerId]
    );
  };

  const handleDeleteSelectedManagers = async () => {
    if (selectedManagers.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedManagers.length} manager(s)?`
    );
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedManagers.map((id) => deleteManager(id));
      const results = await Promise.allSettled(deletePromises);

      const failedDeletes = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} manager(s).`);
      }

      setSelectedManagers([]);
      loadManagers();
    } catch (error) {
      console.error("Error deleting managers:", error);
    }
  };

  const handleCreateManager = async () => {
    try {
      await createManager({ storeId, managerName, managerPhone, managerEmail, password });
      console.log("Created successfully");
      setShowModal(false);
      loadManagers();
      setStoreId("");
      setManagerName("");
      setManagerPhone("");
      setManagerEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error creating :", error);
    }
  };

  const managerFields = [
    {
      label: "Store Id",
      controlId: "storeId",
      type: "text",
      value: storeId,
      onChange: (e) => setStoreId(e.target.value),
    },
    {
      label: "Manager Name",
      controlId: "managerName",
      type: "text",
      value: managerName,
      onChange: (e) => setManagerName(e.target.value),
    },
    {
      label: "Manager Phone",
      controlId: "managerPhone",
      type: "text",
      value: managerPhone,
      onChange: (e) => setManagerPhone(e.target.value),
    },
    {
      label: "Manager Email",
      controlId: "managerEmail",
      type: "text",
      value: managerEmail,
      onChange: (e) => setManagerEmail(e.target.value),
    },
    {
      label: "Password",
      controlId: "password",
      type: "text",
      value: password,
      onChange: (e) => setPassword(e.target.value),
    },
  ];

  const handleCreateNewManager = () => {
    setShowModal(true);
  };

  // Khi bấm "Edit", lưu manager cần chỉnh sửa và cập nhật giá trị ban đầu cho các trường
  const handleEditManager = (manager) => {
    setEditingManager(manager);
    setEditingManagerName(manager.managerName);
    setEditingManagerPhone(manager.managerPhone);
    setEditingManagerEmail(manager.managerEmail);
    setEditingStoreId(manager.storeId);
  };

  const handleUpdateManager = async () => {
    try {
      await updateManager({
        managerId: editingManager.managerId,
        managerName: editingManagerName,
        managerPhone: editingManagerPhone,
        managerEmail: editingManagerEmail,
        storeId: editingStoreId,
      });
      console.log("Updated successfully");
      setEditingManager(null);
      loadManagers();
    } catch (error) {
      console.error("Error updating :", error);
    }
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Order Management"
          data={managers}
          columns={[
            { key: "orderId", label: "Order ID" },
            { key: "total", label: "Total Price" },
            { key: "status", label: "Status" },
            { key: "createdDate", label: "Create Date"},
          ]}
          selectedItems={selectedManagers}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedManagers}
          handleSearch={loadManagers}
          filters={[
            { label: "Total Price", value: filters.managerName },
            { label: "Status", value: filters.managerId },
            { label: "Date", value: filters.managerPhone },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["managerName", "managerId", "managerPhone"];
            setFilters((prev) => ({ ...prev, [filterKeys[index]]: value }));
          }}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Edit",
              className: "edit",
              variant: "info",
              onClick: handleEditManager,
            },
          ]}
          extraButtons={[
            {
              label: "Create New",
              variant: "primary",
              onClick: handleCreateNewManager,
            },
            {
              label: "Delete",
              variant: "danger",
              onClick: handleDeleteSelectedManagers,
              className: "delete-btn",
              disabled: selectedManagers.length === 0,
            },
          ]}
        />
      </div>

      {showModal && (
        <GenericModal
          show={showModal}
          title="Create New Manager"
          fields={managerFields}
          onSave={handleCreateManager}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingManager && (
        <GenericModal
          show={true}
          title="Edit Manager"
          fields={[
            {
              label: "Store Id",
              controlId: "editStoreId",
              type: "text",
              value: editingStoreId,
              onChange: (e) => setEditingStoreId(e.target.value),
            },
            {
              label: "Manager Name",
              controlId: "editManagerName",
              type: "text",
              value: editingManagerName,
              onChange: (e) => setEditingManagerName(e.target.value),
            },
            {
              label: "Manager Phone",
              controlId: "editingManagerPhone",
              type: "text",
              value: editingManagerPhone,
              onChange: (e) => setEditingManagerPhone(e.target.value),
            },
            {
              label: "Manager Email",
              controlId: "editingManagerEmail",
              type: "text",
              value: editingManagerEmail,
              onChange: (e) => setEditingManagerEmail(e.target.value),
            },
          ]}
          onSave={handleUpdateManager}
          onClose={() => setEditingManager(null)}
        />
      )}
    </div>
  );
}

export default ManagerManagement;
