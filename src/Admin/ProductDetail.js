import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import GenericDetail from "../components/GenericDetail";
import "../Styles/Detail.css";
import { getProducts } from "../ServiceApi/apiAdmin";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Log id để kiểm tra
  console.log("Product ID from URL:", id);

  // State lưu trữ thông tin product lấy từ API
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Các state phân trang cho danh sách store của product
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  // Gọi API lấy thông tin product theo id (chỉ tìm theo productId)
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await getProducts({
          productId: id, // sử dụng id từ URL
          pageNumber: 1,
          pageSize: 1,
        });
        if (response?.items && response.items.length > 0) {
          setProduct(response.items[0]);
        } else {
          setError("Product not found!");
          setProduct(null);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Error loading product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  // Nếu đang loading, hiển thị Loading...
  if (loading) {
    return <div>Loading...</div>;
  }

  // Nếu không có product (hoặc lỗi), render GenericDetail với thông báo lỗi
  if (!product) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound={true}
        notFoundMessage={error || "Product not found!"}
      />
    );
  }

  // Sử dụng trường inventories thay vì product.stores (vì API trả về trường inventories)
  const productStores = product.inventories || [];
  const totalPages = Math.ceil(productStores.length / pageSize);

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

  // Xử lý phân trang cho danh sách store
  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };
  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStores = productStores.slice(startIndex, endIndex);

  // Tạo infoRows hiển thị thông tin chi tiết của product
  const infoRows = [
    { label: "Product", value: product.productName },
    { label: "ID", value: product.productId },
    { label: "Category", value: product.categoryName },
    { label: "Description", value: product.description },
  ];

  // Tạo dữ liệu bảng cho danh sách store
  const tableColumns = ["Store ID", "Store", "Price"];
  const tableRows = currentStores.map((s) => [
    s.storeId,
    s.storeName || "N/A",
    s.price,
  ]);

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
