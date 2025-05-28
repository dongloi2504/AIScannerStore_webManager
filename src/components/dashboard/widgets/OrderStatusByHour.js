
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const OrderStatusByHour = ({ data }) => {
  const chartData = data.map((item) => ({
    hour: `${item.exactHour}:00`,
    total: item.orderCount,
    cancelled: item.cancelledOrderCount,
    edited: item.editedOrderCount,
    correction: item.correctionOrderCount,
  }));

  return (
    <div className="dashboard-widget">
      <h3>Order Status</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#00bcd4" // xanh dương
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              stroke="#f44336" // đỏ
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="correction"
              stroke="#fdd835" // vàng
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="edited"
              stroke="#3f51b5" // xanh đậm
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OrderStatusByHour;
