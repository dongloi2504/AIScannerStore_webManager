// InventoryHistoryModal.jsx
import React, { useEffect, useState } from "react";
import { getInventoryDetailById } from "../ServiceApi/apiAdmin";
import { FullScreenModal } from "./FullScreenModal";

const InventoryHistoryModal = ({ noteId, storeId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getInventoryDetailById({ id: noteId });
        if (!res) throw new Error("No data found");

        setDetail(res);
      } catch (err) {
        console.error("❌ Error fetching inventory detail:", err);
        setError("Failed to load inventory detail.");
      } finally {
        setLoading(false);
      }
    };

    if (noteId) fetchDetail();
  }, [noteId]);

  const infoRows = detail
    ? [
        { label: "Staff", value: detail.staff?.staffName || "-" },
        { label: "Type", value: detail.type },
        { label: "Date", value: new Date(detail.createTime).toLocaleDateString() },
        ...(detail.store
          ? [
              { label: "Store Name", value: detail.store.storeName },
              { label: "Location", value: detail.store.storeLocation },
            ]
          : []),
      ]
    : [];

  const tableData = {
    columns: ["Product Code", "Product Name", "Before", "Change", "After"],
    rows:
      detail?.items?.map((item) => [
        item.productInfo?.productCode || "-",
        item.productInfo?.productName || "-",
        item.beforeChange ?? "-",
        item.stockChange > 0 ? `+${item.stockChange}` : item.stockChange,
        (item.beforeChange ?? 0) + (item.stockChange ?? 0),
      ]) || [],
  };

  return (
    <FullScreenModal
      show={!!noteId}
      modalTitle="Inventory Note Detail"
      loading={loading}
      error={error}
      onClose={onClose}
      infoRows={infoRows}
      productData={tableData}
      imageUrls={[detail?.imageUrl].filter(Boolean)}
    />
  );
};

export default InventoryHistoryModal;
