import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Customer
  export function getCustomer({
    pageNumber = 0,
    pageSize,
    SortBy,
    isDescending = true,
    customerId,
    customerName,
    isSuspended = true,
    customerCode,
    customerEmail,
    customerPhone,
  } = {}) {
    const query = {
      id: customerId,
      name: customerName,
      isSuspended,
      code: customerCode,
      email: customerEmail,
      phone: customerPhone,
    };

    // if (staffId) {
    //   query.staffId = staffId;
    // }

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
  