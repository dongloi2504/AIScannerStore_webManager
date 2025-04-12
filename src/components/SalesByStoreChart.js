import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const SalesByStoreChart = ({ data, totalRevenue, average }) => {
  // Xử lý dữ liệu đầu vào: lấy storeName từ đối tượng store
  const processed = data.map((item) => ({
    storeName: item.storeName, // Đã được mapping từ API ở Report
    revenue: Number(item.revenue),
  }));

  return (
    <div>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processed}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            
            {/* Trục X */}
            <XAxis
              dataKey="storeName"
              angle={-25}
              textAnchor="end"
              // Tùy chỉnh label trục X
              label={{
                value: "Store",
                // "insideBottomRight" sẽ đẩy chữ vào bên trong trục, góc phải.
                position: "insideBottomRight", 
                // offset âm để kéo nhãn lên một chút
                offset: -5, 
                // Có thể thay đổi style bên trong, ví dụ: fill, fontSize, ...
              }}
            />

            {/* Trục Y */}
            <YAxis
              // Tùy chỉnh label trục Y
              label={{
                value: "VNĐ",
                angle: -90,
                position: "insideLeft",
                // Tăng offset để đẩy label ra xa trục hơn (sang trái hơn)
                offset: -12,
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
            <Legend />
            <Bar dataKey="revenue" fill="#82ca9d" name="Doanh thu" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Hiển thị Total Revenue và Average bên dưới biểu đồ */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <div>
          <strong>Total Revenue: </strong>
          <span>
            {Number(totalRevenue).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
        <div>
          <strong>Average: </strong>
          <span>
            {Number(average).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalesByStoreChart;
