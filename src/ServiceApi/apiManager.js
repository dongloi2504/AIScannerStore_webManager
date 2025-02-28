import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Manager
  export function getManager({
    pageNumber = 1,
    pageSize,
    managerId,
    storeId,
    managerName,
    managerPhone,
    managerEmail,
  } = {}) {
    return instance.get("/api/store-manager", {
      params: {

      ManagerId: managerId,
      StoreId: storeId,
      ManagerNameQuery: managerName,
      ManagerPhoneQuery: managerPhone,
      ManagerEmailQuery: managerEmail,
      PageNumber: pageNumber,
      PageSize: pageSize,
      }
    });
  }
  
  // Hàm cập nhật Manager
  export function updateManager({ managerId, storeId, managerName, managerPhone, managerEmail }) {
    return instance.put("/api/store-manager", {
      managerId,
      // isSuspended: true,
      storeId,
      managerName,
      managerPhone,
      managerEmail,
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
  
