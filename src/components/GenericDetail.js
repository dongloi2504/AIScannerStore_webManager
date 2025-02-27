import React, { useMemo } from "react";
import Button from "react-bootstrap/Button";
import "../Styles/GlobalStyles.css";

/**
 * Component chi tiết (GenericDetail) với:
 * - Nút Back trên cùng
 * - Thông tin sản phẩm (ảnh + infoRows)
 * - extraButtons phía dưới thông tin, căn góc phải
 * - Bảng có checkbox và phân trang
 */
function GenericDetail({
    onBack,
    title = "Detail Page",
    notFound = false,
    notFoundMessage = "Item not found!",
    imageUrl = "",
    infoRows = [],
    tableData = { columns: [], rows: [] },
    marginLeft = "5rem",
    selectedItems = [],
    handleCheckAll,
    handleCheckOne,
    extraButtons = [],
    handlePrev,
    handleNext,
    currentPage,
    totalPages,
}) {
    // Tính xem đã chọn hết các hàng hay chưa
    const isAllChecked = useMemo(
        () =>
            tableData.rows.length > 0 &&
            tableData.rows.every((_, index) => selectedItems.includes(index)),
        [tableData.rows, selectedItems]
    );

    // Nếu không tìm thấy dữ liệu
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
                {/* Nút Back */}
                <div className="top-bar" style={{ marginBottom: "1rem" }}>
                    <Button
                        onClick={onBack}
                        style={{
                            border: "2px solid black",
                            borderRadius: "9999px",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                        }}
                        variant="light"
                    >
                        Back
                    </Button>
                </div>

                {/* Khu vực chứa toàn bộ thông tin, có marginLeft */}
                <div style={{ marginLeft }}>
                    {/* Tiêu đề */}
                    <h1 className="page-title" style={{ marginLeft: 0 }}>
                        {title}
                    </h1>

                    {/* Ảnh + Thông tin */}
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <div
                            style={{
                                border: "2px solid black",
                                width: "16rem",
                                height: "10rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Detail"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : null}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {infoRows.map((item, idx) => (
                                <p key={idx}>
                                    <strong>{item.label}:</strong> {item.value}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="table-wrapper">
                    {/* Nhóm extraButtons, căn về góc phải */}
                    {extraButtons.length > 0 && (
                        <div
                            style={{
                                marginTop: "1rem",
                                display: "flex",
                                justifyContent: "flex-end", // đẩy nhóm nút sang phải
                            }}
                        >
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

                    {/* Bảng dữ liệu (nếu có) */}
                    {tableData.columns.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>
                                            {/* Checkbox chọn tất cả */}
                                            <input
                                                type="checkbox"
                                                onChange={handleCheckAll}
                                                checked={isAllChecked}
                                                aria-label="Select All"
                                            />
                                        </th>
                                        {tableData.columns.map((col, i) => (
                                            <th key={i}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={tableData.columns.length + 1} style={{ textAlign: "center" }}>
                                                No data available
                                            </td>
                                        </tr>
                                    ) : (
                                        tableData.rows.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(rowIndex)}
                                                        onChange={() => handleCheckOne(rowIndex)}
                                                        aria-label={`Select row ${rowIndex}`}
                                                    />
                                                </td>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex}>{cell}</td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}


                    {/* Phân trang */}
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
