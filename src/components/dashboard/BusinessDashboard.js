import React, { useEffect, useState } from "react";
import DevicesActive from "./widgets/DevicesActive";
import OrdersToday from "./widgets/OrdersToday";
import RevenueByHour from "./widgets/RevenueByHour";
import OrderStatusByHour from "./widgets/OrderStatusByHour";
import RevenueSummary from "./widgets/RevenueSummary";
import PendingRequests from "./widgets/PendingRequests";
import SalesByDay from "../SalesByDay";
import {
  getStoreDashboardReport,
  getProductReport,
  getSalesReport,
  getDeviceReport,
  exportSalesReport,
  exportProductReport,
  exportInventoryReport,
  exportDeviceReport
} from "../../ServiceApi/apiReport";
import { getInventoryHistoryByStoreId } from "../../ServiceApi/apiAdmin";
import DataTable from "../DataTable";
import OrderStatusChart from "./widgets/OrderStatusChart";
import "react-datepicker/dist/react-datepicker.css";
import InventoryHistoryModal from "../InventoryHistoryModal";

const BusinessDashboard = ({ storeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [average, setAverage] = useState(0);

  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 28);
    return date;
  });
  const [dateTo, setDateTo] = useState(new Date());

  const [productReportData, setProductReportData] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productPageNumber, setProductPageNumber] = useState(1);
  const productPageSize = 10;
  const [productTotalPages, setProductTotalPages] = useState(1);

  const [inventoryHistoryData, setInventoryHistoryData] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryPageNumber, setInventoryPageNumber] = useState(1);
  const inventoryPageSize = 10;
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);

  const [selectedInventoryNoteId, setSelectedInventoryNoteId] = useState(null);

  const [deviceLoading, setDeviceLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [statusSummary, setStatusSummary] = useState(null);
  const [devicePageNumber, setDevicePageNumber] = useState(1);
  const devicePageSize = 10;
  const [deviceTotalPages, setDeviceTotalPages] = useState(1);

  useEffect(() => {
    if (!storeId) return;
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    if (activeTab === "product") fetchProductReport();
    if (activeTab === "sales") fetchSalesData();
    if (activeTab === "devices") fetchDeviceReport();
  }, [activeTab, productPageNumber, devicePageNumber]);

  useEffect(() => {
    if (activeTab === "inventory") fetchInventoryHistory();
  }, [activeTab, inventoryPageNumber]);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getStoreDashboardReport(storeId);
      if (res && typeof res === "object" && Object.keys(res).length > 0) {
        setData({ ...res });
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const res = await getSalesReport({ storeId });
      const formatted = res.sales.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN"),
        revenue: item.revenue,
      }));
      setSalesData(formatted);
      setTotalRevenue(res.totalRevenue);
      setAverage(res.average);
    } catch (err) {
      console.error("Failed to fetch sales report", err);
    }
  };
  const handleExportSales = async () => {
    try {
      const response = await exportSalesReport(storeId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales_report_${storeId}.xlsx`); // hoặc .csv tùy định dạng file server trả về
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export sales report", err);
    }
  };

  const handleExportGeneric = async (exportFunc, fileName) => {
    try {
      const response = await exportFunc(storeId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}_${storeId}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Failed to export ${fileName}`, err);
    }
  };


  const fetchProductReport = async () => {
    if (!storeId) return;
    setProductLoading(true);
    try {
      const payload = {
        pageNumber: productPageNumber,
        pageSize: productPageSize,
        dateFrom: dateFrom.toISOString().split("T")[0],
        dateTo: dateTo.toISOString().split("T")[0],
        storeId,
      };
      const res = await getProductReport(payload);
      if (res?.items) {
        const formattedData = res.items.map((item) => {
          const p = item.product;
          return {
            productCode: p.productCode,
            productName: p.productName,
            categoryName: p.categoryName,
            avgCountPerOrder: item.averageCountPerOrder.toFixed(2),
            successOrderCount: `${item.successOrderCount} (${(item.successOrderPercentage * 100).toFixed(0)}%)`,
            correctionOrderCount: `${item.correctionOrderCount} (${(item.correctionOrderPercentage * 100).toFixed(0)}%)`,
            totalRevenue: `${item.totalRevenue.toLocaleString("vi-VN")}₫`,
          };
        });
        setProductReportData(formattedData);
        setProductTotalPages(Math.ceil(res.totalItem / productPageSize));
      } else {
        setProductReportData([]);
        setProductTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch product report", err);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchInventoryHistory = async () => {
    setInventoryLoading(true);
    try {
      const res = await getInventoryHistoryByStoreId({
        storeId,
        PageNumber: inventoryPageNumber,
        PageSize: inventoryPageSize,
      });
      const formatted = res?.items.map((item) => ({
        staff: item.staff?.staffName || "system",
        type: item.type,
        date: new Date(item.createTime).toLocaleDateString("vi-VN"),
        action: (
          <button className="btn btn-secondary" onClick={() => setSelectedInventoryNoteId(item.inventoryNoteId)}>
            Detail
          </button>
        ),
      })) || [];
      setInventoryHistoryData(formatted);
      setInventoryTotalPages(Math.ceil(res.totalItem / inventoryPageSize));
    } catch (err) {
      console.error("Failed to fetch inventory history", err);
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchDeviceReport = async () => {
    if (!storeId) return;
    setDeviceLoading(true);
    try {
      const res = await getDeviceReport({
        pageNumber: devicePageNumber,
        pageSize: devicePageSize,
        storeId,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      });

      const data = res.items || [];
      setDevices(data);
      setDeviceCount(res.totalItem || data.length);
      setDeviceTotalPages(Math.ceil((res.totalItem || data.length) / devicePageSize));

      const totals = data.reduce(
        (acc, cur) => {
          acc.success += cur.successOrderCount;
          acc.cancelled += cur.cancelledOrderCount;
          acc.edit += cur.editOrderCount;
          acc.correction += cur.correctionOrderCount;
          return acc;
        },
        { success: 0, cancelled: 0, edit: 0, correction: 0 }
      );

      const total = totals.success + totals.cancelled + totals.edit + totals.correction;
      setStatusSummary({
        success: total ? totals.success / total : 0,
        cancelled: total ? totals.cancelled / total : 0,
        edit: total ? totals.edit / total : 0,
        correction: total ? totals.correction / total : 0,
      });
    } catch (err) {
      console.error("Failed to fetch device report", err);
    } finally {
      setDeviceLoading(false);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No dashboard data available.</div>;

  return (
    <div className="dashboard-layout">
      <div className="tab-group" style={{ marginBottom: "1rem" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "product", label: "Product" },
          { key: "inventory", label: "Inventory I/O" },
          { key: "sales", label: "Sales" },
          { key: "devices", label: "Devices" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <div className="row">
            <DevicesActive count={data.deviceCount} />
            <OrdersToday count={data.orderCount} />
          </div>
          <div className="row">
            <RevenueByHour data={data.hours || []} />
            <OrderStatusByHour data={data.hours || []} />
          </div>
          <div className="row">
            <RevenueSummary daily={data.dailyRevenue} weekly={data.weeklyRevenue} monthly={data.monthlyRevenue} />
            <PendingRequests count={data.pendingRequestCount} />
          </div>
          {lastUpdated && (
            <div className="last-updated" style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
              Update time: {lastUpdated.toLocaleTimeString("vi-VN")}
            </div>
          )}
        </>
      )}

      {activeTab === "product" && (
        <>
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              className="btn btn-primary"
              onClick={() => handleExportGeneric(exportProductReport, "product_report")}
            >
              Export Product Report
            </button>
          </div>
          <DataTable
            title="Product Report"
            data={productReportData}
            loading={productLoading}
            columns={[
              { key: "productCode", label: "Product Code" },
              { key: "productName", label: "Product Name" },
              { key: "categoryName", label: "Category Name" },
              { key: "avgCountPerOrder", label: "Average Count/Order" },
              { key: "successOrderCount", label: "Success Order Count" },
              { key: "correctionOrderCount", label: "Correction Order Count" },
              { key: "totalRevenue", label: "Total Revenue" },
            ]}
            currentPage={productPageNumber}
            totalPages={productTotalPages}
            handlePrev={() => setProductPageNumber((p) => Math.max(p - 1, 1))}
            handleNext={() => setProductPageNumber((p) => Math.min(p + 1, productTotalPages))}
            showCheckboxes={false}
          />
        </>
      )}


      {activeTab === "inventory" && (
        <>
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              className="btn btn-primary"
              onClick={() => handleExportGeneric(exportInventoryReport, "inventory_report")}
            >
              Export Inventory Report
            </button>
          </div>
          <DataTable
            title="Inventory I/O"
            data={inventoryHistoryData}
            loading={inventoryLoading}
            columns={[
              { key: "staff", label: "Staff" },
              { key: "type", label: "Type" },
              { key: "date", label: "Date" },
              { key: "action", label: "Action" },
            ]}
            currentPage={inventoryPageNumber}
            totalPages={inventoryTotalPages}
            handlePrev={() => setInventoryPageNumber((p) => Math.max(p - 1, 1))}
            handleNext={() => setInventoryPageNumber((p) => Math.min(p + 1, inventoryTotalPages))}
            showCheckboxes={false}
          />
        </>
      )}


      {activeTab === "sales" && (
        <>
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button className="btn btn-primary" onClick={handleExportSales}>
              Export Sales Report
            </button>
          </div>
          <SalesByDay data={salesData} totalRevenue={totalRevenue} average={average} />
        </>
      )}

      {activeTab === "devices" && (
        <>
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <button
              className="btn btn-primary"
              onClick={() => handleExportGeneric(exportDeviceReport, "device_report")}
            >
              Export Device Report
            </button>
          </div>

          <div className="row">
            <DevicesActive count={deviceCount} />
            {statusSummary && (
              <div className="dashboard-widget">
                <h3>Total Order Status</h3>
                <OrderStatusChart
                  data={[
                    { name: "Success", value: statusSummary.success },
                    { name: "Cancelled", value: statusSummary.cancelled },
                    { name: "Edit", value: statusSummary.edit },
                    { name: "Correction", value: statusSummary.correction },
                  ]}
                />
              </div>
            )}
          </div>

          <DataTable
            title="Device Order Summary"
            data={devices.map((d) => {
              const {
                successOrderCount,
                cancelledOrderCount,
                correctionOrderCount,
                editOrderCount,
                successOrderPercentage,
                cancelledOrderPercentage,
                correctionOrderPercentage,
                editOrderPercentage,
                orderCount,
                totalRevenue,
                device,
              } = d;

              const formatCount = (count, percentage) =>
                `${count} (${(percentage * 100).toFixed(0)}%)`;

              return {
                deviceCode: device.deviceCode,
                orderCount: orderCount,
                successOrderCount: formatCount(successOrderCount, successOrderPercentage),
                cancelledOrderCount: formatCount(cancelledOrderCount, cancelledOrderPercentage),
                correctionOrderCount: formatCount(correctionOrderCount, correctionOrderPercentage),
                editOrderCount: formatCount(editOrderCount, editOrderPercentage),
                totalRevenue: `${(totalRevenue || 0).toLocaleString("vi-VN")}₫`,
              };
            })}
            columns={[
              { key: "deviceCode", label: "Device Code" },
              { key: "orderCount", label: "Order Count" },
              { key: "successOrderCount", label: "Success" },
              { key: "cancelledOrderCount", label: "Cancelled" },
              { key: "correctionOrderCount", label: "Correction" },
              { key: "editOrderCount", label: "Edit" },
              { key: "totalRevenue", label: "Total Revenue" },
            ]}
            loading={deviceLoading}
            showCheckboxes={false}
            currentPage={devicePageNumber}
            totalPages={deviceTotalPages}
            handlePrev={() => setDevicePageNumber((p) => Math.max(p - 1, 1))}
            handleNext={() => setDevicePageNumber((p) => Math.min(p + 1, deviceTotalPages))}
          />
        </>
      )}


      {selectedInventoryNoteId && (
        <InventoryHistoryModal
          noteId={selectedInventoryNoteId}
          storeId={storeId}
          onClose={() => setSelectedInventoryNoteId(null)}
        />
      )}
    </div>
  );
};

export default BusinessDashboard;
