import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import GenericModal from "../components/GenericModal";
import { uploadfileIO, getProducts, addProduct } from "../ServiceApi/apiAdmin";
import { getCategory } from "../ServiceApi/apiCatetory";

function ProductManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // State chứa danh sách sản phẩm
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // State cho modal tạo mới sản phẩm
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  // Thay vì nhập thủ công categoryId, ta sẽ chọn từ dropdown
  const [categoryId, setCategoryId] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);

  // State cho search filters
  const [filters, setFilters] = useState({
    productName: "",
    productId: "",
    categoryId: "",
  });

  // State cho modal chỉnh sửa sản phẩm (nếu cần)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");

  // State danh sách category lấy từ API
  const [categories, setCategories] = useState([]);

  // ============================
  // Hàm load danh sách sản phẩm từ API
  // ============================
  const loadProducts = async () => {
    try {
      const response = await getProducts({
        productNameQuery: filters.productName,
        productId: filters.productId,
        pageNumber: currentPage,
        pageSize: pageSize,
      });
      const { items, totalItem } = response;
      setProducts(items || []);
      setTotalPages(Math.ceil((totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Load danh sách sản phẩm khi currentPage thay đổi
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Load danh sách category khi component khởi tạo
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy tất cả các category với pageSize rất lớn
        const res = await getCategory({ pageNumber: 1, pageSize: 2147483647 });
        console.log("Categories fetched:", res);
        setCategories(res?.items || []);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Lấy danh sách id của products để xử lý check all
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

  // Xoá nhiều sản phẩm (tùy theo API thực tế)
  const handleDeleteSelectedProducts = () => {
    if (selectedProducts.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedProducts.length} product(s)?`
    );
    if (!confirmDelete) return;
    // TODO: Gọi API để xoá sản phẩm ở server, sau đó load lại danh sách
    setSelectedProducts([]);
    loadProducts();
  };

  // Tạo mới sản phẩm với quy trình: upload ảnh -> lấy URL -> gọi API addProduct
  const handleCreateProduct = async () => {
    try {
      let uploadedImageUrl = "";
      if (productImageFile) {
        // Sử dụng uploadfileIO thay vì uploadfile
        const uploadRes = await uploadfileIO(productImageFile);
        // Giả sử URL được trả về nằm trong uploadRes.image_url hoặc uploadRes.url, tùy theo API trả về
        uploadedImageUrl = uploadRes?.image_url || uploadRes?.url || uploadRes;
      }
      // Gọi API tạo sản phẩm với thông tin theo cấu trúc:
      // { productName, description, categoryId, imageUrl }
      await addProduct({
        productName,
        description,
        categoryId,
        imageUrl: uploadedImageUrl,
      });

      // Load lại danh sách sản phẩm sau khi tạo thành công
      await loadProducts();

      // Đóng modal và reset form
      setShowModal(false);
      setProductName("");
      setDescription("");
      setCategoryId("");
      setProductImageFile(null);
    } catch (error) {
      console.error("Error uploading file or creating product:", error);
    }
  };

  // Cấu hình các trường trong modal tạo sản phẩm
  // Ở trường Category, dùng type "select" với options từ categories
  const productFields = [
    {
      label: "Product Name",
      controlId: "productName",
      type: "text",
      value: productName,
      onChange: (e) => setProductName(e.target.value),
    },
    {
      label: "Description",
      controlId: "description",
      type: "text",
      value: description,
      onChange: (e) => setDescription(e.target.value),
    },
    {
      label: "Category",
      controlId: "categoryId",
      type: "select",
      value: categoryId,
      onChange: (e) => setCategoryId(e.target.value),
      // Các options: mảng các đối tượng { label, value }
      options: categories.map((cat) => ({
        label: cat.categoryName,
        value: cat.categoryId, // Sử dụng key tương ứng với ID của category từ API
      })),
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

  // Xử lý Edit (nếu cần)
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditingProductName(product.productName);
    setEditingDescription(product.description);
    setEditingCategoryId(product.categoryId);
  };

  const handleUpdateProduct = async () => {
    try {
      console.log("Product updated with data:", {
        productId: editingProduct.productId,
        productName: editingProductName,
        description: editingDescription,
        categoryId: editingCategoryId,
      });
      // TODO: Gọi API update product nếu có yêu cầu
      await loadProducts();
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  // Xử lý chuyển sang trang chi tiết sản phẩm
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
            { key: "productCode", label: "Product Code" },
            { key: "productName", label: "Product" },
            { key: "categoryId", label: "Category ID" },
          ]}
          selectedItems={selectedProducts}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedProducts}
          handleSearch={loadProducts}
          filters={[
            { label: "Product Name", value: filters.productName },
            { label: "Product ID", value: filters.productId },
            { label: "Category ID", value: filters.categoryId },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["productName", "productId", "categoryId"];
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
              label: "Description",
              controlId: "editDescription",
              type: "text",
              value: editingDescription,
              onChange: (e) => setEditingDescription(e.target.value),
            },
            {
              label: "Category",
              controlId: "editCategoryId",
              type: "select",
              value: editingCategoryId,
              onChange: (e) => setEditingCategoryId(e.target.value),
              options: categories.map((cat) => ({
                label: cat.categoryName,
                value: cat.categoryId,
              })),
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
