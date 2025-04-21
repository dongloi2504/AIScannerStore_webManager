import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Line,
} from "recharts";

const SalesByProductChart = ({ data }) => {
  // Xử lý dữ liệu đầu vào: ép kiểu số
  const processed = data.map((item) => ({
    productName: item.productName,
    revenue: Number(item.revenue),
    quantity: Number(item.quantity),
  }));

  // Tính total revenue và average dựa trên doanh thu của các sản phẩm
  const totalRevenue = processed.reduce((sum, item) => sum + item.revenue, 0);
  const average =
    processed.length > 0 ? totalRevenue / processed.length : 0;

  return (
    <div>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={processed}
            margin={{ top: 10, right: 30, left: 50, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* Trục X: tên sản phẩm */}
            <XAxis
              dataKey="productName"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={80}
              label={{
                value: "Sản phẩm",
                position: "insideBottom",
                offset: -40,
              }}
            />

            {/* Trục Y trái: doanh thu (VND) */}
            <YAxis
              yAxisId="left"
              tickFormatter={(v) =>
                v.toLocaleString("vi-VN", { maximumFractionDigits: 0 })
              }
              label={{
                value: "VND",
                angle: -90,
                position: "insideLeft",
                offset: -14,
                style: { textAnchor: "middle" },
              }}
            />

            {/* Trục Y phải: số lượng */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => v.toLocaleString("vi-VN")}
              label={{
                angle: -90,
                position: "insideRight",
              }}
            />

            {/* Tooltip */}
            <Tooltip
              formatter={(val, name) =>
                name === "Doanh thu"
                  ? Number(val).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      minimumFractionDigits: 0,
                    })
                  : val.toLocaleString("vi-VN")
              }
            />

            {/* Chú giải */}
            <Legend />

            {/* Cột doanh thu */}
            <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Doanh thu" />

            {/* Đường cong số lượng */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="quantity"
              stroke="#2ca02c"
              strokeWidth={3}
              name="Số lượng"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Hiển thị Total Revenue và Average bên dưới biểu đồ */}
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <div>
          <strong>Total Revenue: </strong>
          <span>
            {totalRevenue.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
        <div>
          <strong>Average: </strong>
          <span>
            {average.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalesByProductChart;
