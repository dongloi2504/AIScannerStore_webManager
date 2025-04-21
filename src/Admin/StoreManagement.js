import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import {
  uploadfileIO,
  getStores,
  deleteStore,
  createStore,
  updateStore,
} from "../ServiceApi/apiAdmin";
import GenericModal from "../components/GenericModal";
import { useToast } from "../Context/ToastContext";

function StoreManagement() {
  const { showToast } = useToast();
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
  const [storeImageFile, setStoreImageFile] = useState(null);
  const [filters, setFilters] = useState({
    storeName: "",
    storeCode: "",
    storeAddress: "",
	suspend: false,
  });

  const [editingStore, setEditingStore] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState("");
  const [editingStoreAddress, setEditingStoreAddress] = useState("");
  const [editingStoreCode, setEditingStoreCode] = useState("");
  const [editingImageURL] = useState("");
  const [editingStoreImageFile, setEditingStoreImageFile] = useState(null);
  const [editingStoreSuspend, setEditingStoreSuspend] = useState(false);

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
      `Are you sure you want to suspend ${selectedStores.length} store(s)?`
    );
    if (!confirmDelete) return;
  
    try {
      await deleteStore(selectedStores);
	  showToast("Store suspended!", "info");
      setSelectedStores([]);
      loadStores(); 
    } catch (error) {
      const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
	  showToast(message, "error");
	  throw error;
    }
  };

  const handleCreateStore = async () => {
    try {
	  let uploadedImageUrl = "";
      if (storeImageFile) {
        // Sử dụng uploadfileIO thay vì uploadfile
        const uploadRes = await uploadfileIO(storeImageFile);
        // Giả sử URL được trả về nằm trong uploadRes.image_url hoặc uploadRes.url, tùy theo API trả về
        uploadedImageUrl = uploadRes?.image_url || uploadRes?.url || uploadRes;
      }
      await createStore({ storeName, storeAddress, imageUrl: uploadedImageUrl, storeCode });
      setShowModal(false);
      loadStores();
      setStoreName("");
      setStoreAddress("");
      setStoreImageFile(null);
      setStoreCode("");
	  showToast("Store Created!", "info");
    } catch (error) {
      	const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
    }
  };

  const handleEditStore = (store) => {
    setEditingStore(store);
    setEditingStoreName(store.storeName);
    setEditingStoreAddress(store.storeAddress);
    setEditingStoreCode(store.storeCode);
	setEditingStoreSuspend(store.isSuspended);
  };

  const handleUpdateStore = async () => {
    try {
	  	  // Keep the old image if nothing uploaded
	  let uploadedImageUrl = editingStore.imageUrl;
      if (storeImageFile) {
        // Sử dụng uploadfileIO thay vì uploadfile
        const uploadRes = await uploadfileIO(storeImageFile);
        // Giả sử URL được trả về nằm trong uploadRes.image_url hoặc uploadRes.url, tùy theo API trả về
        uploadedImageUrl = uploadRes?.image_url || uploadRes?.url || uploadRes;
      }
      await updateStore({
        storeId: editingStore.storeId,
        storeCode: editingStoreCode,
        storeName: editingStoreName,
        storeAddress: editingStoreAddress,
        imageUrl: uploadedImageUrl,
		isSuspended: editingStoreSuspend,
      });
      setEditingStore(null);
      loadStores();
	  showToast("Store Updated!", "info");
    } catch (error) {
        const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
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
	  required:true,
      onChange: (e) => setStoreCode(e.target.value),
    },
    {
      label: "Store Name",
      controlId: "storeName",
      type: "text",
      value: storeName,
	  required:true,
      onChange: (e) => setStoreName(e.target.value),
    },
    {
      label: "Store Address",
      controlId: "storeAddress",
      type: "text",
      value: storeAddress,
      onChange: (e) => setStoreAddress(e.target.value),
    },
	{
      label: "Store Image",
      controlId: "storeImage",
      type: "file",
      onChange: (e) => setStoreImageFile(e.target.files[0]),
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
			{ label: "Suspend", value: filters.suspend, type:"checkbox", hasLabel:true },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["storeName", "storeCode", "storeAddress", "suspend"];
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
              label: "Suspend",
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
			  required:true,
              onChange: (e) => setEditingStoreCode(e.target.value),
            },
            {
              label: "Store Name",
              controlId: "editStoreName",
              type: "text",
              value: editingStoreName,
			  required:true,
              onChange: (e) => setEditingStoreName(e.target.value),
            },
            {
              label: "Store Address",
              controlId: "editStoreAddress",
              type: "text",
              value: editingStoreAddress,
              onChange: (e) => setEditingStoreAddress(e.target.value),
            },
			{
			  label: "Suspend",
			  controlId: "editStoreSuspend",
			  type: "checkbox",
			  value: editingStoreSuspend,
			  onChange: (e) => setEditingStoreSuspend(e.target.checked),
			},
			{
	          label: "Store Image",
              controlId: "storeImage",
              type: "file",
              onChange: (e) => setStoreImageFile(e.target.files[0]),
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
