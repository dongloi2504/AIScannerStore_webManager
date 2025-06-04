import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import GenericDetail from "../components/GenericDetail";
import { orderdetail } from "../ServiceApi/apiOrder";
import "../Styles/ImageGallery.css";
import { Spinner } from 'react-bootstrap';

function OrderDetailPopup({ orderId, show, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && orderId) {
      loadOrder();
    }
  }, [show, orderId]);

  const loadOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderdetail(orderId);
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

  const galleryImages = [order?.image1].filter(Boolean);

  const infoRows = order ? [
    { label: "Order Code", value: order.orderCode },
    { label: "Device Code", value: order.device?.deviceCode || "N/A" },
    { label: "Store Code", value: order.device?.store?.storeCode || "N/A" },
    { label: "Total Before Discount", value: `${(order.totalBeforeDiscount || order.total + order.discount || 0).toLocaleString()}₫` },
    { label: "Order Discount", value: `${(order.orderDiscount || 0).toLocaleString()}₫` },
    { label: "Total", value: `${order.total.toLocaleString()}₫` },
    { label: "Status", value: order.status },
    { label: "Created Date", value: new Date(order.createdDate).toLocaleString() },
  ] : [];

  const productData = order ? {
    columns: [
      "Product Name",
      "Category",
      "Count",
      "Unit Price",
      "Total Before",
      "Discount",
      "Total"
    ],
    rows: order.items?.length > 0
      ? order.items.map((item) => [
        item.productName,
        item.categoryName,
        item.count,
        `${item.unitPrice.toLocaleString()}₫`,
        `${(item.totalBeforeDiscount || 0).toLocaleString()}₫`,
        `${(item.discount || 0).toLocaleString()}₫`,
        `${item.total.toLocaleString()}₫`,
      ])
      : [["No products", "", "", "", "","", ""]],
  } : { columns: [], rows: [] };

  return (
    <Modal show={show} onHide={onClose} fullscreen centered>
      <Modal.Header closeButton>
        <Modal.Title>Order Detail</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" role="status" />
          </div>
        ) : error || !order ? (
          <GenericDetail notFound notFoundMessage={error || "Order not found!"} />
        ) : (
          <GenericDetail
            title={`Order: ${order.orderCode}`}
            imageUrls={galleryImages}
            infoRows={infoRows}
            productData={productData}
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default OrderDetailPopup;
