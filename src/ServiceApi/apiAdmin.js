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
  pageSize,
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
export function deleteStore(ids) {
  return instance.delete(`/api/store`, {
    data: { items: ids },
    headers: { "Content-Type": "application/json" }, 
  });
}


// Hàm cập nhật store (PUT /api/store/{id})
export function updateStore({ storeId, storeName, storeLocation }) {
  return instance.put("/api/store", {
    storeId,
    storeName,
    storeLocation,
  });
}

// Hàm úp ảnh (POST /api/upload)
export function uploadfile(file) {
  // Tạo một đối tượng FormData để chứa file upload
  const formData = new FormData();
  formData.append("file", file);

  // Gửi request POST kèm formData
  return instance.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
// Lấy sản phẩm thông qua các giá trị của sản phẩm
export function getProducts({
  pageNumber = 0,
  pageSize = 8,
  productNameQuery,
  descriptionQuery,
  categoryIds = [],
  productId = null, // Thêm productId vào
  minPrice = null,
  maxPrice = null,
  isSuspended = false,
} = {}) {
  const query = {
    productNameQuery,
    descriptionQuery,
    categoryIds,
    minPrice,
    maxPrice,
    isSuspended,
  };

  // Nếu có productId, chỉ tìm theo productId
  if (productId) {
    query.productId = productId;
  }

  return instance.post("/api/product/get", {
    pageNumber,
    pageSize,
    query,
  });
}