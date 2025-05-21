import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import Select from "react-select";
import { getProducts } from "../ServiceApi/apiAdmin";
import { getOrder, createManager, deleteManager } from "../ServiceApi/apiOrder";
import { useAuth } from "../Authen/AuthContext";
import OrderDetailPopup from "../components/OrderDetailPopup";
import "../Styles/GlobalStyles.css";

function OrderManagement() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    orderCode: "",
    customerCode: "",
    storeCode: "",
    status: "",
    isCorrection: false,
    isFlagged: false,
  });
  const [products, setProducts] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { label: "CREATED", value: "CREATED" },
    { label: "PAID", value: "PAID" },
    { label: "FINISHED", value: "FINISHED" },
    { label: "EDITED", value: "EDITED" },
    { label: "STAFF_CANCELLED", value: "STAFF_CANCELLED" },
    { label: "CANCELLED", value: "CANCELLED" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 2147483647 });
      setProducts(res?.items || []);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setProducts([]);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrder({
        pageNumber: currentPage,
        pageSize,
        customerCode: filters.customerCode,
        storeCode: filters.storeCode,
        orderCode: filters.orderCode,
        statuses: filters.status ? [filters.status] : [],
        isCorrection: filters.isCorrection,
        isFlagged: filters.isFlagged,
      });
      setManagers(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const allOrderIds = useMemo(() => managers.map((m) => m.orderId), [managers]);

  const handleCheckAll = (e) => {
    setSelectedManagers(e.target.checked ? allOrderIds : []);
  };

  const handleCheckOne = (orderId) => {
    setSelectedManagers((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const formatPrice = (price) => {
    if (typeof price !== "number") return price;
    return price.toLocaleString("vi-VN") + " đ";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}, ${date
      .getHours()
      .toString()
      .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Order Management"
          loading={loading}
          data={managers.map((m) => ({
            ...m,
            total: formatPrice(m.total),
            createdDate: formatDateTime(m.createdDate),
          }))}
          columns={[
            { key: "orderCode", label: "Order Code" },
            { key: "total", label: "Total Price" },
            { key: "status", label: "Status" },
            { key: "createdDate", label: "Create Date" },
          ]}
          selectedItems={selectedManagers}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={() => {}} // optional if not needed
          handleSearch={loadOrders}
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
            const keys = ["orderCode", "customerCode", "storeCode", "status", "isCorrection", "isFlagged"];
            setFilters((prev) => ({ ...prev, [keys[index]]: value }));
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
              onClick: (order) => {
                setSelectedOrderId(order.orderId);
                setShowPopup(true);
              },
            },
          ]}
        />

        <OrderDetailPopup
          orderId={selectedOrderId}
          show={showPopup}
          onClose={() => setShowPopup(false)}
        />
      </div>
    </div>
  );
}

export default OrderManagement;
