import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import GenericDetail from "../components/GenericDetail";
import GenericModal from "../components/GenericModal";
import ChangeStockModal from "../components/ChangeStockModal";
import {
  getInventoryByStoreId,
  updateProductPricesInStore,
  getProducts,
  ChangeInventory,
  AuditInventory,
  uploadfileIO,
  getInventoryHistoryByStoreId,
} from "../ServiceApi/apiAdmin";

function Unauthorized() {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const store = location.state?.store;

  const PAGE_SIZE = 8;

  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const [showChangeStockModal, setShowChangeStockModal] = useState(false);
  const [productChanges, setProductChanges] = useState([{ productId: "", changeAmount: 0 }]);
  const [imageFile, setImageFile] = useState(null);
  const [changeStockLoading, setChangeStockLoading] = useState(false);
  const [modalMode, setModalMode] = useState("change");

  const [activeTab, setActiveTab] = useState("products");

  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);

  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);

  useEffect(() => {
    if (!store?.storeId) return;
    fetchProducts();
    fetchInventory(productPage);
    fetchInventoryHistory(inventoryPage);
  }, [store?.storeId]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchInventory(productPage);
    }
  }, [productPage, activeTab]);

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventoryHistory(inventoryPage);
    }
  }, [inventoryPage, activeTab]);

  const fetchInventory = async (page = 1) => {
    try {
      const res = await getInventoryByStoreId(store.storeId, page, PAGE_SIZE);
      const items = res?.items || [];
      const total = res?.totalItem ?? items.length;
      setInventory(items);
      setProductTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("❌ Failed to fetch inventory:", err);
      setInventory([]);
      setProductTotalPages(1);
    }
  };

  const fetchInventoryHistory = async (page = 1) => {
    try {
      const res = await getInventoryHistoryByStoreId({
        storeId: store.storeId,
        PageNumber: page,
        PageSize: PAGE_SIZE,
      });
      const items = res?.items || [];
      const total = res?.totalItem ?? items.length;
      setInventoryHistory(items);
      setInventoryTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error("❌ Failed to fetch inventory history:", err);
      setInventoryHistory([]);
      setInventoryTotalPages(1);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 2147483647 });
      setProducts(res?.items || []);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setProducts([]);
    }
  };

  const handleAddPrice = async () => {
    try {
      await updateProductPricesInStore(store.storeId, [
        { productId: newProductId, price: Number(newPrice) },
      ]);
      setShowModal(false);
      setNewProductId("");
      setNewPrice("");
      fetchInventory(productPage);
    } catch (err) {
      console.error("❌ Failed to update price:", err);
    }
  };

  const handleChangeStock = () => {
    setModalMode("change");
    setShowChangeStockModal(true);
  };

  const handleAuditStock = () => {
    setModalMode("audit");
    setShowChangeStockModal(true);
  };

  const handleSubmitChangeStock = async () => {
    if (!productChanges.length) return;

    const staffId = localStorage.getItem("staffId");
    if (!staffId) {
      alert("Missing staff ID. Please log in again.");
      return;
    }

    setChangeStockLoading(true);

    let imageUrl = "";
    if (imageFile) {
      try {
        const res = await uploadfileIO(imageFile);
        imageUrl = res.image_url || res.url || res;
      } catch (err) {
        console.error("❌ Failed to upload image:", err);
      }
    }

    const payload = {
      storeId: store.storeId,
      staffId,
      imageUrl,
      items: productChanges.map((p) => ({
        productId: p.productId,
        changeAmount: Number(p.changeAmount),
      })),
    };

    try {
      if (modalMode === "audit") {
        await AuditInventory({ ...payload, description: "Audit from frontend" });
      } else {
        await ChangeInventory(payload);
      }
      fetchInventory(productPage);
      fetchInventoryHistory(inventoryPage);
      setShowChangeStockModal(false);
      setImageFile(null);
      setProductChanges([{ productId: "", changeAmount: 0 }]);
    } catch (err) {
      console.error(`❌ Failed to ${modalMode === "audit" ? "audit" : "change"} stock:`, err);
    } finally {
      setChangeStockLoading(false);
    }
  };

  if (!store) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound
        notFoundMessage="Store data not found! (Did you refresh or access directly?)"
      />
    );
  }

  const infoRows = [
    { label: "Store Name", value: store.storeName },
    { label: "Store ID", value: store.storeId },
    { label: "Location", value: store.storeLocation },
  ];

  const productData = {
    columns: ["Product ID", "Product Name", "Price", "Stock"],
    rows: inventory.map((item) => [
      item.productId,
      item.productName,
      `${item.price.toLocaleString()}₫`,
      item.stock,
    ]),
  };

  const ioData = {
    columns: ["Staff", "Type", "Date", "Action"],
    rows: inventoryHistory.map((item) => [
      item.staff?.staffName || "-",
      item.type,
      new Date(item.createTime).toLocaleDateString(),
      {
        label: "Detail",
        variant: "secondary",
        onClick: () =>
          navigate(`/inventory-history/${item.inventoryNoteId}`, {
            state: { store },
          }),
      },
    ]),
  };

  const tabs = [
    { key: "products", label: "Products", data: productData },
    { key: "inventory", label: "Inventory I/O", data: ioData },
  ];

  return (
    <div className="store-detail-container">
      <GenericDetail
        onBack={() => navigate(-1)}
        title="Store Detail"
        infoRows={infoRows}
        tabs={tabs}
        itemKey={null}
        currentPage={activeTab === "products" ? productPage : inventoryPage}
        totalPages={activeTab === "products" ? productTotalPages : inventoryTotalPages}
        handlePrev={() =>
          activeTab === "products"
            ? setProductPage((prev) => Math.max(prev - 1, 1))
            : setInventoryPage((prev) => Math.max(prev - 1, 1))
        }
        handleNext={() =>
          activeTab === "products"
            ? setProductPage((prev) => Math.min(prev + 1, productTotalPages))
            : setInventoryPage((prev) => Math.min(prev + 1, inventoryTotalPages))
        }
        extraButtons={[
          {
            label: "Edit Price",
            variant: "primary",
            onClick: () => setShowModal(true),
            disabled: activeTab !== "products",
          },
          {
            label: "Audit Stock",
            variant: "secondary",
            onClick: handleAuditStock,
            disabled: activeTab !== "products",
          },
          {
            label: "Change Stock",
            variant: "warning",
            onClick: handleChangeStock,
            disabled: activeTab !== "products",
          },
        ]}
        onTabChange={(key) => {
          setActiveTab(key);
          // Reset page to 1 when switching tab
          if (key === "products") setProductPage(1);
          if (key === "inventory") setInventoryPage(1);
        }}
      />

      {showModal && (
        <GenericModal
          show={showModal}
          title="Add Product"
          onSave={handleAddPrice}
          onClose={() => setShowModal(false)}
          fields={[
            {
              label: "Product",
              controlId: "productId",
              type: "select",
              value: newProductId,
              onChange: (e) => setNewProductId(e.target.value),
              options: products.map((p) => ({ label: p.productName, value: p.productId })),
            },
            {
              label: "Price",
              controlId: "price",
              type: "number",
              value: newPrice,
              onChange: (e) => setNewPrice(e.target.value),
            },
          ]}
        />
      )}

      {showChangeStockModal && (
        <ChangeStockModal
          show={showChangeStockModal}
          onClose={() => {
            setShowChangeStockModal(false);
            setProductChanges([{ productId: "", changeAmount: 0 }]); 
            setImageFile(null); 
          }}
          onSave={handleSubmitChangeStock}
          products={products}
          productChanges={productChanges}
          setProductChanges={setProductChanges}
          imageFile={imageFile}
          setImageFile={setImageFile}
          loading={changeStockLoading}
          mode={modalMode}
        />
      )}
    </div>
  );
}

export default Unauthorized;
