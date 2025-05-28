import React from "react";

const PendingRequests = ({ count = 0 }) => {
  return (
    <div className="dashboard-widget">
      <h3>Pending Requests</h3>
      <div
        className="pending-container"
        style={{ justifyContent: "center" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <img
            src="/report_icon.png"
            alt="Pending"
            style={{
              width: "20rem",
              height: "20rem",
              objectFit: "contain",
              filter: "grayscale(1) brightness(0.3)", // xám đậm nhẹ
            }}
          />
            <span
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "black",
                lineHeight: 1,
                 marginLeft: "-7rem",
              }}
            >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;
