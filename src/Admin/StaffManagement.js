import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getStaff, updateStaff, createStaff, deleteStaff} from "../ServiceApi/apiStaff";
import GenericModal from "../components/GenericModal";  

function StaffManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [staffs, setStaffs] = useState([]);
  const [selectedStaffs, setSelectedStaffs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [filters, setFilters] = useState({
    staffCode:"",
    staffName: "",
    role: "",
  });

  // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  const [editingStaff, setEditingStaff] = useState(null);
  const [editingStaffName, setEditingStaffName] = useState("");
  const [editingStaffPhone, setEditingStaffPhone] = useState("");
  const [editingStaffEmail, setEditingStaffEmail] = useState("");
  const [editingStoreId, setEditingStoreId] = useState("");
  const [editingStaffCode, setEditingStaffCode] = useState("");
  const [editingRole, setEditingRole] = useState("");

  useEffect(() => {
    loadStaffs();
  }, [currentPage]);

  const loadStaffs = async () => {
    try {
      const response = await getStaff({
        pageNumber: currentPage,
        pageSize: pageSize,
        ...filters,
      });
      setStaffs(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching staffs:", error);
    }
  };

  const allStaffIds = useMemo(() => staffs.map((m) => m.staffId), [staffs]);

  const handleCheckAll = (e) => {
    setSelectedStaffs(e.target.checked ? allStaffIds : []);
  };

  const handleCheckOne = (staffId) => {
    setSelectedStaffs((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleDeleteSelectedStaffs = async () => {
    if (selectedStaffs.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedStaffs.length} staff(s)?`
    );
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedStaffs.map((id) => deleteStaff(id));
      const results = await Promise.allSettled(deletePromises);

      const failedDeletes = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} staff(s).`);
      }

      setSelectedStaffs([]);
      loadStaffs();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleCreateStaff = async () => {
    try {
      await createStaff({ storeId, staffName, staffPhone, staffEmail, password, staffCode, role });
      setShowModal(false);
      loadStaffs();
      setStoreId("");
      setStaffName("");
      setStaffPhone("");
      setStaffEmail("");
      setStaffCode("");
      setRole("");
      setPassword("");
    } catch (error) {
      console.error("Error creating :", error);
    }
  };


  const handleCreateNewStaff = () => {
    setShowModal(true);
  };

  // Khi bấm "Edit", lưu staff cần chỉnh sửa và cập nhật giá trị ban đầu cho các trường
  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setEditingStaffName(staff.staffName);
    setEditingStaffPhone(staff.staffPhone);
    setEditingStaffEmail(staff.staffEmail);
    setEditingStoreId(staff.storeId);
    setEditingStaffCode(staff.staffCode);
    setEditingRole(staff.role);
  };

  const handleUpdateStaff = async () => {
    try {
      await updateStaff({
        staffId: editingStaff.staffId,
        staffName: editingStaffName,
        staffPhone: editingStaffPhone,
        staffEmail: editingStaffEmail,
        storeId: editingStoreId,
        staffCode: editingStaffCode,
        role: editingRole,
      });
      setEditingStaff(null);
      loadStaffs();
    } catch (error) {
      console.error("Error updating :", error);
    }
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Staff Management"
          data={staffs.map((staff) => ({ ...staff, storeName: staff.store?.storeName ,}))}
          columns={[
            { key: "staffCode", label: "Staff Code" },
            { key: "staffName", label: "Staff" },
            { key: "role", label: "Staff Role" },
            { key: "storeName", label: "Store Name" },
          ]}
          selectedItems={selectedStaffs}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedStaffs}
          handleSearch={loadStaffs}
          filters={[
            { label: "Staff Code", value: filters.staffCode },
            { label: "Staff Name", value: filters.staffName },
            { label: "Store Role", value: filters.role },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["staffCode", "staffName", "role"];
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
              onClick: handleEditStaff,
            },
          ]}
          extraButtons={[
            {
              label: "Create New",
              variant: "primary",
              onClick: handleCreateNewStaff,
            },
            {
              label: "Delete",
              variant: "danger",
              onClick: handleDeleteSelectedStaffs,
              className: "delete-btn",
              disabled: selectedStaffs.length === 0,
            },
          ]}
        />
      </div>

      {showModal && (
        <GenericModal
          show={showModal}
          title="Create New Staff"
          fields={[
            {
              label: "Store Name",
              controlId: "storeId",
              type: "select",
              value: storeId,
              onChange: (e) => setStoreId(e.target.value),
              options: staffs.map((p) => ({ label: p.storeName, value: p.storeId })),
            },
            {
              label: "Staff Name",
              controlId: "staffName",
              type: "text",
              value: staffName,
              onChange: (e) => setStaffName(e.target.value),
            },
            {
              label: "Staff Phone",
              controlId: "staffPhone",
              type: "text",
              value: staffPhone,
              onChange: (e) => setStaffPhone(e.target.value),
            },
            {
              label: "Staff Email",
              controlId: "staffEmail",
              type: "text",
              value: staffEmail,
              onChange: (e) => setStaffEmail(e.target.value),
            },
            {
              label: "Role",
              controlId: "role",
              type: "select",
              value: role,
              onChange: (e) => setRole(e.target.value),
              options: staffs.map((p) => ({ label: p.role, value: p.role })),
            },
            {
              label: "Password",
              controlId: "password",
              type: "text",
              value: password,
              onChange: (e) => setPassword(e.target.value),
            },
          ]}
          onSave={handleCreateStaff}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingStaff && (
        <GenericModal
          show={true}
          title="Edit Staff"
          fields={[
            {
              label: "Store Name",
              controlId: "editStoreId",
              type: "select",
              value: editingStoreId,
              onChange: (e) => setEditingStoreId(e.target.value),
              options: staffs.map((p) => ({ label: p.storeName, value: p.storeId })),
            },
            {
              label: "Staff Name",
              controlId: "editStaffName",
              type: "text",
              value: editingStaffName,
              onChange: (e) => setEditingStaffName(e.target.value),
            },
            {
              label: "Staff Phone",
              controlId: "editingStaffPhone",
              type: "text",
              value: editingStaffPhone,
              onChange: (e) => setEditingStaffPhone(e.target.value),
            },
            {
              label: "Staff Email",
              controlId: "editingStaffEmail",
              type: "text",
              value: editingStaffEmail,
              onChange: (e) => setEditingStaffEmail(e.target.value),
            },
          ]}
          onSave={handleUpdateStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}
    </div>
  );
}

export default StaffManagement;