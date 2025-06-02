import React from "react";

const DevicesActive = ({ count = 0 }) => {
  return (
    <div className="dashboard-widget">
      <h3>Devices Active</h3>
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
            src="./pos.png"
            alt="Devices"
            style={{ width: "7rem", height: "7rem", objectFit: "contain" }}
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

export default DevicesActive;
