import React, { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import "../Styles/GlobalStyles.css";
import "../Styles/Detail.css";

function GenericDetail({
  onBack,
  title = "Detail Page",
  notFound = false,
  notFoundMessage = "Item not found!",
  imageUrl = "",
  infoRows = [],
  productData = { columns: [], rows: [] },
  selectedItems = [],
  handleCheckAll,
  handleCheckOne,
  extraButtons = [],
  handlePrev,
  handleNext,
  currentPage,
  totalPages,
  itemKey = null,
  tabs = null,
  onTabChange = null, // 👈 ensure this prop is accepted
}) {
  const [activeTabKey, setActiveTabKey] = useState(tabs?.[0]?.key || null);

  const tableData = useMemo(() => {
    if (tabs && activeTabKey) {
      const currentTab = tabs.find((tab) => tab.key === activeTabKey);
      return currentTab?.data || { columns: [], rows: [] };
    }
    return productData;
  }, [tabs, activeTabKey, productData]);

  const isAllChecked = useMemo(() => {
    if (!itemKey) return false;
    return (
      tableData.rows.length > 0 &&
      tableData.rows.every((row) =>
        itemKey ? selectedItems.includes(row[itemKey]) : false
      )
    );
  }, [tableData.rows, selectedItems, itemKey]);

  if (notFound) {
    return (
      <div className="page-container">
        <div className="content">
          <h2>{notFoundMessage}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content">
        {/* Back button */}
        <div className="top-bar" style={{ marginBottom: "1rem" }}>
          <Button onClick={onBack} variant="light" className="back-button">
            Back
          </Button>
        </div>

        {/* Info & Tabs */}
        <div className="detail-content-wrapper">
          <h1 className="page-title">{title}</h1>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <div className="detail-image-box"  style={{ width: "300px", height: "250px" }}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Detail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {infoRows.map((item, idx) => (
                <p key={idx}>
                  <strong>{item.label}:</strong> {item.value}
                </p>
              ))}
            </div>
          </div>

          {tabs?.length > 0 && (
            <div className="tab-group">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTabKey(tab.key);
                    if (typeof onTabChange === "function") {
                      onTabChange(tab.key); // 👈 This triggers parent pagination logic
                    }
                  }}
                  className={`tab-button ${activeTabKey === tab.key ? "active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Extra buttons */}
        {extraButtons.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            {extraButtons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.variant}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={btn.className}
                style={{ marginLeft: "0.5rem" }}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="table-wrapper">
          {tableData.columns.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  {itemKey !== null && (
                    <th>
                      <input
                        type="checkbox"
                        onChange={handleCheckAll}
                        checked={isAllChecked}
                        aria-label="Select All"
                      />
                    </th>
                  )}
                  {tableData.columns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableData.columns.length + (itemKey !== null ? 1 : 0)}
                      style={{ textAlign: "center" }}
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  tableData.rows.map((row, rowIndex) => {
                    const id = itemKey ? row[itemKey] : rowIndex;
                    const cells = Array.isArray(row) ? row : Object.values(row);
                    return (
                      <tr key={id}>
                        {itemKey !== null && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(id)}
                              onChange={() => handleCheckOne(id)}
                              aria-label={`Select row ${rowIndex}`}
                            />
                          </td>
                        )}
                        {cells.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            {typeof cell === "object" && cell?.onClick ? (
                              <Button
                                variant={cell.variant || "primary"}
                                size={cell.size || "sm"}
                                className={cell.className || ""}
                                onClick={cell.onClick}
                              >
                                {cell.label || "Action"}
                              </Button>
                            ) : (
                              cell
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {typeof currentPage === "number" && typeof totalPages === "number" && (
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
      </div>
    </div>
  );
}

export default GenericDetail;
