import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import GenericModal from "../components/GenericModal";
import { uploadfileIO, getProducts, addProduct, updateProduct, suspendProducts } from "../ServiceApi/apiAdmin";
import { getCategory } from "../ServiceApi/apiCatetory";
import { Role } from "../const/Role";
import { useToast } from "../Context/ToastContext";

function ProductManagement() {
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // State chứa danh sách sản phẩm
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // State cho modal tạo mới sản phẩm
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [productCode, setProductCode] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  // Thay vì nhập thủ công categoryCode, ta sẽ chọn từ dropdown
  const [categoryId, setCategoryId] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);

  // State cho search filters
  const [filters, setFilters] = useState({
    productName: "",
    productCode: "",
    categoryCode: "",
	isSuspended: false
  });

  // State cho modal chỉnh sửa sản phẩm (nếu cần)
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingProductCode, setEditingProductCode] = useState("");
  const [editingBasePrice, setEditingBasePrice] = useState(0);
  const [editingSuspend, setEditingSuspend] = useState(false);
  const [editingProdImg, setEditingProdImg] = useState(null);

  // State danh sách category lấy từ API
  const [categories, setCategories] = useState([]);

  // ============================
  // Hàm load danh sách sản phẩm từ API
  // ============================
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({
        productNameQuery: filters.productName,
        productCode: filters.productCode,
		categoryCode: filters.categoryCode,
		isSuspended: filters.isSuspended,
        pageNumber: currentPage,
        pageSize: pageSize,
      });
      const { items, totalItem } = response;
      setProducts(items || []);
      setLoading(false);
      setTotalPages(Math.ceil((totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error loading products:", error);
      setLoading(false);
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

  const handleCheckOne = (productCode) => {
    setSelectedProducts((prev) =>
      prev.includes(productCode)
        ? prev.filter((id) => id !== productCode)
        : [...prev, productCode]
    );
  };

  // Xoá nhiều sản phẩm (tùy theo API thực tế)
  const handleDeleteSelectedProducts = () => {
    if (selectedProducts.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to suspend ${selectedProducts.length} product(s)?`
    );
    if (!confirmDelete) return;
    suspendProducts(selectedProducts).then(x => {
	  showToast("Product(s) suspended!","info");
	  setSelectedProducts([]);
      loadProducts();
	})
	.catch(error => {
		const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message,"error");
	});
    
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
      var result = await addProduct({
        productName,
        description,
        categoryId,
        imageUrl: uploadedImageUrl,
		productCode,
		basePrice,
      });
	    await loadProducts();
        // Đóng modal và reset form
        setShowModal(false);
        setProductName("");
        setDescription("");
        setCategoryId("");
	    setProductCode("");
		setBasePrice(0);
        setProductImageFile(null);
		setTimeout(() => { showToast("Product Added!", "info"); }, 0);
    } catch (error) {
		const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
    }
  };

  // Cấu hình các trường trong modal tạo sản phẩm
  // Ở trường Category, dùng type "select" với options từ categories
  const productFields = [
    {
      label: "Product Code",
      controlId: "productCode",
      type: "text",
      value: productCode,
	  required: true,
	  maxLength: 50,
      onChange: (e) => setProductCode(e.target.value),
    },
	{
      label: "Product Name",
      controlId: "productName",
      type: "text",
      value: productName,
	  maxLength: 50,
	  required: true,
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
      label: "Base Price",
      controlId: "basePrice",
      type: "number",
      value: basePrice,
	  required: true,
	  allowNegative: false,
      onChange: (e) => setBasePrice(e.target.value),
    },
    {
      label: "Category",
      controlId: "categoryId",
      type: "select",
      value: categoryId,
	  required: true,
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
	setEditingBasePrice(product.basePrice);
	setEditingCategoryId(product.categoryId);
    setEditingProductName(product.productName);
    setEditingDescription(product.description);
	setEditingSuspend(product.isSuspended);
	setEditingProductCode(product.productCode);
  };

  const handleUpdateProduct = async () => {
    try {
	  // Keep the old image if nothing uploaded
	  let uploadedImageUrl = editingProduct.imageUrl;
      if (productImageFile) {
        // Sử dụng uploadfileIO thay vì uploadfile
        const uploadRes = await uploadfileIO(productImageFile);
        // Giả sử URL được trả về nằm trong uploadRes.image_url hoặc uploadRes.url, tùy theo API trả về
        uploadedImageUrl = uploadRes?.image_url || uploadRes?.url || uploadRes;
      }
      await updateProduct({
		productId: editingProduct.productId,
		productName: editingProductName,
		productCode: editingProductCode,
		basePrice: editingBasePrice,
		description: editingDescription,
		categoryId: editingCategoryId,
		imageUrl: uploadedImageUrl,
		isSuspended: editingSuspend,
	  })
      await loadProducts();
      setEditingProduct(null);
	  showToast("Product Updated!", "info");
    } catch (error) {
		const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
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
          loading={loading}
          data={products}
          columns={[
            { key: "productCode", label: "Product Code" },
            { key: "productName", label: "Product" },
            { key: "categoryName", label: "Category Name" },
			{ key: "categoryCode", label: "Category Code" },
          ]}
          selectedItems={selectedProducts}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedProducts}
          handleSearch={loadProducts}
          filters={[
            { label: "Product Name", value: filters.productName },
            { label: "Product Code", value: filters.productCode },
            { label: "Category Code", value: filters.categoryCode },
			{ label: "Suspend", value: filters.isSuspended, type:"checkbox", hasLabel:true }
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["productName", "productCode", "categoryCode", "isSuspended"];
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
			  roles: [Role.ADMIN]
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
			  roles: [Role.ADMIN]
            },
            {
              label: "Suspend",
              variant: "danger",
              onClick: handleDeleteSelectedProducts,
              className: "delete-btn",
              disabled: selectedProducts.length === 0,
			  roles: [Role.ADMIN]
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
              label: "Product Code",
              controlId: "editProductCode",
              type: "text",
			  maxLength:50,
              value: editingProductCode,
              onChange: (e) => setEditingProductCode(e.target.value),
            },
            {
              label: "Product Name",
              controlId: "editProductName",
              type: "text",
			  required: true,
			  maxLength:50,
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
              label: "Base Price",
              controlId: "editBasePrice",
              type: "number",
			  required: true,
			  allowNegative: false,
              value: editingBasePrice,
              onChange: (e) => setEditingBasePrice(e.target.value),
            },
            {
              label: "Category",
              controlId: "editCategoryId",
              type: "select",
			  required: true,
              value: editingCategoryId,
              onChange: (e) => setEditingCategoryId(e.target.value),
              options: categories.map((cat) => ({
                label: cat.categoryName,
                value: cat.categoryId,
              })),
            },
			{
			  label: "Suspend",
              controlId: "editSuspend",
              type: "checkbox",
			  required: true,
              value: editingSuspend,
              onChange: (e) => setEditingSuspend(e.target.checked),
			},
			{
              label: "Product Image",
              controlId: "editProdImg",
              type: "file",
              onChange: (e) => setEditingProdImg(e.target.files[0]),
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
