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
  const [storeLocation, setStoreLocation] = useState("");
  const [filters, setFilters] = useState({
    storeName: "",
    storeId: "",
    storeLocation: "",
  });

  const [editingStore, setEditingStore] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState("");
  const [editingStoreLocation, setEditingStoreLocation] = useState("");

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
      const deletePromises = selectedStores.map((id) => deleteStore(id));
      const results = await Promise.allSettled(deletePromises);
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length > 0) {
        console.error(`❌ Failed to delete ${failed.length} store(s).`);
      }

      setSelectedStores([]);
      loadStores();
    } catch (err) {
      console.error("Error deleting stores:", err);
    }
  };

  const handleCreateStore = async () => {
    try {
      await createStore({ storeName, storeLocation });
      setShowModal(false);
      loadStores();
      setStoreName("");
      setStoreLocation("");
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setEditingStoreName(store.storeName);
    setEditingStoreLocation(store.storeLocation);
  };

  const handleUpdateStore = async () => {
    try {
      await updateStore({
        storeId: editingStore.storeId,
        storeName: editingStoreName,
        storeLocation: editingStoreLocation,
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
      label: "Store Name",
      controlId: "storeName",
      type: "text",
      value: storeName,
      onChange: (e) => setStoreName(e.target.value),
    },
    {
      label: "Store Location",
      controlId: "storeLocation",
      type: "text",
      value: storeLocation,
      onChange: (e) => setStoreLocation(e.target.value),
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
            { key: "storeId", label: "Store ID" },
            { key: "storeName", label: "Store Name" },
            { key: "storeLocation", label: "Location" },
          ]}
          selectedItems={selectedStores}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedStores}
          handleSearch={loadStores}
          filters={[
            { label: "Store Name", value: filters.storeName },
            { label: "Store ID", value: filters.storeId },
            { label: "Location", value: filters.storeLocation },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["storeName", "storeId", "storeLocation"];
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
              label: "Store Name",
              controlId: "editStoreName",
              type: "text",
              value: editingStoreName,
              onChange: (e) => setEditingStoreName(e.target.value),
            },
            {
              label: "Store Location",
              controlId: "editStoreLocation",
              type: "text",
              value: editingStoreLocation,
              onChange: (e) => setEditingStoreLocation(e.target.value),
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
