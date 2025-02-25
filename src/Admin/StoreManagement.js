import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoreManagement.css';
import { getStores, deleteStore } from '../ServiceApi/apiAdmin';
import Button from 'react-bootstrap/Button';
import CreateStoreModal from './CreateStoreModal';
import EditStoreModal from './EditStoreModal';

function StoreManagement() {
  // Các state cho ô lọc
  const [storeNameFilter, setStoreNameFilter] = useState('');
  const [storeIdFilter, setStoreIdFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [storeLocationFilter, setStoreLocationFilter] = useState('');

  // State chứa danh sách store (lấy từ API)
  const [stores, setStores] = useState([]);

  // Quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State mở/đóng modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  // Hook điều hướng
  const navigate = useNavigate();

  // Gọi API lấy danh sách store khi component mount
  useEffect(() => {
    loadStores();
  }, []);

  // Hàm load store từ API
  const loadStores = async () => {
    try {
      const data = await getStores();
      const rawItems = data.items || [];
      setStores(rawItems);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  // Bấm "Create New Store" => mở modal
  const handleCreateNewStore = () => {
    setShowCreateModal(true);
  };

  // Đóng modal => setShowCreateModal(false)
  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  // Khi tạo store thành công => load lại danh sách, đóng modal
  const handleStoreCreated = () => {
    loadStores();
    setShowCreateModal(false);
  };

  
  // Lọc dữ liệu
  const filteredStores = stores.filter((store) => {
    return (
      store.storeId?.toLowerCase().includes(storeIdFilter.toLowerCase()) &&
      store.storeName?.toLowerCase().includes(storeNameFilter.toLowerCase()) &&
      store.storeLocation?.toLowerCase().includes(storeLocationFilter.toLowerCase())
    );
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm Logout
  const handleLogout = () => {
    console.log('Logged out');
    // localStorage.removeItem('token'); // nếu cần xoá token
    navigate('/');
  };

  // Hàm Edit Store (chỉ demo)
 // Bấm "Edit" => tìm store => mở modal Edit
 const handleEditStore = (id) => {
    // Tìm store trong mảng stores
    const storeToEdit = stores.find((s) => s.storeId === id);
    setEditingStore(storeToEdit);
    setShowEditModal(true);
  };

  // Đóng modal Edit
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStore(null);
  };

  const handleStoreUpdated = () => {
    loadStores();
    setShowEditModal(false);
    setEditingStore(null);
  };
  // Hàm Delete Store
  const handleDeleteStore = async (id) => {
    try {
      await deleteStore(id);
      console.log('Store deleted successfully');
      loadStores();
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  return (
    <div className="store-management-container">
      {/* Sidebar bên trái */}
      <aside className="sidebar">
        <div className="brand">SMARTSTORE</div>
        <div className="name_after_brand"> Admin Page</div>
      </aside>

      {/* Nội dung bên phải */}
      <div className="content">
        {/* Nút Logout góc trên bên phải */}
        <div className="logout-container">
          <Button className="logout-btn" variant="outline-danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Tiêu đề */}
        <h1 className="page-title">Store Management</h1>

        {/* Khu vực tìm kiếm + nút Create */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter Store Name"
            value={storeNameFilter}
            onChange={(e) => setStoreNameFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Store ID"
            value={storeIdFilter}
            onChange={(e) => setStoreIdFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Manager"
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Store Location"
            value={storeLocationFilter}
            onChange={(e) => setStoreLocationFilter(e.target.value)}
          />
          <Button className="create-btn" onClick={handleCreateNewStore}>
            Create New Store
          </Button>
        </div>

        {/* Bảng hiển thị */}
        <table className="store-table">
          <thead>
            <tr>
              <th>Store ID</th>
              <th>Store Name</th>
              <th>Store Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentStores.map((store, index) => (
              <tr key={index}>
                <td>{store.storeId}</td>
                <td>{store.storeName}</td>
                <td>{store.storeLocation}</td>
                <td>
                  <Button
                    className="action-btn edit"
                    variant="info"
                    onClick={() => handleEditStore(store.storeId)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="action-btn delete"
                    variant="danger"
                    onClick={() => handleDeleteStore(store.storeId)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Phân trang */}
        <div className="pagination">
          <div className="pagination-left">
            <Button className="pagination-btn" onClick={handlePrev} disabled={currentPage === 1}>
              Back
            </Button>
            <Button className="pagination-btn" onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
          <div className="pagination-right">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Modal tạo Store */}
      {showCreateModal && (
        <CreateStoreModal
          onClose={handleCloseModal}
          onStoreCreated={handleStoreCreated}
        />
      )}
        {/* Modal Edit */}
        {showEditModal && editingStore && (
        <EditStoreModal
          store={editingStore}
          onClose={handleCloseEditModal}
          onStoreUpdated={handleStoreUpdated}
        />
      )}
    </div>
  );
}

export default StoreManagement;
