import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Dùng để chuyển trang
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import GenericModal from "../components/GenericModal";

// Giả sử bạn import hàm uploadfile từ apiAdmin
import { uploadfile } from "../ServiceApi/apiAdmin";

function ProductManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate(); // Khởi tạo biến navigate để chuyển hướng

  // Dữ liệu mock ban đầu (giả lập toàn bộ sản phẩm), giống ProductDetail
  const initialProducts = [
    {
      productId: "P001",
      productName: "Product 1",
      category: "Category A",
      imageUrl: "",
      description: "bột, đường, sữa",
      stores: [
        { storeId: "S001", storeName: "KFC", price: 110 },
        { storeId: "S002", storeName: "LOTTE", price: 105 },
        { storeId: "S003", storeName: "HighLand", price: 115 },
      ],
    },
    {
      productId: "P002",
      productName: "Product 2",
      category: "Category B",
      imageUrl: "",
      description: "trà xanh, kem, đá xay",
      stores: [
        { storeId: "S001", storeName: "KFC", price: 210 },
        { storeId: "S002", storeName: "LOTTE", price: 190 },
      ],
    },
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
  const [productCategory, setProductCategory] = useState("");
  const [productImageFile, setProductImageFile] = useState(null); // lưu file ảnh

  // State cho search filters
  const [filters, setFilters] = useState({
    productName: "",
    productId: "",
    productCategory: "",
  });

  // State cho modal chỉnh sửa (Edit)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductName, setEditingProductName] = useState("");
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

  // Mỗi khi currentPage, filters hoặc allProducts thay đổi => load lại danh sách
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
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
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

  // Tạo mới product (có upload file)
  const handleCreateProduct = async () => {
    try {
      // Giả lập tạo product với productId tự động tăng
      const newId = "P" + (allProducts.length + 1).toString().padStart(3, "0");

      let uploadedImageUrl = "";
      // Nếu có chọn file ảnh, tiến hành upload
      if (productImageFile) {
        const uploadRes = await uploadfile(productImageFile);
        // Giả sử API trả về { url: "https://..." } trong uploadRes.data
        uploadedImageUrl = uploadRes?.data?.url || "";
      }

      const newProduct = {
        productId: newId,
        productName,
        category: productCategory,
        imageUrl: uploadedImageUrl, // lưu URL ảnh
        // Bổ sung description và stores mặc định nếu muốn
        description: "Mặc định: chưa nhập",
        stores: [],
      };

      // Cập nhật vào allProducts
      setAllProducts([...allProducts, newProduct]);
      console.log("Product created successfully", newProduct);

      // Đóng modal, reset form
      setShowModal(false);
      setProductName("");
      setProductCategory("");
      setProductImageFile(null);
    } catch (error) {
      console.error("Error uploading file or creating product:", error);
    }
  };

  // Các trường trong modal tạo product
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
      controlId: "productCategory",
      type: "text",
      value: productCategory,
      onChange: (e) => setProductCategory(e.target.value),
    },
    {
      label: "Product Image",
      controlId: "productImage",
      type: "file",
      // Không set value cho file, chỉ cần onChange
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
    setEditingProductCategory(product.category);
  };

  const handleUpdateProduct = () => {
    setAllProducts((prev) =>
      prev.map((p) =>
        p.productId === editingProduct.productId
          ? {
              ...p,
              productName: editingProductName,
              category: editingProductCategory,
              // Giữ lại description, stores cũ (nếu có)
              description: p.description,
              stores: p.stores,
            }
          : p
      )
    );
    console.log("Product updated successfully");
    setEditingProduct(null);
  };

  // Xử lý Detail => chuyển sang trang /product-detail/:id
  const handleDetailProduct = (product) => {
    navigate(`/product-detail/${product.productId}`);
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
              onClick: handleDetailProduct, // gọi hàm navigate
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
