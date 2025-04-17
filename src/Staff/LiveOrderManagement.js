import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import LiveOrderEditModal from "../components/LiveOrderEditModal";
import { getLiveOrder, editLiveOrder, getSingleOrder, timeoutOrder } from "../ServiceApi/apiLiveOrder";
import { getProducts } from "../ServiceApi/apiAdmin";
import { useAuth } from "../Authen/AuthContext";

import GenericModal from "../components/GenericModal";  

function LiveOrderManagement() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Paging and data listing
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal for editing
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [productChanges, setProductChanges] = useState([{productId:"", ChangeAmount:0}]);
  const [loading, setLoading] = useState(false);

  // Filters ?
  const [storeId, setStoreId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerPhone, setManagerPhone] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // there is no filter
/*
  const [filters, setFilters] = useState({
    orderId:"",
    total: "",
    status: "",
    createdDate: "",
  });
*/

  // State for editing modal
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingOrderItems, setEditingOrderItems] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState("");
  const [editingOrderImage1, setEditingOrderImage1] = useState("");
  const [editingOrderImage2, setEditingOrderImage2] = useState("");
  const [editingOrderImage3, setEditingOrderImage3] = useState("");

  useEffect(() => {
    loadOrders();
	fetchProducts();
  }, [currentPage]);
  
  const fetchProducts = async () => {
    try {
      const res = await getProducts({ pageNumber: 1, pageSize: 2147483647 });
      setProducts(res?.items || []);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
      setProducts([]);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await getLiveOrder({
        pageNumber: currentPage,
        pageSize: pageSize,
      });
      setOrders(response.items.map(item => ({
		  ...item.device,
		  ...item,
	  })) ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const allOrderIds = useMemo(() => orders.map((m) => m.orderId), [orders]);

  const handleEditLiveOrder = async () => {
      await editLiveOrder({ 
		oldOrderId: editingOrderId,
		staffId: user.staffId,
		items: editingOrderItems.map(x => ({productId: x.productId, count:x.changeAmount}))
	  }).then(x => alert("Order edited"))
	  .catch(e => {
		  alert("Error when editing order:" + e);
		  return;
	  });
      setShowModal(false);
      loadOrders();
      setEditingOrder(null);
	  setEditingOrderId("");
	  setEditingOrderImage1("");
	  setEditingOrderImage2("");
	  setEditingOrderImage3("");
	  setEditingOrderItems([{productId:"", changeAmount:0}]);
  };
  
 // Edit button on one order is clicked
  const triggerEditLiveOrder = (order) => {
	getSingleOrder(order.orderId).then((data) => {
	// Reset data of modal
	  setEditingOrderItems(data.items.map(item => ({productId:item.productId, changeAmount:item.count})));
      setEditingOrderId(order.orderId);
      setEditingOrderImage1(order.image1);
	  setEditingOrderImage2(order.image2);
	  setEditingOrderImage3(order.image3);
	  setShowModal(true);
	}).catch(console.error);
  };
  
  const triggerTimeoutLiveOrder = (order) => {
	if(!window.confirm("Do you really want to time out order " + order.orderCode + "?"))return;
	timeoutOrder(order.orderId).then(r => {
		alert("Request success");
	}).catch(e => alert("Request failed:\n" + e));
  }
  
  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Live Order"
          data={orders}
          columns={[
            { key: "orderCode", label: "Order Code" },
			{ key: "deviceCode", label: "Device Code" },
            { key: "total", label: "Total Price" },
            { key: "createdDate", label: "Create At"},
          ]}
          selectedItems={selectedOrders}
          handleCheckAll={() => {}}
          handleCheckOne={() => {}}
          handleDeleteSelected={() => {}}
          handleSearch={() => {
			  setOrders([]);
			  loadOrders();
		  }}
          filters={[]}
          setFilters={(index, value) => {}}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Edit",
              className: "edit",
              variant: "info",
              onClick: triggerEditLiveOrder,
            },
			{
				label: "Timeout",
				classname: "delete-btn",
				variant: "danger",
				onClick: triggerTimeoutLiveOrder,
			}
          ]}
          // extraButtons={[
          //   {
          //     label: "Edit Order,
          //     variant: "primary",
          //     onClick: showEditModal,
          //   },
          //   {
          //     label: "Delete",
          //     variant: "danger",
          //     // onClick: handleDeleteSelectedManagers,
          //     className: "delete-btn",
          //     disabled: selectedOrders.length === 0,
          //   },
          // ]}
        />
      </div>

      {showModal && (
        <LiveOrderEditModal
          show={showModal}
		  onSave={handleEditLiveOrder}
		  onClose={() => {setShowModal(false);}}
		  productChanges={editingOrderItems}
		  setProductChanges={setEditingOrderItems}
		  products={products}
		  loading={loading}
		  orderId={editingOrderId}
		  image1={editingOrderImage1}
		  image2={editingOrderImage2}
		  image3={editingOrderImage3}
        />
      )}
    </div>
  );
}

export default LiveOrderManagement;