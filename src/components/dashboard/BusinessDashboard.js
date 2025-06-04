import React, { useEffect, useState } from "react";
import DevicesActive from "./widgets/DevicesActive";
import OrdersToday from "./widgets/OrdersToday";
import RevenueByHour from "./widgets/RevenueByHour";
import OrderStatusByHour from "./widgets/OrderStatusByHour";
import RevenueSummary from "./widgets/RevenueSummary";
import PendingRequests from "./widgets/PendingRequests";
import SalesByDay from "../SalesByDay";
import ReportDateTimePicker from "../ReportDateTimePicker";
import { getProducts } from "../../ServiceApi/apiAdmin";
import { getCategory } from "../../ServiceApi/apiCatetory";
import Select from "react-select";
import { DATE_PRESETS, getDateRange, toDateTimeLocal } from "../../const/DateRange";
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
import SortIcons from "../SortIcons";
import { downloadFile } from "../../ServiceApi/downloadFile";
const BusinessDashboard = ({ storeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
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
  const [sortField, setSortField] = useState(null);
  const [isDescending, setIsDescending] = useState(true);
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [deviceCount, setDeviceCount] = useState(0);
  const [statusSummary, setStatusSummary] = useState(null);
  const [devicePageNumber, setDevicePageNumber] = useState(1);
  const devicePageSize = 10;
  const [deviceTotalPages, setDeviceTotalPages] = useState(1);
  const [productSearch, setProductSearch] = useState({
    productCode: "",
    productName: "",
    categoryName: "",
  });

  const defaultTimeSpan = getDateRange(DATE_PRESETS.last_28_days);
  const [startAt, setStartAt] = useState(toDateTimeLocal(defaultTimeSpan.startAt));
  const [endAt, setEndAt] = useState(toDateTimeLocal(defaultTimeSpan.endAt));
  const [inventoryFilters, setInventoryFilters] = useState({
    staffName: "",
    type: "",
  });
  const [staffFilterOptions, setStaffFilterOptions] = useState([]);
  const [deviceSortField, setDeviceSortField] = useState(null);
  const [deviceIsDescending, setDeviceIsDescending] = useState(true);

  useEffect(() => {
    if (activeTab === "devices") {
      fetchDeviceReport();
    }
  }, [deviceSortField, deviceIsDescending, devicePageNumber, activeTab]);

  useEffect(() => {
    if (activeTab === "product") {
      fetchProductReport();
    }
  }, [activeTab, sortField, isDescending, productPageNumber]);
  useEffect(() => {
    if (!storeId) return;
    fetchData(true);
    fetchProductDropdown();
    fetchCategoryDropdown();
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [storeId]);
  const fetchInventoryStaffNames = async () => {
    try {
      const res = await getInventoryHistoryByStoreId({
        storeId,
        pageNumber: 1,
        pageSize: 1000, // đủ lớn để lấy hết
      });

      const uniqueNames = Array.from(
        new Set(
          (res.items || [])
            .map((item) => item.staff?.staffName)
            .filter((name) => !!name) // loại null/undefined
        )
      );

      setStaffFilterOptions(uniqueNames.map((name) => ({ label: name, value: name })));
    } catch (err) {
      console.error("❌ Failed to fetch inventory-based staff names:", err);
    }
  };
  useEffect(() => {
    if (activeTab === "sales") {
      fetchSalesData();
    }
  }, [activeTab]);
  
  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventoryHistory();
      fetchInventoryStaffNames();
    }
  }, [activeTab, inventoryPageNumber]);


  const fetchProductDropdown = async () => {
    try {
      const res = await getProducts({
        storeId,
        pageNumber: 1,
        pageSize: 1000,
        isSuspended: false,
      });
      setProductOptions(res.items || []);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const fetchCategoryDropdown = async () => {
    try {
      const res = await getCategory({
        pageNumber: 1,
        pageSize: 1000,
        isSuspended: false,
      });
      setCategoryOptions(res.items || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

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

  const fetchSalesData = async (start, end) => {
    try {
      const res = await getSalesReport({ storeId, dateFrom:start ?? startAt, dateTo:end ?? endAt });
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


  const onDateTimeChange = async (start, end, callback) => {
    typeof(callback) === "function" && await callback(start,end);
  }

  const onSelectChange = async (value, callback) => {
    let timespan = getDateRange(value);
    typeof(callback) === "function" && await callback(timespan.startAt, timespan.endAt);
  }
  const onSalesReportDateTimeChange = async (start, end) => {
    await fetchSalesData(start, end);
  };
  const onSalesReportSelectChange = async (value) => 
  { 
    await onSelectChange(value, fetchSalesData);
  };

  const onDeviceDateChange = async (start, end) => {
    await onDateTimeChange(start,end, fetchDeviceReport);
  }

  const onDeviceSelectChange = async (value) => {
    await onSelectChange(value, fetchDeviceReport)
  }

  const handleExportSales = async () => {
    try {
      const response = await exportSalesReport({
        storeId,
        dateFrom: startAt,
        dateTo: endAt,
      });
      let filename = `sales_report_${storeId}.xlsx`;
      downloadFile(response, filename);
    } catch (err) {
      console.error("Failed to export sales report", err);
    }
  };

  const handleExportGeneric = async (exportFunc, fileName, args) => {
    try {
      const response = await exportFunc(args);
      let file = `${fileName}_${storeId}_${Date.now()}.xlsx`;
      downloadFile(response, file);
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
        dateFrom: startAt,
        dateTo: endAt,
        storeId,
        productCode: productSearch.productCode,
        productName: productSearch.productName,
        categoryName: productSearch.categoryName,
      };
      if (sortField) {
        payload.sortBy = sortField;
        payload.isDescending = isDescending;
      }
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


  const fetchInventoryHistory = async (from, to) => {
    setInventoryLoading(true);
    try {
      const res = await getInventoryHistoryByStoreId({
        storeId,
        pageNumber: inventoryPageNumber,
        pageSize: inventoryPageSize,
        staffName: inventoryFilters.staffName,
        type: inventoryFilters.type,
        dateFrom: from ?? startAt,
        dateTo: to ?? endAt,
      });
      const formatted = res?.items.map((item) => ({
        staff: item.staff?.staffName || "system",
        type: item.type,
        date: new Date(item.createTime).toLocaleDateString("vi-VN"),
        action: (
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedInventoryNoteId(item.inventoryNoteId)}
          >
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


  const fetchDeviceReport = async (start, end) => {
    if (!storeId) return;
    setDeviceLoading(true);
    try {
      const params = {
        pageNumber: devicePageNumber,
        pageSize: devicePageSize,
        storeId,
        dateFrom: start ?? startAt,
        dateTo: end ?? endAt,
      };
      if (deviceSortField) {
        params.sortBy = deviceSortField;
        params.isDescending = deviceIsDescending;
      }

      const res = await getDeviceReport(params);

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
              onClick={() => handleExportGeneric(exportProductReport, "product_report",
                {storeId, dateFrom:startAt, dateTo:endAt})}
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
              { key: "avgCountPerOrder",
                label: (
                   <span>
                    Average Count/Order
                    <SortIcons
                      field="averageCountPerOrder"
                      currentField={sortField}
                      isDescending={isDescending}
                      onChange={(desc) => {
                        setSortField("averageCountPerOrder");
                        setIsDescending(desc);
                        setProductPageNumber(1);
                      }}
                      onClear={() => {
                        setSortField(null);
                        setIsDescending(true);
                        setProductPageNumber(1);
                      }}
                    />
                  </span>
                )},
              {
                key: "successOrderCount",
                label: (
                  <span>
                    Success Order Count
                    <SortIcons
                      field="successOrderCount"
                      currentField={sortField}
                      isDescending={isDescending}
                      onChange={(desc) => {
                        setSortField("successOrderCount");
                        setIsDescending(desc);
                        setProductPageNumber(1);
                      }}
                      onClear={() => {
                        setSortField(null);
                        setIsDescending(true);
                        setProductPageNumber(1);
                      }}
                    />
                  </span>
                ),
              },
              {
                key: "correctionOrderCount",
                label: (
                  <span>
                    Correction Order Count
                    <SortIcons
                      field="correctionOrderCount"
                      currentField={sortField}
                      isDescending={isDescending}
                      onChange={(desc) => {
                        setSortField("correctionOrderCount");
                        setIsDescending(desc);
                        setProductPageNumber(1);
                      }}
                      onClear={() => {
                        setSortField(null);
                        setIsDescending(true);
                        setProductPageNumber(1);
                      }}
                    />
                  </span>
                ),
              },
              {
                key: "totalRevenue",
                label: (
                  <span>
                    Total Revenue
                    <SortIcons
                      field="totalRevenue"
                      currentField={sortField}
                      isDescending={isDescending}
                      onChange={(desc) => {
                        setSortField("totalRevenue");
                        setIsDescending(desc);
                        setProductPageNumber(1);
                      }}
                      onClear={() => {
                        setSortField(null);
                        setIsDescending(true);
                        setProductPageNumber(1);
                      }}
                    />
                  </span>
                ),
              },
            ]}
            filters={[
              {
                label: "Product Code",
                value: productSearch.productCode,
                onChange: (e) => setProductSearch((prev) => ({ ...prev, productCode: e.target.value })),
              },
              {
                label: "Product Name",
                type: "custom",
                element: (
                  <Select
                    options={productOptions.map((p) => ({
                      label: p.productName,
                      value: p.productName,
                    }))}
                    placeholder="Select Product"
                    isClearable
                    value={
                      productSearch.productName
                        ? { label: productSearch.productName, value: productSearch.productName }
                        : null
                    }
                    onChange={(selected) =>
                      setProductSearch((prev) => ({
                        ...prev,
                        productName: selected?.value || "",
                      }))
                    }
                  />
                ),
              },
              {
                label: "Category Name",
                type: "custom",
                element: (
                  <Select
                    options={categoryOptions.map((c) => ({
                      label: c.categoryName,
                      value: c.categoryName,
                    }))}
                    placeholder="Select Category"
                    isClearable
                    value={
                      productSearch.categoryName
                        ? { label: productSearch.categoryName, value: productSearch.categoryName }
                        : null
                    }
                    onChange={(selected) =>
                      setProductSearch((prev) => ({
                        ...prev,
                        categoryName: selected?.value || "",
                      }))
                    }
                  />
                ),
              },
              {
                label:"Time From",
                type: "custom",
                element:(
                  <ReportDateTimePicker 
                    endAt={endAt}
                    startAt={startAt}
                    setEndAt={setEndAt}
                    setStartAt={setStartAt}
                    onDatePickerChange={() => {}}
                    onPresetChange={() => {}}
                  />
                )
              }
            ]}
            setFilters={(index, value) => {
              const keys = ["productCode", "productName", "categoryName"];
              setProductSearch((prev) => ({ ...prev, [keys[index]]: value }));
            }}
            handleSearch={() => {
              setProductPageNumber(1);
              fetchProductReport();
            }}
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
              onClick={() => handleExportGeneric(exportInventoryReport, "inventory_report",
                {storeId, dateFrom:startAt, dateTo:endAt})}
            >
              Export Inventory Report
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "1rem", alignItems: "flex-end" }}>
            <div style={{ minWidth: 200 }}>
              <Select
                options={staffFilterOptions}
                placeholder="Select Staff"
                isClearable
                value={
                  inventoryFilters.staffName
                    ? { label: inventoryFilters.staffName, value: inventoryFilters.staffName }
                    : null
                }
                onChange={(selected) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    staffName: selected?.value || "",
                  }))
                }
              />
            </div>

            <div style={{ minWidth: 200 }}>
              <Select
                options={[
                  { label: "Order Outbound", value: "ORDER_OUTBOUND" },
                  { label: "Order Correction", value: "ORDER_CORRECTION" },
                  { label: "Audit", value: "AUDIT" },
                  { label: "Stock Inbound", value: "STOCK_INBOUND" },
                  { label: "Stock Outbound", value: "STOCK_OUTBOUND" },
                ]}
                placeholder="Select Type"
                isClearable
                value={
                  inventoryFilters.type
                    ? {
                      label:
                        {
                          ORDER_OUTBOUND: "Order Outbound",
                          ORDER_CORRECTION: "Order Correction",
                          AUDIT: "Audit",
                          STOCK_INBOUND: "Stock Inbound",
                          STOCK_OUTBOUND: "Stock Outbound",
                        }[inventoryFilters.type],
                      value: inventoryFilters.type,
                    }
                    : null
                }
                onChange={(selected) =>
                  setInventoryFilters((prev) => ({
                    ...prev,
                    type: selected?.value || "",
                  }))
                }
              />
            </div>
            <ReportDateTimePicker 
              endAt={endAt}
              startAt={startAt}
              setEndAt={setEndAt}
              setStartAt={setStartAt}
              onDatePickerChange={() => {}}
              onPresetChange={() => {}}
            />
            <button
              className="btn btn-secondary"
              onClick={() => {
                setInventoryPageNumber(1);
                fetchInventoryHistory();
              }}
            >
              Search
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



      {
        activeTab === "sales" && (
          <>
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <button className="btn btn-primary" onClick={handleExportSales}>
                Export Sales Report
              </button>
            </div>
            <ReportDateTimePicker 
              endAt={endAt}
              setEndAt={setEndAt}
              setStartAt={setStartAt}
              startAt={startAt}
              onDatePickerChange={onSalesReportDateTimeChange}
              onPresetChange={onSalesReportSelectChange}
            />
            <SalesByDay data={salesData} totalRevenue={totalRevenue} average={average} />
          </>
        )
      }

      {
        activeTab === "devices" && (
          <>
            <div style={{ textAlign: "right", marginBottom: "10px" }}>
              <button
                className="btn btn-primary"
                onClick={() => handleExportGeneric(
                  exportDeviceReport, 
                  "device_report", 
                  { storeId, dateFrom: startAt, dateTo:endAt })}
              >
                Export Device Report
              </button>
            </div>
            <ReportDateTimePicker 
              endAt={endAt}
              startAt={startAt}
              setEndAt={setEndAt}
              setStartAt={setStartAt}
              onDatePickerChange={onDeviceDateChange}
              onPresetChange={onDeviceSelectChange}
            />
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
                {
                  key: "orderCount",
                  label: (
                    <span>
                      Order Count
                      <SortIcons
                        field="orderCount"
                        currentField={deviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceSortField("orderCount");
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceSortField(null);
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                },
                {
                  key: "successOrderCount",
                  label: (
                    <span>
                      Success
                      <SortIcons
                        field="successOrderCount"
                        currentField={deviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceSortField("successOrderCount");
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceSortField(null);
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                },
                {
                  key: "cancelledOrderCount",
                  label: (
                    <span>
                      Cancelled
                      <SortIcons
                        field="cancelledOrderCount"
                        currentField={deviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceSortField("cancelledOrderCount");
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceSortField(null);
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                },
                {
                  key: "correctionOrderCount",
                  label: (
                    <span>
                      Correction
                      <SortIcons
                        field="correctionOrderCount"
                        currentField={deviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceSortField("correctionOrderCount");
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceSortField(null);
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                },
                {
                  key: "editOrderCount",
                  label: (
                    <span>
                      Edit
                      <SortIcons
                        field="editOrderCount"
                        currentField={deviceSortField}
                        setCurrentField={setDeviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                },
                {
                  key: "totalRevenue",
                  label: (
                    <span>
                      Total Revenue
                      <SortIcons
                        field="totalRevenue"
                        currentField={deviceSortField}
                        isDescending={deviceIsDescending}
                        onChange={(desc) => {
                          setDeviceSortField("totalRevenue");
                          setDeviceIsDescending(desc);
                          setDevicePageNumber(1);
                        }}
                        onClear={() => {
                          setDeviceSortField(null);
                          setDeviceIsDescending(true);
                          setDevicePageNumber(1);
                        }}
                      />
                    </span>
                  ),
                }

              ]}
              loading={deviceLoading}
              showCheckboxes={false}
              currentPage={devicePageNumber}
              totalPages={deviceTotalPages}
              handlePrev={() => setDevicePageNumber((p) => Math.max(p - 1, 1))}
              handleNext={() => setDevicePageNumber((p) => Math.min(p + 1, deviceTotalPages))}
            />
          </>
        )
      }


      {
        selectedInventoryNoteId && (
          <InventoryHistoryModal
            noteId={selectedInventoryNoteId}
            storeId={storeId}
            onClose={() => setSelectedInventoryNoteId(null)}
          />
        )
      }
    </div >
  );
};

export default BusinessDashboard;
