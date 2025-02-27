import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import GenericModal from "../components/GenericModal";

function ProductManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dữ liệu mock ban đầu (giả lập toàn bộ sản phẩm)
  const initialProducts = [
    { productId: "P001", productName: "Product 1", basePrice: 100, category: "Category A" },
    { productId: "P002", productName: "Product 2", basePrice: 200, category: "Category B" },
    { productId: "P003", productName: "Product 3", basePrice: 150, category: "Category A" },
    { productId: "P004", productName: "Product 4", basePrice: 250, category: "Category C" },
    { productId: "P005", productName: "Product 5", basePrice: 300, category: "Category B" },
    { productId: "P006", productName: "Product 6", basePrice: 120, category: "Category A" },
    { productId: "P007", productName: "Product 7", basePrice: 220, category: "Category B" },
    { productId: "P008", productName: "Product 8", basePrice: 180, category: "Category C" },
    { productId: "P009", productName: "Product 9", basePrice: 190, category: "Category A" },
    { productId: "P010", productName: "Product 10", basePrice: 260, category: "Category B" },
  ];

  // State chứa toàn bộ dữ liệu (để mô phỏng CRUD)
  const [allProducts, setAllProducts] = useState(initialProducts);
  // State chứa dữ liệu đang hiển thị (theo phân trang, search, …)
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Các state cho tạo mới sản phẩm
  const [productName, setProductName] = useState("");
  const [productBasePrice, setProductBasePrice] = useState("");
  const [productCategory, setProductCategory] = useState("");

  // State cho search filters (theo các trường: productName, productId, productCategory)
  const [filters, setFilters] = useState({
    productName: "",
    productId: "",
    productCategory: "",
  });

  // State cho modal chỉnh sửa (Edit)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductBasePrice, setEditingProductBasePrice] = useState("");
  const [editingProductCategory, setEditingProductCategory] = useState("");

  // Hàm load dữ liệu (mô phỏng call API) với filter và phân trang
  const loadProducts = () => {
    let filtered = allProducts;
    if (filters.productName) {
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }
    if (filters.productId) {
      filtered = filtered.filter((p) =>
        p.productId.toLowerCase().includes(filters.productId.toLowerCase())
      );
    }
    if (filters.productCategory) {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(filters.productCategory.toLowerCase())
      );
    }
    const totalItems = filtered.length;
    const totalPg = Math.ceil(totalItems / pageSize) || 1;
    setTotalPages(totalPg);
    // Nếu currentPage vượt quá tổng số trang sau khi filter thì quay lại trang 1
    const page = currentPage > totalPg ? 1 : currentPage;
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);
    setProducts(paginatedItems);
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters, allProducts]);

  // Dùng để lấy danh sách id của các sản phẩm hiển thị
  const allProductIds = useMemo(() => products.map((p) => p.productId), [products]);

  const handleCheckAll = (e) => {
    setSelectedProducts(e.target.checked ? allProductIds : []);
  };

  const handleCheckOne = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteSelectedProducts = () => {
    if (selectedProducts.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProducts.length} product(s)?`
    );
    if (!confirmDelete) return;
    setAllProducts((prev) => prev.filter((p) => !selectedProducts.includes(p.productId)));
    setSelectedProducts([]);
  };

  const handleCreateProduct = () => {
    // Giả lập tạo product với productId tự động tăng
    const newId = "P" + (allProducts.length + 1).toString().padStart(3, "0");
    const newProduct = {
      productId: newId,
      productName,
      basePrice: parseFloat(productBasePrice),
      category: productCategory,
    };
    setAllProducts([...allProducts, newProduct]);
    console.log("Product created successfully", newProduct);
    setShowModal(false);
    setProductName("");
    setProductBasePrice("");
    setProductCategory("");
  };

  const productFields = [
    {
      label: "Product Name",
      controlId: "productName",
      type: "text",
      value: productName,
      onChange: (e) => setProductName(e.target.value),
    },
    {
      label: "Base Price",
      controlId: "productBasePrice",
      type: "number",
      value: productBasePrice,
      onChange: (e) => setProductBasePrice(e.target.value),
    },
    {
      label: "Category",
      controlId: "productCategory",
      type: "text",
      value: productCategory,
      onChange: (e) => setProductCategory(e.target.value),
    },
  ];

  const handleCreateNewProduct = () => {
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingProductName(product.productName);
    setEditingProductBasePrice(product.basePrice);
    setEditingProductCategory(product.category);
  };

  const handleUpdateProduct = () => {
    setAllProducts((prev) =>
      prev.map((p) =>
        p.productId === editingProduct.productId
          ? {
              ...p,
              productName: editingProductName,
              basePrice: parseFloat(editingProductBasePrice),
              category: editingProductCategory,
            }
          : p
      )
    );
    console.log("Product updated successfully");
    setEditingProduct(null);
  };

  const handleDetailProduct = (product) => {
    console.log("Detail product:", product);
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
            { key: "basePrice", label: "Base Price" },
            { key: "category", label: "Category" },
          ]}
          selectedItems={selectedProducts}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedProducts}
          handleSearch={loadProducts}
          filters={[
            { label: "Product Name", value: filters.productName },
            { label: "Product ID", value: filters.productId },
            { label: "Category", value: filters.productCategory },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["productName", "productId", "productCategory"];
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
              label: "Base Price",
              controlId: "editProductBasePrice",
              type: "number",
              value: editingProductBasePrice,
              onChange: (e) => setEditingProductBasePrice(e.target.value),
            },
            {
              label: "Category",
              controlId: "editProductCategory",
              type: "text",
              value: editingProductCategory,
              onChange: (e) => setEditingProductCategory(e.target.value),
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
