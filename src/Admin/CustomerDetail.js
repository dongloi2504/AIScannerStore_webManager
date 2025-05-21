import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenericDetail from "../components/GenericDetail"; 
import { customerDetail } from "../ServiceApi/apiCustomer";
import "../Styles/ImageGallery.css";
import { FullScreenModal } from "../components/FullScreenModal";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const response = await customerDetail(id);
      if (response?.id) {
        setCustomer(response);
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
    loadCustomer();
  }, [id]);

  if ((!customer || Object.keys(customer).length === 0) && !loading) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound
        notFoundMessage={error || "Customer not found!"}
      />
    );
  }

  const infoRows = [
    { label: "Customer Id", value: customer?.id },
    { label: "Customer Name", value: customer?.name },
    { label: "Customer Code", value: customer?.code },
    { label: "Customer Email", value: customer?.email|| "N/A" },
    { label: "Customer Phone", value: customer?.phoneNumber },
    { label: "Created Date", value: new Date(customer?.createAt).toLocaleString() },
  ];

//   const productData = {
//     columns: ["Product Name", "Category", "Count", "Unit Price", "Total"],
//     rows: order.items?.length > 0
//       ? order.items.map((item) => [
//           item.productName,
//           item.categoryName,
//           item.count,
//           `${item.unitPrice.toLocaleString()}₫`,
//           `${item.total.toLocaleString()}₫`,
//         ])
//       : [["No products", "", "", "", ""]],
//   };

  return (
    <div className="order-detail-container">
      <FullScreenModal
        show
        loading={loading}
        onClose={() => navigate(-1)}
        title={`Customer Detail`}
        imageUrls={[customer?.imageUrl].filter(Boolean)}
        infoRows={infoRows}
      />
    </div>
  );
}

export default CustomerDetail;
