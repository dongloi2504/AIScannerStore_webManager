import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getProducts } from "../ServiceApi/apiAdmin";
import LiveOrderEditModal from "../components/LiveOrderEditModal";
import { getLiveOrder, editLiveOrder, getSingleOrder, timeoutOrder } from "../ServiceApi/apiLiveOrder";
import {
  getOrder,
  updateOrder,
  createManager,
  deleteManager
} from "../ServiceApi/apiOrder";
import GenericModal from "../components/GenericModal";
import Select from "react-select";
import { useAuth } from "../Authen/AuthContext";
import { Role } from "../const/Role";

function OrderManagement() {
  const { user } = useAuth();
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
    orderCode: "",
    customerCode: "",
    storeCode: "",
    status: "",
    isCorrection: false,
    isFlagged: false,
  });
  
  // State for editing modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingOrderItems, setEditingOrderItems] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState("");
  const [editingOrderImage1, setEditingOrderImage1] = useState("");
  const [editingOrderImage2, setEditingOrderImage2] = useState("");
  const [editingOrderImage3, setEditingOrderImage3] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { label: "CREATED", value: "CREATED" },
    { label: "PAID", value: "PAID" },
    { label: "FINISHED", value: "FINISHED" },
    { label: "EDITED", value: "EDITED" },
    { label: "STAFF_CANCELLED", value: "STAFF_CANCELLED" },
    { label: "CANCELLED", value: "CANCELLED" },
  ];

  const navigate = useNavigate();

  useEffect(() => {
	fetchProducts();
  }, []);
  
  useEffect(() => {
    loadOrders();
  }, [currentPage]);
  
   const handleSearch = () => {
	  setCurrentPage(1);
	  if(currentPage === 1) {
		  loadOrders();
	  }
   }
  
    const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 2147483647 });
      setProducts(res?.items || []);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setProducts([]);
    }
  };
  const triggerLiveOrder = (order) => {
	getSingleOrder(order.orderId).then((data) => {
	// Reset data of modal
	  setEditingOrderItems(data.items.map(item => ({productId:item.productId, changeAmount:item.count})));
      setEditingOrderId(order.orderId);
      setEditingOrderImage1(order.image1);
	  setEditingOrderImage2(order.image2);
	  setEditingOrderImage3(order.image3);
	  setShowModal(true);
	}).catch(console.error);
  };

  const loadOrders = async () => {
    try {
      const response = await getOrder({
        pageNumber: currentPage,
        pageSize: pageSize,
        customerCode: filters.customerCode,
        storeCode: filters.storeCode,
        orderCode: filters.orderCode,
        statuses: filters.status ? [filters.status] : [],
        isCorrection: filters.isCorrection,
        isFlagged: filters.isFlagged,
      });
      setManagers(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const allOrderIds = useMemo(() => managers.map((m) => m.orderId), [managers]);
  
  const handleEditOrder = async () => {
      await updateOrder({ 
		fixedOrderId: editingOrderId,
		staffId: user.staffId,
		items: editingOrderItems.map(x => ({productId: x.productId, count:x.changeAmount}))
	  }).then(x => alert("Order edited"))
	  .catch(e => {
		  alert("Error when editing order:" + e);
		  return;
	  });
      setShowModal(false);
      loadOrders();
      setEditingOrder(null);
	  setEditingOrderId("");
	  setEditingOrderImage1("");
	  setEditingOrderImage2("");
	  setEditingOrderImage3("");
	  setEditingOrderItems([{productId:"", changeAmount:0}]);
  };

  const handleCheckAll = (e) => {
    setSelectedManagers(e.target.checked ? allOrderIds : []);
  };

  const handleCheckOne = (orderId) => {
    setSelectedManagers((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleDeleteSelectedManagers = async () => {
    if (selectedManagers.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedManagers.length} order(s)?`
    );
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedManagers.map((id) => deleteManager(id));
      const results = await Promise.allSettled(deletePromises);
      const failedDeletes = results.filter((r) => r.status === "rejected");

      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} order(s).`);
      }

      setSelectedManagers([]);
      loadOrders();
    } catch (error) {
      console.error("Error deleting orders:", error);
    }
  };

  const handleCreateManager = async () => {
    try {
      await createManager({
        storeId,
        managerName,
        managerPhone,
        managerEmail,
        password,
      });
      setShowModal(false);
      loadOrders();
      setStoreId("");
      setManagerName("");
      setManagerPhone("");
      setManagerEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error creating manager:", error);
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

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Order Management"
          data={managers}
          columns={[
            { key: "orderCode", label: "Order Code" },
            { key: "total", label: "Total Price" },
            { key: "status", label: "Status" },
            { key: "createdDate", label: "Create Date" },
          ]}
          selectedItems={selectedManagers}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedManagers}
          handleSearch={handleSearch}
          filters={[
            { label: "Order Code", value: filters.orderCode },
            { label: "Customer Code", value: filters.customerCode },
            { label: "Store Code", value: filters.storeCode },
            {
              label: "Status",
              type: "custom",
              element: (
                <Select
                  options={statusOptions}
                  placeholder="Select Status"
                  isClearable
                  value={
                    filters.status
                      ? statusOptions.find((opt) => opt.value === filters.status)
                      : null
                  }
                  onChange={(selected) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: selected?.value || "",
                    }))
                  }
                />
              ),
            },
            {
              label: "Correction",
              type: "checkbox",
              value: filters.isCorrection,
              hasLabel: true,
              onChange: (e) =>
                setFilters((prev) => ({
                  ...prev,
                  isCorrection: e.target.checked,
                })),
            },
            {
              label: "Flagged",
              type: "checkbox",
              value: filters.isFlagged,
              hasLabel: true,
              onChange: (e) =>
                setFilters((prev) => ({
                  ...prev,
                  isFlagged: e.target.checked,
                })),
            },
          ]}
          setFilters={(index, value) => {
            const filterKeys = [
              "orderCode",
              "customerCode",
              "storeCode",
              "status",
              "isCorrection",
              "isFlagged",
            ];
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
              onClick: (order) => navigate(`/order-detail/${order.orderId}`),
            },
			{
			  label: "Edit",
			  className: "detail",
			  variant: "danger",
			  onClick: triggerLiveOrder,
			  disabled: (item) => (item.status !== 'PAID'),
			  roles: [Role.MANAGER, Role.ADMIN],
			},
          ]}
        />
      </div>

      {/* Optional: Modal tạo manager */}
      {showModal && (
        <LiveOrderEditModal
          show={showModal}
		  onSave={handleEditOrder}
		  onClose={() => {setShowModal(false);}}
		  productChanges={editingOrderItems}
		  setProductChanges={setEditingOrderItems}
		  products={products}
		  loading={loading}
		  orderId={editingOrderId}
		  image1={editingOrderImage1}
		  image2={editingOrderImage2}
		  image3={editingOrderImage3}
        />
      )}
    </div>
  );
}

export default OrderManagement;
