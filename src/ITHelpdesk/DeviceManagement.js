import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import "../Styles/DeviceManPage.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { useNavigate } from "react-router-dom";
import {
  getDevices,
  registerDevice,
  suspendDevices,
  registerAndDownloadFile,
} from "../ServiceApi/apiDevice";

import {
  getStores,
} from "../ServiceApi/apiAdmin";

import GenericModal from "../components/GenericModal";

function DeviceManagement() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  
  const [storeId, setStoreId] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [stores, setStores] = useState([]);
  
  const [filters, setFilters] = useState({
    storeName: "",
    storeCode: "",
    deviceCode: "",
	isSuspended: false
  });

  const [editingStore, setEditingStore] = useState(null);
  const [editingStoreName, setEditingStoreName] = useState("");
  const [editingStoreLocation, setEditingStoreLocation] = useState("");

  useEffect(() => {
    loadDevices()
  }, [currentPage]);
  
  useEffect(() => {
	  getStores()
	  .then((res) => setStores(res.items))
	  .catch(alert);
  }, []);

  const loadDevices = async () => {
    try {
      const response = await getDevices({
        pageNumber: currentPage,
        pageSize,
        ...filters,
      });
      setDevices((response.items ?? []).map(item => ({ ...item.store, ...item, suspend: item.isSuspended ? "SUSPENDED" : "" })));
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      alert("Error fetching devices:", error);
    }
  };

  const handleCheckAll = (e) => {
    setSelectedDevices(e.target.checked ? allDeviceIds : []);
  };

  const handleCheckOne = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSuspendDevices = async () => {
    if (selectedDevices.length === 0) return;
  
    const confirmDelete = window.confirm(
      `Are you sure you want to suspend ${selectedDevices.length} device(s)?`
    );
    if (!confirmDelete) return;
  
    try {
      await suspendDevices(selectedDevices);
      setSelectedDevices([]);
      loadDevices(); 
    } catch (err) {
      alert("Error supending devices:", err);
    }
  };

  const handleRegisterDevice = () => {
      registerAndDownloadFile({ deviceCode, storeId, overwrite })
		.then(x => setShowModal(false))
		.catch(alert);
  };

  const showRegisterModal = () => {
    setShowModal(true);
  };

  const allDeviceIds = useMemo(() => devices.map((s) => s.deviceId), [devices]);

  const registerPopupFields = [
    {
      label: "Store",
      controlId: "storeId",
      type: "select",
      value: storeId,
      onChange: (e) => setStoreId(e.target.value),
	  options: stores.map(store => ({label: store.storeName, value: store.storeId})),
    },
    {
      label: "Device Code",
      controlId: "deviceCode",
      type: "text",
      value: deviceCode,
      onChange: (e) => setDeviceCode(e.target.value),
    },
	{
		label: "Overwrite",
		controlId: "overwrite",
		type: "checkbox",
		value: overwrite,
		onChange: (e) => setOverwrite(e.target.checked)
	}
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
          title="Device Management"
          data={devices}
          columns={[
            { key: "storeCode", label: "Store Code" },
            { key: "storeName", label: "Store Name" },
            { key: "deviceCode", label: "Device Code" },
			{ key: "suspend", label: "Suspend" },
          ]}
          selectedItems={selectedDevices}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleSuspendDevices}
          handleSearch={loadDevices}
          filters={[
            { label: "Store name", value: filters.storeName },
            { label: "Store Code", value: filters.storeCode },
            { label: "Device Code", value: filters.deviceCode },
			{ label: "Suspend", value: filters.isSuspended, type:"checkbox", hasLabel:true },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["storeName", "storeCode", "deviceCode", "isSuspended"];
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
          actions={[]}
		  idType={["deviceId"]}
          extraButtons={[
            {
              label: "Register",
              variant: "primary",
              onClick: showRegisterModal,
            },
            {
              label: "Suspend",
              variant: "danger",
              onClick: handleSuspendDevices,
              className: "delete-btn",
              disabled: selectedDevices.length === 0,
            },
          ]}
        />
      </div>

      {/* Create Modal */}
      {showModal && (
        <GenericModal
          show={showModal}
          title="Register Device"
          fields={registerPopupFields}
          onSave={handleRegisterDevice}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default DeviceManagement;
