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
	storeCode,
	isSuspended,
  } = {}) {
    const query = {
      storeId,
      staffName,
      staffPhone,
      staffEmail,
      role,
      staffCode,
	  isSuspended,
	  storeCode,
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
  export function updateStaff({ staffId, storeId, staffName, staffPhone, staffEmail, staffCode, role, isSuspended }) {
    return instance.put("/api/staff", {
      staffId,
      isSuspended,
      storeId,
      staffName,
      staffPhone,
      staffEmail,
      staffCode,
      role,
    });
  }

  // Hàm tạo Staff
export function createStaff({ storeId, staffName, staffPhone, staffEmail, password, staffCode, role, }) {
    return instance.post("/api/staff", {
      storeId,
      staffName,
      staffPhone,
      staffEmail,
      staffCode,
      role,
      password,
    });
  }

  // Hàm xoá Staff
  export function deleteStaff(ids ) {
    return instance.delete(`/api/staff`, {
      data: [ids] ,
      headers: { "Content-Type": "application/json" },
    });
  }
  