import React from "react";
import Button from "react-bootstrap/Button";
import SalesChart from "./SalesByDay";
import SalesByProductChart from "./SalesByProductChart";
import OrderStatusChart from "./OrderStatusChart"; // Import chart Order Status

const GenericReport = ({
  title = "Report",
  tabs = [],
  activeTab,
  organizeControl = null,
  extraButtons = [],
  actions = [],
  idType = ["id"],
  selectedItems = [],
  currentPage = 1,
  totalPages = 1,
  handlePrev,
  handleNext,
  onTabChange,
}) => {
  // Lấy tab hiện tại dựa trên activeTab từ prop
  const currentTab = tabs.find((t) => t.key === activeTab) || {};
  const currentData = currentTab.data || [];
  const currentColumns = currentTab.columns || [];

  const renderContent = () => {
    if (currentTab.type === "chart") {
      return (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "1200px" }}>
            <SalesChart data={currentData} />
          </div>
        </div>
      );
    }
    if (currentTab.type === "productChart") {
      return (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: "1200px" }}>
            <SalesByProductChart data={currentData} />
          </div>
        </div>
      );
    }
    if (currentTab.type === "orderStatusChart") {
      // Render component OrderStatusChart cho tab Order Status
      return <OrderStatusChart />;
    }
    // Fallback: render bảng dữ liệu
    return (
      <table className="data-table">
        <thead>
          <tr>
            {currentColumns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td colSpan={currentColumns.length} style={{ textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            currentData.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {currentColumns.map((col, colIdx) => (
                  <td key={colIdx}>{item[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="data-table-container">
      {/* Title + Buttons */}
      <div className="top-bar">
        <h1 className="page-title">{title}</h1>
        <div className="button-group">
          {extraButtons.map((btn, index) => (
            <Button
              key={index}
              variant={btn.variant}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={btn.className}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="tab-group" style={{ marginBottom: "1rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => {
                onTabChange?.(tab.key);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Organize Control (Filter section) */}
      {organizeControl && <div style={{ marginBottom: "1rem" }}>{organizeControl}</div>}

      {/* Main content */}
      {renderContent()}

      {/* Pagination (chỉ hiển thị nếu không phải chart type) */}
      {currentTab.type !== "chart" &&
        currentTab.type !== "productChart" &&
        currentTab.type !== "orderStatusChart" && (
          <div className="pagination">
            <div className="pagination-left">
              <Button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </Button>
              <Button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
            <div className="pagination-right">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
    </div>
  );
};

export default GenericReport;
