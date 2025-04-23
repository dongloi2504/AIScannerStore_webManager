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
  getSalesByStore,
  getStockFlowReport,
} from "../ServiceApi/apiAdmin";
import { format } from "date-fns";
import SalesByDay from "../components/SalesByDay";
import SalesByProductChart from "../components/SalesByProductChart";
import SalesByStoreChart from "../components/SalesByStoreChart";

const Report = () => {
  // State chung
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  // Active tab: "sales", "spending", "inventory", "orderStatus"
  const [activeTab, setActiveTab] = useState("sales");

  // Sales tab state – salesMode có thể là "day", "product", "store"
  const [salesMode, setSalesMode] = useState("day");

  // Spending tab state
  const [spendingDateFrom, setSpendingDateFrom] = useState(null);
  const [spendingDateTo, setSpendingDateTo] = useState(null);
  const [spendingData, setSpendingData] = useState([]);

  // Sales data và thông tin bổ sung
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [average, setAverage] = useState(0);

  // Inventory I/O state
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryType, setInventoryType] = useState({
    label: "Change",
    value: "CHANGE",
  });

  // Khi activeTab là "sales", dựa trên salesMode gọi API tương ứng
  useEffect(() => {
    if (activeTab === "sales") {
      if (salesMode === "day") {
        fetchSalesByDayData();
      } else if (salesMode === "product") {
        fetchSalesByProductData();
        // Ở mode product, SalesByProductChart tự tính tổng/trung bình nên ta không dùng state day/store.
        setTotalRevenue(0);
        setAverage(0);
      } else if (salesMode === "store") {
        fetchSalesByStoreData();
      }
    }
  }, [activeTab, salesMode]);

  const fetchSalesByDayData = async () => {
    try {
      const res = await getSalesByDay();
      // API trả về đối tượng: { dateFrom, dateTo, totalRevenue, average, sales }
      const mapped = (res.sales || []).map((item, idx) => ({
        id: idx + 1,
        date: format(new Date(item.date), "dd/MM/yyyy"),
        revenue: item.revenue,
      }));
      setSalesData(mapped);
      setTotalRevenue(res.totalRevenue);
      setAverage(res.average);
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

  const fetchSalesByStoreData = async () => {
    try {
      const res = await getSalesByStore();
      // Mapping: lấy storeName từ store
      const mapped = (res.sales || []).map((item, idx) => ({
        id: idx + 1,
        storeName: item.store?.storeName || "Unknown",
        revenue: item.revenue,
      }));
      setSalesData(mapped);
      setTotalRevenue(res.totalRevenue);
      setAverage(res.average);
    } catch (err) {
      console.error("Failed to fetch sales by store:", err);
    }
  };

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

  const fetchInventoryIOData = async () => {
    const params = {
      type: inventoryType?.value || null,
      dateFrom: null,
      dateTo: null,
    };

    if (!params.type) {
      alert("Vui lòng chọn 'Type'");
      return;
    }

    try {
      const res = await getStockFlowReport(params);
      const stockFlows = res?.stockFlows || res?.data?.stockFlows || [];
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
      setInventoryData(mapped);
    } catch (err) {
      console.error("Failed to fetch inventory I/O data:", err);
    }
  };

  // Cấu hình các tab
  const tabs = useMemo(
    () => [
      {
        key: "sales",
        label: "Sales Overview",
        data: salesData,
        columns:
          salesMode === "day"
            ? [
                { key: "date", label: "Date" },
                { key: "revenue", label: "Revenue" },
              ]
            : salesMode === "product"
            ? [
                { key: "productName", label: "Product" },
                { key: "revenue", label: "Revenue" },
                { key: "quantity", label: "Quantity" },
              ]
            : salesMode === "store"
            ? [
                { key: "storeName", label: "Store" },
                { key: "revenue", label: "Revenue" },
              ]
            : [],
        type:
          salesMode === "day"
            ? "customChart"
            : salesMode === "product"
            ? "productChart"
            : salesMode === "store"
            ? "customChart"
            : "table",
        customContent:
          salesMode === "day" ? (
            <SalesByDay
              data={salesData}
              totalRevenue={totalRevenue}
              average={average}
            />
          ) : salesMode === "store" ? (
            <SalesByStoreChart
              data={salesData}
              totalRevenue={totalRevenue}
              average={average}
            />
          ) : null,
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
        data: [], // Data cho OrderStatusChart được lấy bên trong component đó
        type: "orderStatusChart",
      },
    ],
    [salesData, salesMode, spendingData, inventoryData, totalRevenue, average]
  );

  // Tùy chỉnh Organize Control theo từng tab
  const organizeControl = (() => {
    if (activeTab === "sales") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <label style={{ fontWeight: "bold" }}>Organize By:</label>
          <Select
            value={{
              label:
                salesMode === "day"
                  ? "Day"
                  : salesMode === "product"
                  ? "Product"
                  : salesMode === "store"
                  ? "Store"
                  : "",
              value: salesMode,
            }}
            options={[
              { label: "Day", value: "day" },
              { label: "Product", value: "product" },
              { label: "Store", value: "store" },
            ]}
            onChange={(option) => setSalesMode(option.value)}
            styles={{ container: (base) => ({ ...base, minWidth: 200 }) }}
          />
        </div>
      );
    }
    if (activeTab === "inventory") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ fontWeight: "bold" }}>Type:</label>
          <Select
            value={inventoryType}
            options={[
              { label: "Change", value: "CHANGE" },
              { label: "Audit", value: "AUDIT" },
              { label: "Order", value: "ORDER" },
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
