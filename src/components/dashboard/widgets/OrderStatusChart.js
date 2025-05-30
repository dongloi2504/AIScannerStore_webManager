import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusChart = ({ data }) => {
  console.log("OrderStatusChart data:", data); 

  const labels = data.map((item) => item.name);
  const values = data.map((item) => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Order Status",
        data: values,
        backgroundColor: ["#4caf50", "#2196f3", "#ffeb3b", "#f44336"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${(context.parsed * 100).toFixed(2)}%`,
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default OrderStatusChart;
