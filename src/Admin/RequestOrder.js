import React, { useEffect, useState } from "react";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import OrderDetailPopup from "../components/OrderDetailPopup";
import { useAuth } from "../Authen/AuthContext";
import { getEditRequestsByStore, rejectEditRequest } from "../ServiceApi/apiManager";
import "../Styles/GlobalStyles.css";
import "../Styles/DataTableOverride.css";

function RequestOrder() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { user } = useAuth();
  const pageSize = 8;

  const [filters, setFilters] = useState({
    orderCode: "",
    customer: "",
    description: "",
    isRejected: false,
  });

  useEffect(() => {
    if (user?.storeId) {
      fetchRequests();
    }
  }, [currentPage, filters.isRejected]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getEditRequestsByStore({
        storeId: user.storeId,
        pageNumber: currentPage,
        pageSize,
      });

      const all = res?.items ?? [];

      const filtered = all.filter((item) => {
        const match =
          item.order?.orderCode?.toLowerCase().includes(filters.orderCode.toLowerCase()) &&
          item.customer?.name?.toLowerCase().includes(filters.customer.toLowerCase()) &&
          item.requestContent?.toLowerCase().includes(filters.description.toLowerCase());

        return filters.isRejected
          ? item.status === "REJECTED" && match
          : item.status !== "REJECTED" && match;
      });

      const formatted = filtered.map((item) => ({
        id: item.requestId,
        orderCode: item.order?.orderCode ?? "-",
        customerName: item.customer?.name ?? "-",
        requestContent: item.requestContent ?? "-",
        status: item.status ?? "-",
        orderId: item.order?.orderId, // 👈 Needed for popup
      }));

      setRequests(formatted);
      setTotalPages(Math.ceil((res?.totalItem || 1) / pageSize));
    } catch (error) {
      console.error("❌ Failed to fetch request orders:", error);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests();
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Request Orders"
          data={requests}
          columns={[
            { key: "orderCode", label: "Order Code" },
            { key: "customerName", label: "Customer" },
            { key: "requestContent", label: "Description" },
            { key: "status", label: "Status" },
          ]}
          filters={[
            { label: "Order Code", value: filters.orderCode },
            { label: "Customer", value: filters.customer },
            { label: "Description", value: filters.description },
            {
              label: "Only Rejected",
              type: "checkbox",
              value: filters.isRejected,
              hasLabel: true,
              onChange: (e) =>
                setFilters((prev) => ({
                  ...prev,
                  isRejected: e.target.checked,
                })),
            },
          ]}
          setFilters={(index, value) => {
            const keys = ["orderCode", "customer", "description"];
            setFilters((prev) => ({ ...prev, [keys[index]]: value }));
          }}
          handleSearch={handleSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          actions={(item) => {
            const isRejected = item.status === "REJECTED";
            const base = [
              {
                label: "View",
                className: "detail",
                onClick: () => {
                  if (item.orderId) {
                    setSelectedOrderId(item.orderId);
                    setShowPopup(true);
                  } else {
                    alert("Không tìm thấy Order ID cho yêu cầu này.");
                  }
                },
              },
            ];
            if (isRejected) return base;

            return [
              ...base,
              {
                label: "Approve",
                variant: "success",
                onClick: () => alert(`✅ Approved request ${item.orderCode}`),
              },
              {
                label: "Reject",
                variant: "danger",
                onClick: async () => {
                  const confirmed = window.confirm(`Reject request ${item.orderCode}?`);
                  if (!confirmed) return;

                  try {
                    await rejectEditRequest({
                      requestId: item.id,
                      replierId: user?.staffId,
                      replyContent:
                        "Xin lỗi quý khách, chúng tôi đã kiểm tra và không có gì bất thường. Mong quý khách cung cấp đầy đủ thông tin hơn.",
                    });

                    alert(`❌ Rejected request ${item.orderCode}`);
                    fetchRequests();
                  } catch (error) {
                    console.error("❌ Rejection failed:", error);
                    alert("Đã xảy ra lỗi khi từ chối yêu cầu.");
                  }
                },
              },
            ];
          }}
          loading={loading}
        />

        <OrderDetailPopup
          orderId={selectedOrderId}
          show={showPopup}
          onClose={() => setShowPopup(false)}
        />
      </div>
    </div>
  );
}

export default RequestOrder;
