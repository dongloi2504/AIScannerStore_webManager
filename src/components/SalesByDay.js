import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const SalesChart = ({ data }) => {
  const processed = data.map((item) => ({
    date: item.date,
    revenue: Number(item.revenue),
  }));

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <LineChart data={processed}   margin={{ top: 20, right: 30, left: 20, bottom: 50 }} >
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Trục X: thời gian */}
          <XAxis 
            dataKey="date"
            label={{
              value: "Ngày",
              position: "insideBottomRight",
              offset: -5,
            }}
          />
          
          {/* Trục Y: VNĐ */}
          <YAxis
            domain={[0, "auto"]}
            width={100}
            tickFormatter={(v) =>
              v === 0 ? "" : v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
            }
            label={{
              value: "VNĐ",
              angle: -90,
              position: "insideLeft",
              offset: 10,
            }}
          />

          <Tooltip
            formatter={(val) =>
              `${Number(val).toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}`
            }
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#4e6ef2"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
