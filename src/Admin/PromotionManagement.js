import { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import CreatePromotionModal from "../components/CreatePromotionModal";
import EditPromotionModal from "../components/EditPromotionModal";
import PromotionOrderDetailModal from "../components/PromotionOrderDetailModal";
import PromotionProductDetailModal from "../components/PromotionProductDetailModal";
import PromotionDepositDetailModal from "../components/PromotionDepositDetailModal";
import { useToast } from "../Context/ToastContext";
import { Role } from "../const/Role";
import { getProducts, getStores } from "../ServiceApi/apiAdmin";
import {
  getPromotionProducts,
  getPromotionOrders,
  getPromotionDeposits,
  postPromotionProduct,
  postPromotionOrder,
  postPromotionDeposit,
  putPromotionProduct,
  putPromotionOrder,
  putPromotionDeposit,
} from "../ServiceApi/apiPromotion";

export default function PromotionManagement() {
  const { showToast } = useToast();

  const [productPromotions, setProductPromotions] = useState([]);
  const [orderPromotions, setOrderPromotions] = useState([]);
  const [depositPromotions, setDepositPromotions] = useState([]);
  const [rawPromotions, setRawPromotions] = useState([]);

  const [filters, setFilters] = useState({
    promotionCode: "",
    isSuspended: false,
  });

  const [activeTab, setActiveTab] = useState("product");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 8;

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [promotionType, setPromotionType] = useState("product");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, []);

  useEffect(() => {
    fetchPromotions(activeTab);
  }, [activeTab, currentPage]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 9999, isSuspended: false });
      setProducts(res.items || []);
    } catch (error) {
      const message = error?.response?.data || "Failed to load products";
      showToast(message, "error");
    }
  };

  const fetchStores = async () => {
    try {
      const res = await getStores({ pageNumber: 1, pageSize: 9999, suspend: false });
      setStores(res.items || []);
    } catch (error) {
      const message = error?.response?.data || "Failed to load stores";
      showToast(message, "error");
    }
  };

  const fetchPromotions = async (type) => {
    setLoading(true);
    try {
      let fetchFn;
      if (type === "order") fetchFn = getPromotionOrders;
      else if (type === "deposit") fetchFn = getPromotionDeposits;
      else fetchFn = getPromotionProducts;

      const res = await fetchFn({
        code: filters.promotionCode,
        isSuspended: filters.isSuspended,
        pageNumber: currentPage,
        pageSize,
      });

      const items = res.items || [];
      const formatted = items.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.detail.name,
        discount: item.detail.isPercentage ? `${item.detail.amount}%` : item.detail.amount,
        priority: item.priority,
        dateRange: `${item.startAt?.split("T")[0] || "-"} → ${item.endAt?.split("T")[0] || "-"}`,
        isSuspended: item.isSuspended,
      }));

      if (type === "product") setProductPromotions(formatted);
      if (type === "order") setOrderPromotions(formatted);
      if (type === "deposit") setDepositPromotions(formatted);

      setRawPromotions(items);
      setTotalPages(Math.ceil((res.totalItem || 0) / pageSize));
    } catch (error) {
      const message = error?.response?.data || `Failed to load ${type} promotions`;
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = (id) => {
    const found = rawPromotions.find((p) => p.id === id);
    if (found) setDetailData(found);
  };

  const handleCloseDetail = () => setDetailData(null);

  const handleEdit = (id) => {
    const found = rawPromotions.find((p) => p.id === id);
    if (found) {
      setEditData(found);
      setPromotionType(activeTab);
      setIsEditing(true);
    }
  };

  const handleCloseEdit = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleSavePromotion = async (payload) => {
    try {
      if (promotionType === "product") await postPromotionProduct(payload);
      else if (promotionType === "order") await postPromotionOrder(payload);
      else if (promotionType === "deposit") await postPromotionDeposit(payload);

      showToast("Promotion created successfully", "success");
      fetchPromotions(activeTab);
      return true;
    } catch (error) {
      const message = error?.response?.data || "Failed to create promotion";
      showToast(message, "error");
    }
  };

  const handleUpdatePromotion = async (payload) => {
    try {
      if (promotionType === "product") await putPromotionProduct(payload);
      else if (promotionType === "order") await putPromotionOrder(payload);
      else if (promotionType === "deposit") await putPromotionDeposit(payload);

      showToast("Promotion updated successfully", "success");
      fetchPromotions(activeTab);
    } catch (error) {
      const message = error?.response?.data || "Failed to update promotion";
      showToast(message, "error");
    } finally {
      handleCloseEdit();
    }
  };

  const handleToggleSuspend = async (id, isCurrentlySuspended) => {
    const promotion = rawPromotions.find((p) => p.id === id);
    if (!promotion) return;

    const payload = { ...promotion, isSuspended: !isCurrentlySuspended };

    try {
      if (activeTab === "product") await putPromotionProduct(payload);
      else if (activeTab === "order") await putPromotionOrder(payload);
      else if (activeTab === "deposit") await putPromotionDeposit(payload);

      showToast(
        isCurrentlySuspended ? "Promotion unsuspended successfully" : "Promotion suspended successfully",
        "success"
      );
      fetchPromotions(activeTab);
    } catch (error) {
      const message = error?.response?.data || "Failed to update promotion";
      showToast(message, "error");
    }
  };

  return (
    <>
      <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Sidebar onToggle={setIsSidebarOpen} />

        <div className="content">
          <DataTable
            title="Promotion Management"
            tabs={[
              {
                key: "product",
                label: "Product Promotions",
                data: productPromotions,
                columns: [
                  { key: "code", label: "Code" },
                  { key: "name", label: "Name" },
                  { key: "discount", label: "Discount" },
                  { key: "priority", label: "Priority" },
                  { key: "dateRange", label: "Date Range" },
                ],
              },
              {
                key: "order",
                label: "Order Promotions",
                data: orderPromotions,
                columns: [
                  { key: "code", label: "Code" },
                  { key: "name", label: "Name" },
                  { key: "discount", label: "Discount" },
                  { key: "priority", label: "Priority" },
                  { key: "dateRange", label: "Date Range" },
                ],
              },
              {
                key: "deposit",
                label: "Deposit Promotions",
                data: depositPromotions,
                columns: [
                  { key: "code", label: "Code" },
                  { key: "name", label: "Name" },
                  { key: "discount", label: "Discount" },
                  { key: "priority", label: "Priority" },
                  { key: "dateRange", label: "Date Range" },
                ],
              },
            ]}
            onTabChange={(key) => setActiveTab(key)}
            loading={loading}
            showCheckboxes={false}
            filters={[
              { label: "Code", value: filters.promotionCode },
              {
                label: "Suspended",
                value: filters.isSuspended,
                type: "checkbox",
                hasLabel: true,
              },
            ]}
            setFilters={(i, v) => {
              const keys = ["promotionCode", "isSuspended"];
              setFilters((prev) => ({ ...prev, [keys[i]]: v }));
            }}
            handleSearch={() => fetchPromotions(activeTab)}
            handlePrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            handleNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            currentPage={currentPage}
            totalPages={totalPages}
            actions={(item) => [
              {
                label: "Detail",
                variant: "outline-primary",
                onClick: () => handleDetail(item.id),
              },
              {
                label: "Edit",
                variant: "outline-warning",
                onClick: () => handleEdit(item.id),
                roles: [Role.ADMIN],
              },
              {
                label: item.isSuspended ? "Unsuspend" : "Suspend",
                variant: item.isSuspended ? "outline-success" : "outline-danger",
                onClick: () => handleToggleSuspend(item.id, item.isSuspended),
                roles: [Role.ADMIN],
              },
            ]}
            extraButtons={[
              {
                label: "Create Product Promotion",
                variant: "primary",
                onClick: () => {
                  setPromotionType("product");
                  setIsCreating(true);
                },
                roles: [Role.ADMIN],
              },
              {
                label: "Create Order Promotion",
                variant: "primary",
                onClick: () => {
                  setPromotionType("order");
                  setIsCreating(true);
                },
                roles: [Role.ADMIN],
              },
              {
                label: "Create Deposit Promotion",
                variant: "primary",
                onClick: () => {
                  setPromotionType("deposit");
                  setIsCreating(true);
                },
                roles: [Role.ADMIN],
              },
            ]}
          />
        </div>

        {isCreating && (
          <CreatePromotionModal
            show={isCreating}
            onClose={() => setIsCreating(false)}
            onSave={handleSavePromotion}
            products={products}
            stores={stores}
            loading={false}
            promotionType={promotionType}
          />
        )}

        {isEditing && (
          <EditPromotionModal
            show={isEditing}
            onClose={handleCloseEdit}
            onSave={handleUpdatePromotion}
            products={products}
            stores={stores}
            loading={false}
            promotionType={promotionType}
            initialData={editData}
          />
        )}
      </div>

      {activeTab === "product" && (
        <PromotionProductDetailModal
          promotion={detailData}
          show={Boolean(detailData)}
          onClose={handleCloseDetail}
        />
      )}

      {activeTab === "order" && (
        <PromotionOrderDetailModal
          promotion={detailData}
          show={Boolean(detailData)}
          onClose={handleCloseDetail}
        />
      )}

      {activeTab === "deposit" && (
        <PromotionDepositDetailModal
          promotion={detailData}
          show={Boolean(detailData)}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}
