import React, { useMemo } from "react";
import Button from "react-bootstrap/Button";

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
}) => {
  const isAllChecked = useMemo(
    () => data.length > 0 && data.every((item) => selectedItems.includes(item.storeId)),
    [data, selectedItems]
  );

  return (
    <div className="data-table-container">
      {/* Header with Title and Buttons */}
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

      {/* Search Bar */}
      <div className="search-container">
        {filters.map((filter, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Enter ${filter.label}`}
            value={filter.value}
            onChange={(e) => setFilters(index, e.target.value)}
          />
        ))}
        <Button className="search-btn" variant="secondary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Data Table */}
      <table className="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleCheckAll}
                checked={isAllChecked}
                aria-label="Select All"
              />
            </th>
            {columns.map((col, idx) => (
              <th key={idx}>{col.label}</th>
            ))}
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} style={{ textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.storeId)}
                    onChange={() => handleCheckOne(item.storeId)}
                    aria-label={`Select ${item.storeId}`}
                  />
                </td>
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>{item[col.key]}</td>
                ))}
                <td>
                  {actions.map((action, actionIdx) => (
                    <Button
                      key={actionIdx}
                      className={`action-btn ${action.className}`}
                      variant={action.variant}
                      onClick={() => action.onClick(item)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
