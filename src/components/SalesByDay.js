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
import ReportDateTimePicker from "./ReportDateTimePicker";

const SalesByDay = ({ data, totalRevenue, average }) => {
  // Dữ liệu giả định đã được xử lý định dạng (ví dụ: date đã là "dd/MM/yyyy")
  return (
    <div>
      {/* Biểu đồ doanh thu */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 30  , bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              label={{
                value: "Date",
                position: "insideBottomRight",
                offset: -5,
              }}
            />
            <YAxis
              // Bạn có thể điều chỉnh domain và tickFormatter nếu cần
              label={{
                value: "VNĐ",
                angle: -90,
                position: "insideLeft",
                offset: -23,
              }}
            />
            <Tooltip
              formatter={(val) =>
                Number(val).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })
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
      {/* Hiển thị Total Revenue và Average bên dưới biểu đồ */}
      <div className="dashboard-widget">
      <h3>Revenue Summary</h3>
      <div className="revenue-row">
        <span>Total Revenue</span>
        <strong>{totalRevenue.toLocaleString()}₫</strong>
      </div>
      <div className="divider" />
      <div className="revenue-row">
        <span>Average Revenue per Day</span>
        <strong>{average.toLocaleString()}₫</strong>
      </div>
    </div>
    </div>
  );
};

export default SalesByDay;
