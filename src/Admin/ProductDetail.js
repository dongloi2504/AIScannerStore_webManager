import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenericDetail from "../components/GenericDetail";
import GenericModal from "../components/GenericModal";
import "../Styles/Detail.css";
import { getProducts, updateProductPricesInStore } from "../ServiceApi/apiAdmin";
import { FullScreenModal } from "../components/FullScreenModal";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Phân trang cho danh sách cửa hàng trong product.inventories
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2;

  // State cho modal cập nhật giá
  const [showPriceModal, setShowPriceModal] = useState(false);
  // Sẽ lưu đối tượng inventory gốc được chọn (chứa storeId, storeName,…)
  const [selectedInventory, setSelectedInventory] = useState(null);
  // Giá mới được nhập từ modal
  const [newPrice, setNewPrice] = useState("");

  // State refresh cho việc cập nhật dữ liệu bảng mà không reload toàn trang
  const [refresh, setRefresh] = useState(false);

  // Hàm load sản phẩm (bao gồm inventories)
  const loadProduct = async () => {
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
  };

  // Load sản phẩm ban đầu
  useEffect(() => {
    loadProduct();
  }, [id]);

  // Khi refresh flag thay đổi, gọi lại loadProduct để chỉ cập nhật bảng
  useEffect(() => {
    if (refresh) {
      loadProduct();
      setRefresh(false);
    }
  }, [refresh]);

  if (!product && !loading) {
    return (
      <FullScreenModal
        show
        onClose={() => navigate(-1)}
        notFound
        notFoundMessage={error || "Product not found!"}
      />
    );
  }

  const productStores = product?.inventories || [];
  const totalPages = Math.ceil(productStores.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentStores = productStores.slice(startIndex, endIndex);

  // rawRows chứa dữ liệu gốc của các cửa hàng (để dùng khi click vào hàng)
  const rawRows = currentStores.map((s) => ({
    storeId: s.storeId,
    storeCode: s.storeCode,
    storeName: s.storeName || "N/A",
    price: s.price,
  }));

  // formattedRows để hiển thị trong bảng (mảng các mảng)
  const formattedRows = rawRows.map((row) => [
    row.storeCode,
    row.storeName,
    `${row.price.toLocaleString()}₫`,
  ]);

  const infoRows = [
    { label: "ID", value: product?.productId },
    { label: "Product Code", value: product?.productCode },
    { label: "Name", value: product?.productName },
    { label: "Category", value: product?.categoryName },
    { label: "Description", value: product?.description },
  ];

  const productData = {
    columns: ["Store Code", "Store", "Price"],
    rows: formattedRows,
  };

  // Hàm xử lý click vào một hàng trong bảng; nhận row dữ liệu và chỉ số rowIndex
  const handleRowClick = (rowData, rowIndex) => {
    console.log("Row clicked:", rowData, "at index:", rowIndex);
    // Sử dụng rowIndex để lấy dữ liệu gốc tương ứng
    const inventoryData = rawRows[rowIndex];
    setSelectedInventory(inventoryData);
    setNewPrice(""); // reset giá mới
    setShowPriceModal(true);
  };

  // Hàm cập nhật giá: kiểm tra giá mới không âm, sau đó gọi API và trigger refresh
  const handleUpdatePrice = async () => {
    if (!selectedInventory) return;
    if (Number(newPrice) < 0) {
      alert("Price cannot be negative!");
      return;
    }
    try {
      await updateProductPricesInStore(selectedInventory.storeId, [
        { productId: product?.productId, price: Number(newPrice) },
      ]);
      alert("Price updated successfully");
      setShowPriceModal(false);
      setSelectedInventory(null);
      // Trigger refresh để cập nhật lại bảng (không reload toàn trang)
      setRefresh(true);
    } catch (err) {
      console.error("Failed to update price:", err);
      alert("Failed to update price");
    }
  };

  return (
    <div className="product-detail-container">
      <FullScreenModal
        onClose={() => navigate(-1)}
        show
        loading={loading}
        title="Product Detail"
        imageUrls={[product?.imageUrl].filter(Boolean)}
        infoRows={infoRows}
        productData={{
          columns: productData.columns,
          rows: productData.rows,
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        onRowClick={handleRowClick} // Đảm bảo GenericDetail chuyển sự kiện này xuống từng hàng của bảng
      />

      {showPriceModal && selectedInventory && (
        <GenericModal
          show={showPriceModal}
          title="Update Price"
          fields={[
            {
              label: "Store Name",
              controlId: "storeName",
              type: "text",
              value: selectedInventory.storeName,
              disabled: true,
            },
            {
              label: "Product Name",
              controlId: "productName",
              type: "text",
              value: product?.productName,
              disabled: true,
            },
            {
              label: "New Price",
              controlId: "newPrice",
              type: "number",
              value: newPrice,
              onChange: (e) => setNewPrice(e.target.value),
              min: 0,
            },
          ]}
          onSave={handleUpdatePrice}
          onClose={() => {
            setShowPriceModal(false);
            setSelectedInventory(null);
          }}
        />
      )}
    </div>
  );
}

export default ProductDetail;
