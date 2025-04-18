import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getCustomer, updateStaff,} from "../ServiceApi/apiCustomer";
import GenericModal from "../components/GenericModal";  

function CustomerManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [filters, setFilters] = useState({
    name:"",
    code: "",
    email: "",
  });

  // // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  // const [editingCustomer, setEditingCustomer] = useState(null);
  // // const [editingCusName, setEditingManagerName] = useState("");
  // // const [editingManagerPhone, setEditingManagerPhone] = useState("");
  // // const [editingManagerEmail, setEditingManagerEmail] = useState("");
  // // const [editingStoreId, setEditingStoreId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, [currentPage]);

  const loadCustomers = async () => {
    try {
      const response = await getCustomer({
        pageNumber: currentPage,
        pageSize: pageSize,
        ...filters,
      });
      setCustomers(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const allCustomerIds = useMemo(() => customers.map((m) => m.id), [customers]);

  const handleCheckAll = (e) => {
    setSelectedCustomers(e.target.checked ? allCustomerIds : []);
  };

  const handleCheckOne = (id) => {
    setSelectedCustomers((prev) =>
      prev.includes(id)
        ? prev.filter((id) => id !== id)
        : [...prev, id]
    );
  };

  // const handleDeleteSelectedManagers = async () => {
  //   if (selectedManagers.length === 0) return;
  //   const confirmDelete = window.confirm(
  //     `Are you sure you want to delete ${selectedManagers.length} order(s)?`
  //   );
  //   if (!confirmDelete) return;

  //   try {
  //     const deletePromises = selectedManagers.map((id) => deleteStaff(id));
  //     const results = await Promise.allSettled(deletePromises);

  //     const failedDeletes = results.filter(
  //       (result) => result.status === "rejected"
  //     );

  //     if (failedDeletes.length > 0) {
  //       console.error(`Failed to delete ${failedDeletes.length} order(s).`);
  //     }

  //     setSelectedManagers([]);
  //     loadOrders();
  //   } catch (error) {
  //     console.error("Error deleting orders:", error);
  //   }
  // };

  // const handleCreateManager = async () => {
  //   try {
  //     await createStaff({ storeId, managerName, managerPhone, managerEmail, password });
  //     setShowModal(false);
  //     loadOrders();
  //     setStoreId("");
  //     setManagerName("");
  //     setManagerPhone("");
  //     setManagerEmail("");
  //     setPassword("");
  //   } catch (error) {
  //     console.error("Error creating :", error);
  //   }
  // };

  // const managerFields = [
  //   {
  //     label: "Store Id",
  //     controlId: "storeId",
  //     type: "text",
  //     value: storeId,
  //     onChange: (e) => setStoreId(e.target.value),
  //   },
  //   {
  //     label: "Manager Name",
  //     controlId: "managerName",
  //     type: "text",
  //     value: managerName,
  //     onChange: (e) => setManagerName(e.target.value),
  //   },
  //   {
  //     label: "Manager Phone",
  //     controlId: "managerPhone",
  //     type: "text",
  //     value: managerPhone,
  //     onChange: (e) => setManagerPhone(e.target.value),
  //   },
  //   {
  //     label: "Manager Email",
  //     controlId: "managerEmail",
  //     type: "text",
  //     value: managerEmail,
  //     onChange: (e) => setManagerEmail(e.target.value),
  //   },
  // ];

  // const handleCreateNewManager = () => {
  //   setShowModal(true);
  // };

  // Khi bấm "Edit", lưu manager cần chỉnh sửa và cập nhật giá trị ban đầu cho các trường
  // const handleEditManager = (manager) => {
  //   setEditingManager(manager);
  //   setEditingManagerName(manager.managerName);
  //   setEditingManagerPhone(manager.managerPhone);
  //   setEditingManagerEmail(manager.managerEmail);
  //   setEditingStoreId(manager.storeId);
  // };

  // const handleUpdateManager = async () => {
  //   try {
  //     await updateStaff({
  //       managerId: editingManager.managerId,
  //       managerName: editingManagerName,
  //       managerPhone: editingManagerPhone,
  //       managerEmail: editingManagerEmail,
  //       storeId: editingStoreId,
  //     });
  //     console.log("Updated successfully");
  //     setEditingManager(null);
  //     loadOrders();
  //   } catch (error) {
  //     console.error("Error updating :", error);
  //   }
  // };
  const handleDetailCustomer = (customer) => {
    navigate(`/customer-detail/${customer.id}`, { state: { customer } });
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Customer Management"
          data={customers}
          columns={[
            { key: "code", label: "Customer Code" },
            { key: "name", label: "Customer Name" },
            { key: "email", label: "Customer Email" },
            { key: "phoneNumber", label: "Customer Phone"},
          ]}
          selectedItems={selectedCustomers}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          // handleDeleteSelected={handleDeleteSelectedManagers}
          handleSearch={loadCustomers}
          filters={[
            { label: "Customer code", value: filters.code },
            { label: "Customer Name", value: filters.name },
            { label: "Customer Email", value: filters.email },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["code", "name", "email",];
            setFilters((prev) => ({ ...prev, [filterKeys[index]]: value }));
          }}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Detail",
              className: "detail",
              variant: "secondary",
              onClick: handleDetailCustomer,
            },
          ]}
        />
      </div>

      {/* {showModal && (
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
      )} */}
    </div>
  );
}

export default CustomerManagement;