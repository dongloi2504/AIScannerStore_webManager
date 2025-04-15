import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import {
  getStores,
  deleteStore,
  createStore,
  updateStore,
} from "../ServiceApi/apiAdmin";
import GenericModal from "../components/GenericModal";

function StoreManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [imageUrl, setImageURL] = useState("");
  const [storeCode, setStoreCode] = useState("");
  const [filters, setFilters] = useState({
    storeName: "",
    storeCode: "",
    storeAddress: "",
  });

  const [editingStore, setEditingStore] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState("");
  const [editingStoreAddress, setEditingStoreAddress] = useState("");
  const [editingStoreCode, setEditingStoreCode] = useState("");
  const [editingImageURL] = useState("");

  useEffect(() => {
    loadStores();
  }, [currentPage]);

  const loadStores = async () => {
    try {
      const response = await getStores({
        pageNumber: currentPage,
        pageSize,
        ...filters,
      });

      setStores(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleDetailStore = (store) => {
    navigate(`/store-detail/${store.storeId}`, { state: { store } });
  };

  const handleCheckAll = (e) => {
    setSelectedStores(e.target.checked ? allStoreIds : []);
  };

  const handleCheckOne = (storeId) => {
    setSelectedStores((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleDeleteSelectedStores = async () => {
    if (selectedStores.length === 0) return;
  
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedStores.length} store(s)?`
    );
    if (!confirmDelete) return;
  
    try {
      await deleteStore(selectedStores);
  
      setSelectedStores([]);
      loadStores(); 
    } catch (err) {
      console.error("Error deleting stores:", err);
    }
  };

  const handleCreateStore = async () => {
    try {
      await createStore({ storeName, storeAddress, imageUrl, storeCode });
      setShowModal(false);
      loadStores();
      setStoreName("");
      setStoreAddress("");
      setImageURL("");
      setStoreCode("");
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setEditingStoreName(store.storeName);
    setEditingStoreAddress(store.storeAddress);
    setEditingStoreCode(store.storeCode);
  };

  const handleUpdateStore = async () => {
    try {
      await updateStore({
        storeId: editingStore.storeId,
        storeCode: editingStoreCode,
        storeName: editingStoreName,
        storeAddress: editingStoreAddress,
        imageUrl: editingImageURL,
      });
      setEditingStore(null);
      loadStores();
    } catch (error) {
      console.error("Error updating store:", error);
    }
  };

  const handleCreateNewStore = () => {
    setShowModal(true);
  };

  const allStoreIds = useMemo(() => stores.map((s) => s.storeId), [stores]);

  const storeFields = [
    {
      label: "Store Code",
      controlId: "storeCode",
      type: "text",
      value: storeCode,
      onChange: (e) => setStoreCode(e.target.value),
    },
    {
      label: "Store Name",
      controlId: "storeName",
      type: "text",
      value: storeName,
      onChange: (e) => setStoreName(e.target.value),
    },
    {
      label: "Store Address",
      controlId: "storeAddress",
      type: "text",
      value: storeAddress,
      onChange: (e) => setStoreAddress(e.target.value),
    },
  ];

  return (
    <div
      className={`page-container ${
        isSidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Store Management"
          data={stores}
          columns={[
            { key: "storeCode", label: "Store Code" },
            { key: "storeName", label: "Store Name" },
            { key: "storeAddress", label: "Address" },
          ]}
          selectedItems={selectedStores}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedStores}
          handleSearch={loadStores}
          filters={[
            { label: "Store Name", value: filters.storeName },
            { label: "Store Code", value: filters.storeCode },
            { label: "Address", value: filters.storeAddress },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["storeName", "storeCode", "storeAddress"];
            setFilters((prev) => ({ ...prev, [filterKeys[index]]: value }));
          }}
          handlePrev={() =>
            setCurrentPage((prev) => Math.max(prev - 1, 1))
          }
          handleNext={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Edit",
              className: "edit",
              variant: "info",
              onClick: (item) => handleEditStore(item),
            },
            {
              label: "Detail",
              className: "detail",
              variant: "secondary",
              onClick: (item) => handleDetailStore(item),
            },
          ]}
          extraButtons={[
            {
              label: "Create New",
              variant: "primary",
              onClick: handleCreateNewStore,
            },
            {
              label: "Delete",
              variant: "danger",
              onClick: handleDeleteSelectedStores,
              className: "delete-btn",
              disabled: selectedStores.length === 0,
            },
          ]}
        />
      </div>

      {/* Create Modal */}
      {showModal && (
        <GenericModal
          show={showModal}
          title="Create New Store"
          fields={storeFields}
          onSave={handleCreateStore}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingStore && (
        <GenericModal
          show={true}
          title="Edit Store"
          fields={[
            {
              label: "Store Code",
              controlId: "editStoreCode",
              type: "text",
              value: editingStoreCode,
              onChange: (e) => setEditingStoreCode(e.target.value),
            },
            {
              label: "Store Name",
              controlId: "editStoreName",
              type: "text",
              value: editingStoreName,
              onChange: (e) => setEditingStoreName(e.target.value),
            },
            {
              label: "Store Address",
              controlId: "editStoreAddress",
              type: "text",
              value: editingStoreAddress,
              onChange: (e) => setEditingStoreAddress(e.target.value),
            },
          ]}
          onSave={handleUpdateStore}
          onClose={() => setEditingStore(null)}
        />
      )}
    </div>
  );
}

export default StoreManagement;
