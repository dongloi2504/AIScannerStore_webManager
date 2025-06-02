import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GenericModal from "../components/GenericModal";
import ChangeStockModal from "../components/ChangeStockModal";
import InventoryHistoryModal from "../components/InventoryHistoryModal";
import {
  getInventoryByStoreId,
  updateProductPricesInStore,
  getProducts,
  inventoryInbound,
  inventoryOutbound,
  AuditInventory,
  uploadfileIO,
  getInventoryHistoryByStoreId,
  getSingleStore,
} from "../ServiceApi/apiAdmin";
import { Role } from "../const/Role";
import { FullScreenModal } from "../components/FullScreenModal";

function StoreDetail() {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
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

  const [stockAction, setStockAction] = useState("in"); // "in" or "out"
  const [showInventoryDetail, setShowInventoryDetail] = useState(null);

  const [activeTab, setActiveTab] = useState("products");

  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);

  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!store) {
      setLoading(true);
      getSingleStore(storeId)
        .then((res) => {
          setStore(res);
          console.log(JSON.stringify(res));
        })
        .catch(console.err)
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (!store?.storeId) return;
    fetchProducts();
    fetchInventory(productPage);
    fetchInventoryHistory(inventoryPage);
  }, [store]);

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

  const handleChangeStock = (type) => {
    setModalMode("change");
    setStockAction(type);
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
        changeAmount: stockAction === "out"
          ? -Math.abs(Number(p.changeAmount))
          : Math.abs(Number(p.changeAmount)),
      })),
    };

    try {
      if (modalMode === "audit") {
        await AuditInventory({ ...payload, description: "Audit from frontend" });
      } else {
        if (stockAction === "out") {
          await inventoryOutbound(payload);
        } else {
          await inventoryInbound(payload);
        }
      }
      fetchInventory(productPage);
      fetchInventoryHistory(inventoryPage);
      setShowChangeStockModal(false);
      setImageFile(null);
      setProductChanges([{ productId: "", changeAmount: 0 }]);
    } catch (err) {
      console.error(`❌ Failed to ${modalMode === "audit" ? "audit" : stockAction} stock:`, err);
    } finally {
      setChangeStockLoading(false);
    }
  };

  const infoRows = [
    { label: "Store ID", value: store?.storeId },
    { label: "Store Name", value: store?.storeName },
    { label: "Store Code", value: store?.storeCode },
    { label: "Location", value: store?.storeLocation },
  ];

  const productData = {
    columns: ["Product Code", "Product Name", "Price", "Stock"],
    rows: inventory.map((item) => [
      item.code,
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
        onClick: () => setShowInventoryDetail(item.inventoryNoteId),
      },
    ]),
  };

  const tabs = [
    { key: "products", label: "Products", data: productData },
    { key: "inventory", label: "Inventory I/O", data: ioData },
  ];

  return (
    <div className="store-detail-container">
      <FullScreenModal
        show={true}
        modalTitle={"Store Detail"}
        loading={loading}
        onClose={() => navigate(-1)}
        title="Store Detail"
        infoRows={infoRows}
        tabs={tabs}
        itemKey={null}
        imageUrls={[store?.imageUrl].filter(Boolean)}
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
            roles: [Role.ADMIN],
          },
          {
            label: "Audit Stock",
            variant: "secondary",
            onClick: handleAuditStock,
            disabled: activeTab !== "products",
            roles: [Role.ADMIN, Role.MANAGER],
          },
          {
            label: "Stock In",
            variant: "success",
            onClick: () => handleChangeStock("in"),
            disabled: activeTab !== "products",
            roles: [Role.ADMIN, Role.MANAGER],
          },
          {
            label: "Stock Out",
            variant: "danger",
            onClick: () => handleChangeStock("out"),
            disabled: activeTab !== "products",
            roles: [Role.ADMIN, Role.MANAGER],
          },
        ]}
        onTabChange={(key) => {
          setActiveTab(key);
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
              onChange: (e) => {
                const val = e.target.value;
                if (!val || (/^\d+$/.test(val) && Number(val) >= 0)) {
                  setNewPrice(val);
                }
              },
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

      {showInventoryDetail && (
        <InventoryHistoryModal
          noteId={showInventoryDetail}
          storeId={store?.storeId}
          onClose={() => setShowInventoryDetail(null)}
        />
      )}
    </div>
  );
}

export default StoreDetail;