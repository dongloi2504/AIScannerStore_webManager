import React from "react";


const SortIcons = ({ field, currentField, isDescending, onChange, onClear }) => {
    const isActive = currentField === field;

    const handleToggle = () => {
        if (!isActive) {
            onChange(false); // tăng dần
        } else if (!isDescending) {
            onChange(true); // giảm dần
        } else {
            // 🛡 Kiểm tra tồn tại rồi mới gọi
            if (typeof onClear === "function") {
                onClear(); // tắt sort
            }
        }
    };


    return (
        <span
            onClick={handleToggle}
            title="Click to toggle sort"
            style={{ marginLeft: 6, cursor: "pointer", fontSize: "0.8em", userSelect: "none" }}
        >
            <span
                style={{
                    color: isActive && !isDescending ? "#007bff" : "#ccc",
                }}
            >
                ▼
            </span>
            <span
                style={{
                    marginLeft: 4,
                    color: isActive && isDescending ? "#007bff" : "#ccc",
                }}
            >
                ▲
            </span>
        </span>
    );
};

export default SortIcons;
