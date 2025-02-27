import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import GenericDetail from "../components/GenericDetail";
import "../Styles/Detail.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tạm mock data
  const [allProducts] = useState([
    {
      productId: "P001",
      productName: "Product 1",
      basePrice: 100,
      category: "Category A",
      imageUrl: "",
      description: "bột, đường, sữa",
      stores: [
        { storeId: "S001", storeName: "KFC", price: 110 },
        { storeId: "S002", storeName: "LOTTE", price: 105 },
        { storeId: "S003", storeName: "HighLand", price: 115 },
        { storeId: "S004", storeName: "Starbucks", price: 120 },
      ],
    },
    {
      productId: "P002",
      productName: "Product 2",
      basePrice: 200,
      category: "Category B",
      imageUrl: "",
      description: "trà xanh, kem, đá xay",
      stores: [
        { storeId: "S001", storeName: "KFC", price: 210 },
        { storeId: "S002", storeName: "LOTTE", price: 190 },
      ],
    },
  ]);

  // ---- Các state liên quan đến phân trang (PHẢI gọi trước khi return sớm) ----
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  // Tìm product
  const product = allProducts.find((p) => p.productId === id);

  // Nếu không có product, return sớm
  if (!product) {
    return (
        
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound={true}
        notFoundMessage="Product not found!"
      />
    );
  }

  // Tính totalPages
  const totalPages = Math.ceil(product.stores.length / pageSize);

  // Hàm xử lý Back
  const handleBack = () => {
    navigate(-1);
  };

  // Các hàm xử lý cho group button
  const handleCreate = () => {
    alert("Create product");
  };
  const handleEdit = () => {
    alert("Edit product");
  };
  const handleDelete = () => {
    alert("Delete product");
  };

  // Xử lý Prev/Next
  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };
  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  // Cắt dữ liệu theo trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStores = product.stores.slice(startIndex, endIndex);

  // Tạo infoRows
  const infoRows = [
    { label: "Product", value: product.productName },
    { label: "ID", value: product.productId },
    { label: "Category", value: product.category },
    { label: "Base Price", value: product.basePrice },
    { label: "Description", value: product.description },
  ];

  // Tạo dữ liệu bảng
  const tableColumns = ["Store ID", "Store", "Price"];
  const tableRows = currentStores.map((s) => [s.storeId, s.storeName, s.price]);

  return (
    <div className="product-detail-container">
    <GenericDetail
      onBack={handleBack}
      title="Product Detail"
      imageUrl={product.imageUrl}
      infoRows={infoRows}
      tableData={{ columns: tableColumns, rows: tableRows }}
     
      extraButtons={[
        { label: "Create", variant: "success", onClick: handleCreate },
        { label: "Delete", variant: "danger", onClick: handleDelete },
        { label: "Edit", variant: "primary", onClick: handleEdit },
      ]}
      currentPage={currentPage}
      totalPages={totalPages}
      handlePrev={handlePrev}
      handleNext={handleNext}
    />
    </div>
  );
}

export default ProductDetail;
