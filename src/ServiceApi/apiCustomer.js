import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Customer
  export function getCustomer({
    pageNumber = 0,
    pageSize,
    SortBy,
    isDescending = true,
    id,
    name,
    code,
    email,
    phone,
  } = {}) {
    const query = {
      name,
      code,
      email,
      phone,
    };
    if (id) {
      query.id = id;
    }

    return instance.post("/api/customer/get",{
      pageNumber,
      pageSize,
      SortBy,
      isDescending,
      query,
    });
  }
  
  // Hàm cập nhật Staff
  export function updateStaff({ staffId, storeId, staffName, staffPhone, staffEmail, staffCode, role, }) {
    return instance.put("/api/staff", {
      staffId,
      isSuspended: true,
      storeId,
      staffName,
      staffPhone,
      staffEmail,
      staffCode,
      role,
    });
  }


  