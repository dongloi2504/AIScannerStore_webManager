import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getCustomer, updateCustomer,deleteStaff} from "../ServiceApi/apiCustomer";
import GenericModal from "../components/GenericModal";  
import { useToast } from "../Context/ToastContext";

function CustomerManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    name:"",
    code: "",
    email: "",
    isSuspended:false,
  });

  // // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingCode, setEditingCode] = useState("");
  const [editingSuspend, setEditingSuspend] = useState(false);
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

  const handleDeleteSelectedCustomers = async () => {
    if (selectedCustomers.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to suspend ${selectedCustomers.length} customer(s)?`
    );
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedCustomers.map((id) => deleteStaff(id));
      const results = await Promise.allSettled(deletePromises);

      const failedDeletes = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error(`Failed to suspend ${failedDeletes.length} customer(s).`);
      }

      setSelectedCustomers([]);
      loadCustomers();
    } catch (error) {
      console.error("Error deleting customers:", error);
    }
  };


  // Khi bấm "Edit", lưu manager cần chỉnh sửa và cập nhật giá trị ban đầu cho các trường
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setEditingCode(customer.code);
    setEditingSuspend(customer.isSuspended);
  };

  const handleUpdateCustomer = async () => {
    try {
      await updateCustomer({
        id: editingCustomer.id,
        code: editingCode,
        isSuspended: editingSuspend,
      });
      setEditingCustomer(null);
      loadCustomers();
      showToast("Customer Updated!", "info");
    } catch (error) {
      const message =
      typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
  showToast(message,"error");
  throw error;
    }
  };
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
            { label: "Suspend", value: filters.isSuspended, type:"checkbox", hasLabel:true },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["code", "name", "email", "isSuspended"];
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
              onClick: handleEditCustomer,
            },
            {
              label: "Detail",
              className: "detail",
              variant: "secondary",
              onClick: handleDetailCustomer,
            },
          ]}
          // extraButtons={[
          //   {
          //     label: "Suspend",
          //     variant: "danger",
          //     onClick: handleDeleteSelectedCustomers,
          //     className: "delete-btn",
          //     disabled: selectedCustomers.length === 0,
          //   },
          // ]}
        />
      </div>


      {editingCustomer && (
        <GenericModal
          show={true}
          title="Edit Customer"
          fields={[
            {
              label: "Customer Code",
              controlId: "editingCode",
              type: "text",
              value: editingCode,
              required: true,
              onChange: (e) => setEditingCode(e.target.value),
            },
            {
              label: "Suspend",
				      controlId: "editingSuspend",
				      type: "checkbox",
				      value: editingSuspend,
				      onChange: (e) => setEditingSuspend(e.target.checked),
            },
          ]}
          onSave={handleUpdateCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )} 
    </div>
  );
}

export default CustomerManagement;