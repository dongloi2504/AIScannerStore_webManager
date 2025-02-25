// apiAdmin.js
import instance from "./Customize-Axios";

// Hàm tạo store
export function createStore({ storeName, storeLocation }) {
  return instance.post("/api/store", {
    storeName,
    storeLocation,
  });
}

// Hàm lấy danh sách store
export function getStores({
  storeId,
  storeName,
  storeLocation,
  pageNumber = 1,
  pageSize = 8
} = {}) {
  return instance.get("/api/store", {
    params: {
      StoreId: storeId,
      StoreNameQuery: storeName,
      StoreAddressQuery: storeLocation,
      PageNumber: pageNumber,
      PageSize: pageSize,
    }
  });
}
// Hàm xoá store
export function deleteStore(id) {
  return instance.delete(`/api/store/${id}`);
}

// Hàm cập nhật store (PUT /api/store/{id})
export function updateStore({ storeId, storeName, storeLocation }) {
  return instance.put("/api/store", {
    storeId,
    storeName,
    storeLocation,
  });
}
