import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenericDetail from "../components/GenericDetail"; // ✅ dùng lại GenericDetail
import { orderdetail } from "../ServiceApi/apiOrder";
import "../Styles/ImageGallery.css";

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderdetail(id);
      console.log("Order response:", response);
      if (response?.orderId) {
        setOrder(response);
      } else {
        setError("Invalid response format.");
      }
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Error loading order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!order || Object.keys(order).length === 0) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound
        notFoundMessage={error || "Order not found!"}
      />
    );
  }

  const galleryImages = [order.image1, order.image2, order.image3].filter(Boolean);

  const infoRows = [
    { label: "Order Code", value: order.orderCode },
    { label: "Device Code", value: order.device?.deviceCode || "N/A" },
    { label: "Store Code", value: order.device?.storeCode || "N/A" },
    { label: "Total", value: `${order.total.toLocaleString()}₫` },
    { label: "Status", value: order.status },
    { label: "Created Date", value: new Date(order.createdDate).toLocaleString() },
  ];

  const productData = {
    columns: ["Product Name", "Category", "Count", "Unit Price", "Total"],
    rows: order.items?.length > 0
      ? order.items.map((item) => [
          item.productName,
          item.categoryName,
          item.count,
          `${item.unitPrice.toLocaleString()}₫`,
          `${item.total.toLocaleString()}₫`,
        ])
      : [["No products", "", "", "", ""]],
  };

  return (
    <div className="order-detail-container">
      <GenericDetail
        onBack={() => navigate(-1)}
        title={`Order: ${order.orderCode}`}
        imageUrls={galleryImages}
        infoRows={infoRows}
        productData={productData}
      />
    </div>
  );
}

export default OrderDetail;
