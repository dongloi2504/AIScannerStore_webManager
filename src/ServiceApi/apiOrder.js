import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách order
  export function getOrder({
    pageNumber = 0,
    pageSize,
    sortBy,
    isDescending = true,
    customerId,
    customerCode,
    deviceCode,
    storeCode,
    storeId,
    statuses = [],
    minTotalAmount = 0,
    maxTotalAmount = 0,
    isCorrection = true,
    isFlagged = true,
    orderCode,
  } = {}) {
    const query = {
      customerId,
      customerCode,
      deviceCode,
      storeCode,
      storeId,
      statuses,
      orderCode,
      isCorrection,
      isFlagged,
    };
    return instance.post("/api/order/get",{
      pageNumber,
      pageSize,
      sortBy,
      isDescending,
      query,
      minTotalAmount,
      maxTotalAmount,
      isCorrection,
      isFlagged,
    });
  }
  
  // Hàm cập nhật Order
  export function updateOrder({ fixedOrderId, staffId, items }) {
    return instance.post("/api/order/correction", {
      fixedOrderId,
      staffId,
      items,
    });
  }

  // Hàm tạo Manager
export function createManager({ storeId, managerName, managerPhone, managerEmail, password }) {
    return instance.post("/api/store-manager", {
      storeId,
      managerName,
      managerPhone,
      managerEmail,
      password,
    });
  }

  // Hàm xoá Manager
  export function deleteManager(ids) {
    return instance.delete(`/api/store-manager`, {
      data: ids ,
      headers: { "Content-Type": "application/json" }, 
    });
  }

  export function orderdetail(id) {
    return instance.get(`/api/order/${id}`);
  }
  