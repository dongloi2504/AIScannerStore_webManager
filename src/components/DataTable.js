import React, { useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import { Role } from "../const/Role";
import { CanAccess } from "./CanAccess";
import { Spinner } from "react-bootstrap";
import "../Styles/DataTable.css"; // ✅ Thêm nếu bạn tách CSS riêng

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
  loading = false,
  showCheckboxes = true,
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

  const colCount = useMemo(() => {
    return currentColumns?.length +
      (typeof actions === "function" || actions.length !== 0 ? 1 : 0) +
      (showCheckboxes ? 1 : 0);
  }, [currentColumns, actions, showCheckboxes]);

  return (
    <div className="data-table-container">
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
                checked={filter.type === "checkbox" ? filter.value : undefined}
                value={filter.type === "checkbox" ? undefined : filter.value}
                onChange={(e) =>
                  filter.onChange
                    ? filter.onChange(e)
                    : setFilters(index, filter.type === "checkbox" ? e.target.checked : e.target.value)
                }
              />
            )}
          </div>
        ))}
        {filters.length > 0 && (
          <Button className="search-btn" variant="secondary" onClick={handleSearch}>
            Search
          </Button>
        )}
      </div>

      <div className="scroll-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {showCheckboxes && (
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
              {(typeof actions === "function" || actions.length !== 0) && (
                <th className="datatable-action-col">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colCount}>
                  <div className="justify-content-center align-items-center">
                    <Spinner animation="border" role="status" style={{ width: "1.5rem", height: "1.5rem" }} />
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={colCount} style={{ textAlign: "center" }}>
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => {
                const rowActions = typeof actions === "function" ? actions(item) : actions;
                return (
                  <tr key={idx}>
                    {showCheckboxes && (
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
                    {rowActions?.length ? (
                      <td className="datatable-action-col">
                        {rowActions.map((action, actionIdx) => (
                          <CanAccess roles={action?.roles ?? [Role.ALL]} key={actionIdx}>
                            <Button
                              className={`action-btn ${action.className}`}
                              variant={action.variant}
                              onClick={() => action.onClick(item)}
                              disabled={
                                typeof action.disabled === "function"
                                  ? action.disabled(item)
                                  : !!action.disabled
                              }
                            >
                              {action.label}
                            </Button>
                          </CanAccess>
                        ))}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
