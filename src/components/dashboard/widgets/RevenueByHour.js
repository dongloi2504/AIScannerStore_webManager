import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const RevenueByHour = ({ data }) => {
  const chartData = data.map((h) => ({
    hour: `${h.exactHour}:00`,
    revenue: h.revenue,
  }));

  return (
    <div className="dashboard-widget">
      <h3>Revenue by Hour</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }} // 👈 Thêm margin cho đẹp
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis
              tickFormatter={(v) => (v === 0 ? "" : v.toLocaleString("vi-VN"))}
              domain={[0, "dataMax + 500000"]} // 👈 Tạo khoảng thở bên trên
              padding={{ top: 20 }}
            />
            <Tooltip
              formatter={(value) =>
                `${value.toLocaleString("vi-VN")} ₫`
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueByHour;
