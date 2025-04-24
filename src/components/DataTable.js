import React, { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { Role } from "../const/Role";
import { CanAccess } from "./CanAccess";

const DataTable = ({
  title,
  data = [],
  columns = [],
  selectedItems = [],
  handleCheckAll,
  handleCheckOne,
  handleSearch,
  filters = [],
  setFilters,
  handlePrev,
  handleNext,
  currentPage,
  totalPages,
  actions = [],
  extraButtons = [],
  idType = ["staffId", "storeId", "productId", "categoryId", "orderId"],
  tabs = null,
  onTabChange = null,
}) => {
  const [activeTabKey, setActiveTabKey] = useState(tabs?.[0]?.key || null);

  const currentData = useMemo(() => {
    if (tabs && activeTabKey) {
      const currentTab = tabs.find((tab) => tab.key === activeTabKey);
      return currentTab?.data || [];
    }
    return data;
  }, [tabs, activeTabKey, data]);

  const currentColumns = useMemo(() => {
    if (tabs && activeTabKey) {
      const currentTab = tabs.find((tab) => tab.key === activeTabKey);
      return currentTab?.columns || [];
    }
    return columns;
  }, [tabs, activeTabKey, columns]);

  const isAllChecked = useMemo(
    () =>
      currentData.length > 0 &&
      currentData.every((item) =>
        idType.some((id) => selectedItems.includes(item[id]))
      ),
    [currentData, selectedItems]
  );

  return (
    <div className="data-table-container">
      {/* Header */}
      <div className="top-bar">
        <h1 className="page-title">{title}</h1>
        <div className="button-group">
          {extraButtons.map((btn, index) => (
            <CanAccess roles={btn?.roles ?? [Role.ALL]} key={index}>
              <Button
                variant={btn.variant}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={btn.className}
              >
                {btn.label}
              </Button>
            </CanAccess>
          ))}
        </div>
      </div>

      {/* Tabs */}
      {tabs?.length > 0 && (
        <div className="tab-group" style={{ marginBottom: "1rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTabKey(tab.key);
                onTabChange?.(tab.key);
              }}
              className={`tab-button ${activeTabKey === tab.key ? "active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Filters */}
      <div className="search-container">
        {filters.map((filter, index) => (
          <div key={index} className="filter-item">
            {filter.hasLabel && (
              <label htmlFor={`filter-${index}`} className="form-label">
                {filter.label}
              </label>
            )}
            {filter.type === "custom" && filter.element ? (
              filter.element
            ) : (
              <input
                type={filter.type ?? "text"}
                placeholder={`Enter ${filter.label}`}
                value={filter.value}
                onChange={(e) =>
                  setFilters(index, filter.type === "checkbox" ? e.target.checked : e.target.value)
                }
              />
            )}
          </div>
        ))}
        <Button className="search-btn" variant="secondary" onClick={handleSearch}>
          {filters.length > 0 ? "Search" : "Reload"}
        </Button>
      </div>

	  <div class="scroll-wrapper">
      {/* Data Table */}
      <table className="data-table">
        <thead>
          <tr>
            {extraButtons.length !== 0 && (
              <th>
                <input
                  type="checkbox"
                  onChange={handleCheckAll}
                  checked={isAllChecked}
                  aria-label="Select All"
                />
              </th>
            )}
            {currentColumns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
            {actions.length !== 0 && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length === 0 ? (
            <tr>
              <td
                colSpan={
                  currentColumns.length +
                  (extraButtons.length !== 0 ? 1 : 0) +
                  (actions.length !== 0 ? 1 : 0)
                }
                style={{ textAlign: "center" }}
              >
                No data available
              </td>
            </tr>
          ) : (
            currentData.map((item, idx) => (
              <tr key={idx}>
                {extraButtons.length !== 0 && (
                  <td>
                    <input
                      type="checkbox"
                      checked={idType.some((id) => selectedItems.includes(item[id]))}
                      onChange={() =>
                        handleCheckOne(
                          idType.find((id) => item[id] !== undefined && item[id] !== null) &&
                            (item[idType[0]] ||
                              item[idType[1]] ||
                              item[idType[2]] ||
                              item[idType[3]] ||
                              item[idType[4]])
                        )
                      }
                    />
                  </td>
                )}
                {currentColumns.map((col, colIdx) => (
                  <td key={colIdx}>{item[col.key]}</td>
                ))}
				{actions.length != 0 ?
                <td>
                  {actions.map((action, actionIdx) => (
				    <CanAccess roles={action?.roles ?? [Role.ALL]}>
                    <Button
                      key={actionIdx}
                      className={`action-btn ${action.className}`}
                      variant={action.variant}
                      onClick={() => action.onClick(item)}
					  disabled={typeof action.disabled === 'function' ? action.disabled(item) : !!action.disabled}
                    >
                      {action.label}
                    </Button>
					</CanAccess>
                  ))}
                </td> : ""}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
      {/* Pagination */}
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
    </div>
  );
};

export default DataTable;
