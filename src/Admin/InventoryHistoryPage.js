import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import GenericDetail from "../components/GenericDetail";
import { getInventoryDetailById } from "../ServiceApi/apiAdmin";

function InventoryHistoryPage() {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [store, setStore] = useState(location.state?.store || null);

  const [items, setItems] = useState([]);
  const [headerInfo, setHeaderInfo] = useState(null);

  useEffect(() => {
    if (noteId) {
      fetchNoteDetail();
    }
  }, [noteId]);

  const fetchNoteDetail = async () => {
    try {
      const res = await getInventoryDetailById({ id: noteId });

      if (res) {
        setItems(res.items || []);

        setHeaderInfo({
          staffName: res.staff?.staffName || "-",
          type: res.type || "-",
          date: new Date(res.createTime).toLocaleDateString() || "-",
          imageUrl: res.imageUrl || "",
        });

        // fallback nếu store chưa có (do refresh mất state)
        if (!store && res.store) {
          setStore(res.store);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching inventory note detail:", err);
      setItems([]);
      setHeaderInfo(null);
    }
  };

  if (!store) {
    return (
      <GenericDetail
        onBack={() => navigate(-1)}
        notFound
        notFoundMessage="Store not found. Please go back."
      />
    );
  }

  const tableData = {
    columns: ["Product ID", "Product Name", "Before", "Change", "After"],
    rows: items.map((item) => [
      item.productInfo?.productId || "-",
      item.productInfo?.productName || "-",
      item.beforeChange ?? "-",
      item.stockChange > 0 ? `+${item.stockChange}` : item.stockChange,
      (item.beforeChange ?? 0) + (item.stockChange ?? 0),
    ]),
  };

  const infoRows = [
    { label: "Store Name", value: store.storeName },
    { label: "Location", value: store.storeLocation },
    ...(headerInfo
      ? [
        { label: "Staff", value: headerInfo.staffName },
        { label: "Type", value: headerInfo.type },
        { label: "Date", value: headerInfo.date },
      ]
      : []),
  ];

  return (
    <div className="inventory-history-page">
      <GenericDetail
        onBack={() => navigate(-1)}
        title="Inventory Note Detail"
        infoRows={infoRows}
        imageUrls={[headerInfo?.imageUrl].filter(Boolean)}
        productData={tableData}
      />
    </div>
  );
}

export default InventoryHistoryPage;
