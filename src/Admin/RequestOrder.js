// ⚠️ File: RequestOrder.jsx (đã tích hợp DescriptionModal khi Reject)

import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import OrderDetailPopup from "../components/OrderDetailPopup";
import LiveOrderEditModal from "../components/LiveOrderEditModal";
import DescriptionModal from "../components/DescriptionModal"; 
import { useAuth } from "../Authen/AuthContext";
import {
  getEditRequestsByStore,
  rejectEditRequest,
} from "../ServiceApi/apiManager";
import { getSingleOrder } from "../ServiceApi/apiLiveOrder";
import { getProducts } from "../ServiceApi/apiAdmin";
import instance from "../ServiceApi/Customize-Axios";
import useNotificationSocket from "../hooks/useNotificationSocket";

import "../Styles/GlobalStyles.css";
import "../Styles/DataTableOverride.css";

function RequestOrder() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingItems, setEditingItems] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editingImages, setEditingImages] = useState([]);
  const [products, setProducts] = useState([]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectingOrderCode, setRejectingOrderCode] = useState("");

  const [filters, setFilters] = useState({
    orderCode: "",
    customer: "",
    description: "",
    isRejected: false,
    isAccepted: false,
  });

  const currentPageRef = useRef(currentPage);
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useNotificationSocket(user?.staffId, async (message) => {
    if (
      message.Type === "INFO_MSG" &&
      message.Message?.includes("requests editing order")
    ) {
      try {
        const res = await getEditRequestsByStore({
          storeId: user.storeId,
          pageNumber: currentPageRef.current,
          pageSize: 8,
        });

        const all = res?.items ?? [];
        const filtered = all.filter((item) => {
          const match =
            item.order?.orderCode?.toLowerCase().includes(filters.orderCode.toLowerCase()) &&
            item.customer?.name?.toLowerCase().includes(filters.customer.toLowerCase()) &&
            item.requestContent?.toLowerCase().includes(filters.description.toLowerCase());

          if (filters.isRejected) return item.status === "REJECTED" && match;
          if (filters.isAccepted) return item.status === "ACCEPTED" && match;
          return item.status !== "REJECTED" && item.status !== "ACCEPTED" && match;
        });

        const formatted = filtered.map((item) => ({
          id: item.requestId,
          orderCode: item.order?.orderCode ?? "-",
          customerName: item.customer?.name ?? "-",
          requestContent: item.requestContent ?? "-",
          status: item.status ?? "-",
          orderId: item.order?.orderId,
          images: [item.order?.image1, item.order?.image2, item.order?.image3].filter(Boolean),
        }));

        setRequests(formatted);
      } catch (error) {
        console.error("❌ Lỗi khi cập nhật bảng từ WebSocket:", error);
      }
    }
  });

  useEffect(() => {
    if (user?.storeId) {
      fetchRequests(currentPage);
    }
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 9999 });
      setProducts(res.items || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getEditRequestsByStore({
        storeId: user.storeId,
        pageNumber: page,
        pageSize: 8,
      });

      const all = res?.items ?? [];
      const filtered = all.filter((item) => {
        const match =
          item.order?.orderCode?.toLowerCase().includes(filters.orderCode.toLowerCase()) &&
          item.customer?.name?.toLowerCase().includes(filters.customer.toLowerCase()) &&
          item.requestContent?.toLowerCase().includes(filters.description.toLowerCase());

        if (filters.isRejected) return item.status === "REJECTED" && match;
        if (filters.isAccepted) return item.status === "ACCEPTED" && match;
        return item.status !== "REJECTED" && item.status !== "ACCEPTED" && match;
      });

      const formatted = filtered.map((item) => ({
        id: item.requestId,
        orderCode: item.order?.orderCode ?? "-",
        customerName: item.customer?.name ?? "-",
        requestContent: item.requestContent ?? "-",
        status: item.status ?? "-",
        orderId: item.order?.orderId,
        images: [item.order?.image1, item.order?.image2, item.order?.image3].filter(Boolean),
      }));

      setRequests(formatted);
      setTotalPages(Math.ceil((res?.totalItem || 1) / 8));
    } catch (error) {
      console.error("❌ Failed to fetch request orders:", error);
      setRequests([]);
    }
    setLoading(false);
  };

  const triggerApprove = async (item) => {
    try {
      const order = await getSingleOrder(item.orderId);
      const items = order.items.map((i) => ({ productId: i.productId, changeAmount: i.count }));
      setEditingItems(items);
      setEditingOrderId(item.orderId);
      setEditingRequestId(item.id);
      setEditingImages(item.images);
      setShowModal(true);
    } catch (error) {
      console.error("Error loading order for approval:", error);
    }
  };

  const handleApproveSubmit = async () => {
    try {
      await instance.post("/api/order/edit-request/accept", {
        requestId: editingRequestId,
        replierId: user.staffId,
        replyContent: "Đây là order được sửa lại của quý khách, cảm ơn ý kiến của quý khách.",
        orderCorrection: {
          fixedOrderId: editingOrderId,
          staffId: user.staffId,
          items: editingItems.map((i) => ({ productId: i.productId, count: i.changeAmount })),
        },
      });
      alert("✅ Request approved!");
      setShowModal(false);
      fetchRequests(currentPageRef.current);
    } catch (error) {
      console.error("❌ Approval failed:", error);
      alert("Đã xảy ra lỗi khi duyệt yêu cầu.");
    }
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
                setFilters((prev) => ({ ...prev, isRejected: e.target.checked, isAccepted: false })),
            },
            {
              label: "Only Accepted",
              type: "checkbox",
              value: filters.isAccepted,
              hasLabel: true,
              onChange: (e) =>
                setFilters((prev) => ({ ...prev, isAccepted: e.target.checked, isRejected: false })),
            },
          ]}
          setFilters={(index, value) => {
            const keys = ["orderCode", "customer", "description"];
            setFilters((prev) => ({ ...prev, [keys[index]]: value }));
          }}
          handleSearch={() => {
            setCurrentPage(1);
            fetchRequests(1);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          actions={(item) => {
            const isRejected = item.status === "REJECTED";
            const isAccepted = item.status === "ACCEPTED";

            const viewBtn = {
              label: "View",
              className: "detail",
              onClick: () => {
                if (item.orderId) {
                  setSelectedOrderId(item.orderId);
                  setShowPopup(true);
                } else {
                  alert("Không tìm thấy Order ID.");
                }
              },
            };

            if (isRejected || isAccepted) return [viewBtn];

            return [
              viewBtn,
              {
                label: "Approve",
                variant: "success",
                onClick: () => triggerApprove(item),
              },
              {
                label: "Reject",
                variant: "danger",
                onClick: () => {
                  setRejectingRequestId(item.id);
                  setRejectingOrderCode(item.orderCode);
                  setShowRejectModal(true);
                },
              },
            ];
          }}
          loading={loading}
        />

        <OrderDetailPopup orderId={selectedOrderId} show={showPopup} onClose={() => setShowPopup(false)} />

        {showModal && (
          <LiveOrderEditModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleApproveSubmit}
            productChanges={editingItems}
            setProductChanges={setEditingItems}
            products={products}
            loading={false}
            orderId={editingOrderId}
            image1={editingImages[0]}
            image2={editingImages[1]}
            image3={editingImages[2]}
          />
        )}

        <DescriptionModal
          show={showRejectModal}      // ✅ react-bootstrap dùng `show`
          onClose={() => {
            setShowRejectModal(false);
            setRejectingRequestId(null);
          }}
          onSave={async (desc) => {
            try {
              await rejectEditRequest({
                requestId: rejectingRequestId,
                replierId: user?.staffId,
                replyContent: desc,
              });
              alert(`❌ Đã từ chối request ${rejectingOrderCode}`);
              setShowRejectModal(false);
              setRejectingRequestId(null);
              fetchRequests(currentPageRef.current);
            } catch (err) {
              console.error("❌ Error rejecting:", err);
              alert("Có lỗi xảy ra khi từ chối yêu cầu.");
            }
          }}
        />
      </div>
    </div>
  );
}

export default RequestOrder;