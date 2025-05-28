import React from "react";

const RevenueSummary = ({ daily, weekly, monthly }) => {
  return (
    <div className="dashboard-widget">
      <h3>Revenue Summary</h3>
      <div className="revenue-row">
        <span>Today</span>
        <strong>{daily.toLocaleString()}₫</strong>
      </div>
      <div className="divider" />
      <div className="revenue-row">
        <span>This Week</span>
        <strong>{weekly.toLocaleString()}₫</strong>
      </div>
      <div className="divider" />
      <div className="revenue-row">
        <span>This Month</span>
        <strong>{monthly.toLocaleString()}₫</strong>
      </div>
    </div>
  );
};

export default RevenueSummary;
