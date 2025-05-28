import React from "react";

const OrdersToday = ({ count = 0 }) => {
  return (
    <div className="dashboard-widget">
      <h3>Orders Today</h3>
      <div
        className="pending-container"
        style={{
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <img
            src="/order.png"
            alt="Orders"
            style={{ width: "5.5rem", height: "5.5rem", objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "black",
              lineHeight: 1,
            }}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrdersToday;
