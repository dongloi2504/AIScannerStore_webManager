import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Staff
  export function getStaff({
    pageNumber = 0,
    pageSize,
    SortBy,
    isDescending = true,
    staffId,
    storeId,
    staffName,
    staffPhone,
    staffEmail,
    role,
    staffCode,
  } = {}) {
    const query = {
      storeId,
      staffName,
      staffPhone,
      staffEmail,
      role,
      staffCode,
    };

    if (staffId) {
      query.staffId = staffId;
    }

    return instance.post("/api/staff/get",{
      pageNumber,
      pageSize,
      SortBy,
      isDescending,
      query,
    });
  }
  
  // Hàm cập nhật Staff
  export function updateManager({ managerId, storeId, managerName, managerPhone, managerEmail }) {
    return instance.put("/api/store-manager", {
      managerId,
      isSuspended: true,
      storeId,
      managerName,
      managerPhone,
      managerEmail,
    });
  }

  // Hàm tạo Staff
export function createManager({ storeId, managerName, managerPhone, managerEmail, password }) {
    return instance.post("/api/store-manager", {
      storeId,
      managerName,
      managerPhone,
      managerEmail,
      password,
    });
  }

  // Hàm xoá Staff
  export function deleteManager(ids ) {
    return instance.delete(`/api/store-manager`, {
      data: {ids : [ids]} ,
      headers: { "Content-Type": "application/json" },
    });
  }
  