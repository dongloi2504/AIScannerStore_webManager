import React, { useEffect, useState } from "react";
import DevicesActive from "./widgets/DevicesActive";
import OrdersToday from "./widgets/OrdersToday";
import RevenueByHour from "./widgets/RevenueByHour";
import OrderStatusByHour from "./widgets/OrderStatusByHour"; // ✅ Dùng thật
import RevenueSummary from "./widgets/RevenueSummary";
import PendingRequests from "./widgets/PendingRequests";
import { getStoreDashboardReport } from "../../ServiceApi/apiReport";

const BusinessDashboard = ({ storeId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) {
      console.warn("storeId is not available, skipping API call");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await getStoreDashboardReport(storeId);
        console.log("API full response:", res);

        if (res && typeof res === "object" && Object.keys(res).length > 0) {
          setData({ ...res });
        } else {
          console.warn("No data found in API response.");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No dashboard data available.</div>;

  return (
    <div className="dashboard-layout">
      <div className="row">
        <DevicesActive count={data.deviceCount} />
        <OrdersToday count={data.orderCount} />
      </div>
      <div className="row">
        <RevenueByHour data={data.hours || []} />
        <OrderStatusByHour data={data.hours || []} /> {/* ✅ chính thức */}
      </div>
      <div className="row">
        <RevenueSummary
          daily={data.dailyRevenue}
          weekly={data.weeklyRevenue}
          monthly={data.monthlyRevenue}
        />
        <PendingRequests count={data.pendingRequestCount} />
      </div>
    </div>
  );
};

export default BusinessDashboard;
