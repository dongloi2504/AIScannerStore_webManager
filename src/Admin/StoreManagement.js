  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import './StoreManagement.css';
  import { getStores, deleteStore } from '../ServiceApi/apiAdmin';
  import Button from 'react-bootstrap/Button';
  import CreateStoreModal from './CreateStoreModal';
  import EditStoreModal from './EditStoreModal';

  function StoreManagement() {
    // State cho filter
    const [storeNameFilter, setStoreNameFilter] = useState('');
    const [storeIdFilter, setStoreIdFilter] = useState('');
    const [storeLocationFilter, setStoreLocationFilter] = useState('');

    // Danh sách store (chỉ dữ liệu của trang hiện tại)
    const [stores, setStores] = useState([]);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [totalPages, setTotalPages] = useState(1);

    // Quản lý modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingStore, setEditingStore] = useState(null);

    // Danh sách storeId đã được chọn (checkbox)
    const [selectedStores, setSelectedStores] = useState([]);

    const navigate = useNavigate();

    // Mỗi lần component mount hoặc currentPage thay đổi => loadStores
    useEffect(() => {
      loadStores();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    // Hàm gọi API
    const loadStores = async () => {
      try {
        const response = await getStores({
          storeId: storeIdFilter,
          storeName: storeNameFilter,
          storeLocation: storeLocationFilter,
          pageNumber: currentPage,
          pageSize: pageSize
        });
        console.log("Response data:", response);

        const items = response.items ?? [];
        setStores(items);

        const totalItem = response.totalItem ?? 0;
        const usedPageSize = response.pageSize ?? pageSize;
        setTotalPages(Math.ceil(totalItem / usedPageSize));

        // KHÔNG reset selectedStores[] ở đây => vẫn giữ lựa chọn cũ
        // setSelectedStores([]);  // <-- Xóa dòng này nếu trước đó bạn có
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    // Khi bấm Search => về trang 1 rồi load
    const handleSearch = () => {
      setCurrentPage(1);
      loadStores();
    };

    // Tạo Store
    const handleCreateNewStore = () => {
      setShowCreateModal(true);
    };
    const handleCloseModal = () => {
      setShowCreateModal(false);
    };
    const handleStoreCreated = () => {
      loadStores();
      setShowCreateModal(false);
    };

    // Edit Store
    const handleEditStore = (id) => {
      const storeToEdit = stores.find((s) => s.storeId === id);
      setEditingStore(storeToEdit);
      setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
      setShowEditModal(false);
      setEditingStore(null);
    };
    const handleStoreUpdated = () => {
      loadStores();
      setShowEditModal(false);
      setEditingStore(null);
    };

    // Delete Store
    const handleDeleteStore = async (id) => {
      try {
        await deleteStore(id);
        loadStores();
      } catch (error) {
        console.error('Error deleting store:', error);
      }
    };

    // Logout
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/');
    };

    // Phân trang
    const handleNext = () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    };
    const handlePrev = () => {
      if (currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    };

    // Import / Export (placeholder)
    const handleImport = () => {
      console.log('Import button clicked');
    };
    const handleExport = () => {
      console.log('Export button clicked');
    };

    // =========================
    // CHECKBOX
    // =========================
    // Check All
    const handleCheckAll = (e) => {
      if (e.target.checked) {
        // Chọn tất cả storeId trên trang hiện tại
        const allIds = stores.map((store) => store.storeId);
        // Thêm những id này vào selectedStores (nếu chưa có)
        setSelectedStores((prev) => {
          const setPrev = new Set(prev); // Convert mảng cũ thành set
          allIds.forEach(id => setPrev.add(id));
          return [...setPrev]; // Convert set ngược lại thành mảng
        });
      } else {
        // Bỏ chọn tất cả storeId trên trang hiện tại
        setSelectedStores((prev) => {
          const setPrev = new Set(prev);
          stores.forEach((store) => {
            setPrev.delete(store.storeId);
          });
          return [...setPrev];
        });
      }
    };

    // Check One
    const handleCheckOne = (storeId) => {
      setSelectedStores((prev) => {
        const setPrev = new Set(prev);
        if (setPrev.has(storeId)) {
          setPrev.delete(storeId); // Bỏ chọn
        } else {
          setPrev.add(storeId);    // Chọn
        }
        return [...setPrev];
      });
    };

    // Kiểm tra xem trên trang hiện tại có phải tất cả đều được chọn không
    const isAllChecked = 
      stores.length > 0 &&
      stores.every((s) => selectedStores.includes(s.storeId));

    return (
      <div className="store-management-container">
        {/* Sidebar bên trái */}
        <aside className="sidebar">
          <div className="brand">SMARTSTORE</div>
          <div className="name_after_brand">Admin Page</div>
        </aside>

        {/* Nội dung bên phải */}
        <div className="content">
          {/* Nút Logout góc trên bên phải */}
          <div className="logout-container">
            <Button
              className="logout-btn"
              variant="outline-danger"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          {/* Thanh tiêu đề + nút Create + Import + Export trên cùng một hàng */}
          <div
            className="top-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}
          >
            <h1 className="page-title">Store Management</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                className="create-btn"
                variant="primary"
                onClick={handleCreateNewStore}
              >
                Create New Store
              </Button>
              <Button bsPrefix="import-btn" onClick={handleImport}>
                Import
              </Button>
              <Button bsPrefix="export-btn" onClick={handleExport}>
                Export
              </Button>
            </div>
          </div>

          {/* Khu vực tìm kiếm + nút Search */}
          <div className="search-container" style={{ marginBottom: '1rem' }}>
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
              placeholder="Enter Store Location"
              value={storeLocationFilter}
              onChange={(e) => setStoreLocationFilter(e.target.value)}
            />
            <Button
              className="search-btn"
              variant="secondary"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>

          {/* Bảng hiển thị */}
          <table className="store-table">
            <thead>
              <tr>
                {/* Checkbox All */}
                <th>
                  <input
                    type="checkbox"
                    onChange={handleCheckAll}
                    checked={isAllChecked}
                  />
                </th>
                <th>Store ID</th>
                <th>Store Name</th>
                <th>Store Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.storeId)}
                      onChange={() => handleCheckOne(store.storeId)}
                    />
                  </td>
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
              <Button
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Back
              </Button>
              <Button onClick={handleNext} disabled={currentPage === totalPages}>
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
