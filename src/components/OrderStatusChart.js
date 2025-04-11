import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { getOrderStatus } from "../ServiceApi/apiAdmin";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const OrderStatusChart = () => {
  const [data, setData] = useState([]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    fetchOrderStatusData();
  }, []);

  const fetchOrderStatusData = async () => {
    try {
      const res = await getOrderStatus();
      const orderByDays = res?.data?.orderByDays || res?.orderByDays || [];

      const processedData = orderByDays.map((dayItem) => {
        const formattedDate = format(new Date(dayItem.date), "dd/MM/yyyy");
        let cancelledCount = 0;
        let finishedCount = 0;

        dayItem.orders.forEach((order) => {
          if (order.orderType === "CANCELLED") {
            cancelledCount = order.count;
          } else if (order.orderType === "FINISHED") {
            finishedCount = order.count;
          }
        });

        return {
          date: formattedDate,
          CANCELLED: cancelledCount,
          FINISHED: finishedCount,
        };
      });

      setData(processedData);

      // Delay rendering to allow animation to kick in
      setTimeout(() => {
        setShowChart(true);
      }, 500); // Delay 500ms
    } catch (error) {
      console.error("Error fetching order status data:", error);
    }
  };

  return (
    <div style={{ width: "100%", height: 400 }}>
      {/* Chỉ render khi đã delay xong */}
      {showChart && (
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 30, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#ccc" />
            <XAxis
              dataKey="date"
              angle={-25}
              textAnchor="end"
              interval={0}
              height={70}
              label={{ value: "Ngày", position: "insideBottom", offset: -40 }}
            />
            <YAxis
              allowDecimals={false}
              label={{
                value: "Số lượng đơn",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />

            <Line
              type="monotone"
              dataKey="CANCELLED"
              stroke="#f44336"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="FINISHED"
              stroke="#4caf50"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
              isAnimationActive={true}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OrderStatusChart;
