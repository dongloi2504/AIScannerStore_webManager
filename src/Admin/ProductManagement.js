import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import GenericModal from "../components/GenericModal";
import { uploadfile , getProducts} from "../ServiceApi/apiAdmin";

function ProductManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // State chứa danh sách product được trả về từ API
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);

  // State cho tạo mới sản phẩm
  const [productName, setProductName] = useState("");
  const [categoryName, setcategoryName] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);

  // State cho search filters
  const [filters, setFilters] = useState({
    productName: "",
    productId: "",
  });

  // State cho modal chỉnh sửa
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingcategoryName, setEditingcategoryName] = useState("");

  // ============================
  // HÀM LOAD PRODUCTS TỪ API
  // ============================
  const loadProducts = async () => {
    try {
      // Gọi hàm getProducts kèm filters & phân trang
      const response = await getProducts({
        productNameQuery: filters.productName,
        productId: filters.productId,
        // categoryName: filters.categoryName,
        pageNumber: currentPage,
        pageSize: pageSize,
      });
console.log(filters.productName);
      const { items, totalPages } = response;
      // Cập nhật state
      setProducts(items || []);
      setTotalPages(totalPages || 1);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Mỗi khi currentPage hoặc filters thay đổi => gọi loadProducts
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Lấy danh sách id của products
  const allProductIds = useMemo(() => products.map((p) => p.productId), [products]);

  const handleCheckAll = (e) => {
    setSelectedProducts(e.target.checked ? allProductIds : []);
  };

  const handleCheckOne = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Xoá nhiều sản phẩm (tạm thời mình để ví dụ xóa cục bộ, tuỳ API)
  const handleDeleteSelectedProducts = () => {
    if (selectedProducts.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProducts.length} product(s)?`
    );
    if (!confirmDelete) return;

    // TODO: Gọi API xóa bên server (DELETE /api/product?ids=...)
    // Rồi load lại danh sách
    console.log("Deleting products from server...", selectedProducts);
    setSelectedProducts([]);
    loadProducts();
  };

  // Tạo mới product (có upload file)
  const handleCreateProduct = async () => {
    try {
      let uploadedImageUrl = "";
      if (productImageFile) {
        const uploadRes = await uploadfile(productImageFile);
        uploadedImageUrl = uploadRes?.data?.url || "";
      }

      // TODO: Gọi API tạo sản phẩm
      // const createRes = await createProduct({ productName, categoryName, imageUrl: uploadedImageUrl, ... })
      console.log("Creating product with data:", {
        productName,
        categoryName,
        imageUrl: uploadedImageUrl,
      });

      // Load lại danh sách sau khi tạo
      await loadProducts();

      // Đóng modal, reset form
      setShowModal(false);
      setProductName("");
      setcategoryName("");
      setProductImageFile(null);
    } catch (error) {
      console.error("Error uploading file or creating product:", error);
    }
  };

  // Cấu hình các trường trong modal tạo product
  const productFields = [
    {
      label: "Product Name",
      controlId: "productName",
      type: "text",
      value: productName,
      onChange: (e) => setProductName(e.target.value),
    },
    {
      label: "Category",
      controlId: "categoryName",
      type: "text",
      value: categoryName,
      onChange: (e) => setcategoryName(e.target.value),
    },
    {
      label: "Product Image",
      controlId: "productImage",
      type: "file",
      onChange: (e) => setProductImageFile(e.target.files[0]),
    },
  ];

  const handleCreateNewProduct = () => {
    setShowModal(true);
  };

  // Xử lý Edit
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingProductName(product.productName);
    setEditingcategoryName(product.category);
  };

  const handleUpdateProduct = async () => {
    try {
      
      console.log("Product updated with data:", {
        productId: editingProduct.productId,
        productName: editingProductName,
        categoryName: editingcategoryName,
      });

      // Load lại danh sách
      await loadProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Xử lý Detail => chuyển sang trang /product-detail/:id
  const handleDetailProduct = (product) => {
    navigate(`/product-detail/${product.productId}`, { state: { product } });
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Product Management"
          data={products}
          columns={[
            { key: "productId", label: "Product ID" },
            { key: "productName", label: "Product" },
            { key: "categoryName", label: "Category" },
          ]}
          selectedItems={selectedProducts}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedProducts}
          handleSearch={loadProducts}
          filters={[
            { label: "Product Name", value: filters.productName },
            { label: "Product ID", value: filters.productId },
            { label: "Category", value: filters.categoryName },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["productName", "productId", "categoryName"];
            setFilters((prev) => ({ ...prev, [filterKeys[index]]: value }));
          }}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Edit",
              className: "edit",
              variant: "info",
              onClick: handleEditProduct,
            },
            {
              label: "Detail",
              className: "detail",
              variant: "secondary",
              onClick: handleDetailProduct,
            },
          ]}
          extraButtons={[
            {
              label: "Create New",
              variant: "primary",
              onClick: handleCreateNewProduct,
            },
            {
              label: "Delete",
              variant: "danger",
              onClick: handleDeleteSelectedProducts,
              className: "delete-btn",
              disabled: selectedProducts.length === 0,
            },
          ]}
        />
      </div>

      {/* Modal tạo mới sản phẩm */}
      {showModal && (
        <GenericModal
          show={showModal}
          title="Create New Product"
          fields={productFields}
          onSave={handleCreateProduct}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Modal chỉnh sửa sản phẩm */}
      {editingProduct && (
        <GenericModal
          show={true}
          title="Edit Product"
          fields={[
            {
              label: "Product Name",
              controlId: "editProductName",
              type: "text",
              value: editingProductName,
              onChange: (e) => setEditingProductName(e.target.value),
            },
            {
              label: "Category",
              controlId: "editcategoryName",
              type: "text",
              value: editingcategoryName,
              onChange: (e) => setEditingcategoryName(e.target.value),
            },
          ]}
          onSave={handleUpdateProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

export default ProductManagement;
