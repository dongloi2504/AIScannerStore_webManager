import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenericDetail from "../components/GenericDetail";
import "../Styles/Detail.css";
import { getProducts } from "../ServiceApi/apiAdmin";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const response = await getProducts({
          productId: id,
          pageNumber: 1,
          pageSize: 1,
        });
        if (response?.items?.length > 0) {
          setProduct(response.items[0]);
        } else {
          setError("Product not found!");
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Error loading product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!product) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound
        notFoundMessage={error || "Product not found!"}
      />
    );
  }

  const productStores = product.inventories || [];
  const totalPages = Math.ceil(productStores.length / pageSize);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStores = productStores.slice(startIndex, endIndex);

  const infoRows = [
	{ label: "ID", value: product.productId },
	{ label: "Product Code", value: product.productCode },
    { label: "Name", value: product.productName },
    { label: "Category", value: product.categoryName },
    { label: "Description", value: product.description },
  ];

  const productData = {
    columns: ["Store Code", "Store", "Price"],
    rows: currentStores.map((s) => [
      s.storeCode,
      s.storeName || "N/A",
      `${s.price.toLocaleString()}₫`,
    ]),
  };

  return (
    <div className="product-detail-container">
      <GenericDetail
        onBack={() => navigate(-1)}
        title="Product Detail"
        imageUrl={product.imageUrl}
        infoRows={infoRows}
        productData={productData} // ✅ Đúng prop với GenericDetail mới
        currentPage={currentPage}
        totalPages={totalPages}
        handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        extraButtons={[
          { label: "Create", variant: "success", onClick: () => alert("Create product") },
          { label: "Delete", variant: "danger", onClick: () => alert("Delete product") },
          { label: "Edit", variant: "primary", onClick: () => alert("Edit product") },
        ]}
      />
    </div>
  );
}

export default ProductDetail;
