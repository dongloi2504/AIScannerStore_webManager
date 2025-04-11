import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/SideBar";
import GenericReport from "../components/GenericReport";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../Styles/Report.css";
import {
  getCustomerWalletReport,
  getSalesByDay,
  getSalesByProduct,
  getStockFlowReport,
  getOrderStatus, // API mới cho Order Status (bạn cần import từ ServiceApi)
} from "../ServiceApi/apiAdmin";
import { format } from "date-fns";

const Report = () => {
  // State chung
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  // Active tab: "sales", "spending", "inventory", "orderStatus"
  const [activeTab, setActiveTab] = useState("sales");

  // Sales tab state
  const [salesMode, setSalesMode] = useState("day");

  // Spending tab state
  const [spendingDateFrom, setSpendingDateFrom] = useState(null);
  const [spendingDateTo, setSpendingDateTo] = useState(null);
  const [spendingData, setSpendingData] = useState([]);

  // Sales tab state
  const [salesData, setSalesData] = useState([]);

  // Inventory I/O state
  const [inventoryData, setInventoryData] = useState([]);
  // Giữ lại inventoryType (mặc định là "Change")
  const [inventoryType, setInventoryType] = useState({ label: "Change", value: "CHANGE" });

  // Order status: dữ liệu sẽ được fetch và hiển thị bên component OrderStatusChart nên không cần state riêng

  // Fetch Sales data
  useEffect(() => {
    if (activeTab === "sales") {
      if (salesMode === "day") fetchSalesByDayData();
      else fetchSalesByProductData();
    }
  }, [activeTab, salesMode]);

  const fetchSalesByDayData = async () => {
    try {
      const res = await getSalesByDay();
      const mapped = (res.sales || []).map((item, idx) => ({
        id: idx + 1,
        date: format(new Date(item.date), "dd/MM/yyyy"),
        revenue: item.revenue,
      }));
      setSalesData(mapped);
    } catch (err) {
      console.error("Failed to fetch sales by day:", err);
    }
  };

  const fetchSalesByProductData = async () => {
    try {
      const res = await getSalesByProduct();
      const mapped = (res.sales || []).map((item, idx) => ({
        id: idx + 1,
        productName: item.product?.productName || "Unnamed",
        revenue: item.totalRevenue,
        quantity: item.totalCount,
      }));
      setSalesData(mapped);
    } catch (err) {
      console.error("Failed to fetch sales by product:", err);
    }
  };

  // Fetch Spending data
  const fetchSpendingData = async () => {
    if (!spendingDateFrom || !spendingDateTo) {
      alert("Please select both Date From and Date To.");
      return;
    }
    try {
      const res = await getCustomerWalletReport({
        pageNumber: 1,
        pageSize: 8,
        dateFrom: format(spendingDateFrom, "yyyy-MM-dd'T'00:00:00.000'Z'"),
        dateTo: format(spendingDateTo, "yyyy-MM-dd'T'23:59:59.999'Z'"),
      });
      setSpendingData(res.items || []);
    } catch (err) {
      console.error("Failed to fetch spending data:", err);
    }
  };

  // Fetch Inventory I/O data
  const fetchInventoryIOData = async () => {
    const params = {
      type: inventoryType?.value || null,
      // Bỏ phần filter theo ngày cho inventory
      dateFrom: null,
      dateTo: null,
    };

    console.log("✅ Params Inventory gửi API:", params);
    if (!params.type) {
      alert("Vui lòng chọn 'Type'");
      return;
    }

    try {
      const res = await getStockFlowReport(params);
      // Kiểm tra data trong res, có thể tại res.stockFlows hoặc res.data.stockFlows
      const stockFlows = res?.stockFlows || res?.data?.stockFlows || [];
      console.log("📦 Inventory stockFlows:", stockFlows);

      // Mapping data từ stockFlows (ví dụ như code đã có)
      const mapped = stockFlows.reduce((acc, flow) => {
        const formattedDate = flow.date
          ? format(new Date(flow.date), "dd/MM/yyyy")
          : "Unknown";
        const products = Array.isArray(flow.products) ? flow.products : [];
        if (products.length > 0) {
          const mappedProducts = products.map((p) => ({
            id: acc.length + 1,
            productName: p.product?.productName || "Unknown",
            quantityChange: p.amount ?? 0,
            changeType: flow.type || params.type || "Unknown",
            date: formattedDate,
          }));
          return acc.concat(mappedProducts);
        }
        return acc;
      }, []);

      console.log("✅ Mapped Inventory Data:", mapped);
      setInventoryData(mapped);
    } catch (err) {
      console.error("❌ Failed to fetch inventory I/O data:", err);
    }
  };

  // Các tab: thêm Order Status tab vào cuối danh sách
  const tabs = useMemo(() => [
    {
      key: "sales",
      label: "Sales Overview",
      data: salesData,
      columns: salesMode === "day"
        ? [
            { key: "date", label: "Date" },
            { key: "revenue", label: "Revenue" },
          ]
        : [
            { key: "productName", label: "Product" },
            { key: "revenue", label: "Revenue" },
            { key: "quantity", label: "Quantity" },
          ],
      type: salesMode === "day" ? "chart" : "productChart",
    },
    {
      key: "spending",
      label: "Track Spending",
      data: spendingData,
      columns: [
        { key: "customerName", label: "Customer" },
        { key: "customerEmail", label: "Customer Email" },
        { key: "totalDeposit", label: "Total Deposit" },
        { key: "totalSpend", label: "Total Spend" },
      ],
      type: "table",
    },
    {
      key: "inventory",
      label: "Inventory I/O",
      data: inventoryData,
      columns: [
        { key: "productName", label: "Product" },
        { key: "quantityChange", label: "Quantity Change" },
        { key: "changeType", label: "Change Type" },
        { key: "date", label: "Date" },
      ],
      type: "table",
    },
    {
      key: "orderStatus",
      label: "Order Status",
      data: [], // Data sẽ được lấy trực tiếp trong component OrderStatusChart
      type: "orderStatusChart",
    },
  ], [salesData, salesMode, spendingData, inventoryData]);

  // Tùy chỉnh bộ điều khiển (organize control) theo từng tab
  const organizeControl = (() => {
    if (activeTab === "sales") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ fontWeight: "bold" }}>Organize By:</label>
          <Select
            value={{ label: salesMode === "day" ? "Day" : "Product", value: salesMode }}
            options={[
              { label: "Day", value: "day" },
              { label: "Product", value: "product" },
            ]}
            onChange={(option) => setSalesMode(option.value)}
            styles={{ container: (base) => ({ ...base, minWidth: 200 }) }}
          />
        </div>
      );
    }
    if (activeTab === "inventory") {
      // Chỉ cần hiển thị phần chọn Type và nút Filter
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "bold" }}>Type:</label>
          <Select
            value={inventoryType}
            options={[
              { label: "Change", value: "CHANGE" },
              { label: "Audit", value: "AUDIT" },
            ]}
            onChange={(val) => setInventoryType(val)}
            styles={{ container: (base) => ({ ...base, minWidth: 200 }) }}
          />
          <button
            onClick={fetchInventoryIOData}
            className="filter-btn"
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Filter
          </button>
        </div>
      );
    }
    // Với tab spending, giữ nguyên date picker
    if (activeTab === "spending") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "bold" }}>Date From:</label>
          <DatePicker
            selected={spendingDateFrom}
            onChange={setSpendingDateFrom}
            placeholderText="dd/MM/yyyy"
            dateFormat="dd/MM/yyyy"
            className="datepicker-input"
          />
          <label style={{ fontWeight: "bold" }}>Date To:</label>
          <DatePicker
            selected={spendingDateTo}
            onChange={setSpendingDateTo}
            placeholderText="dd/MM/yyyy"
            dateFormat="dd/MM/yyyy"
            className="datepicker-input"
          />
          <button
            onClick={fetchSpendingData}
            className="filter-btn"
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Filter
          </button>
        </div>
      );
    }
    // Với tab Order Status, không cần bộ lọc (data được fetch trong OrderStatusChart)
    return null;
  })();

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedItems([]);
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <GenericReport
          title="Business Report"
          tabs={tabs}
          activeTab={activeTab}
          selectedItems={selectedItems}
          handleCheckAll={() => {}}
          handleCheckOne={() => {}}
          onTabChange={handleTabChange}
          organizeControl={organizeControl}
          actions={[]}
          extraButtons={[]}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          idType={["id", "customerId"]}
        />
      </div>
    </div>
  );
};

export default Report;
