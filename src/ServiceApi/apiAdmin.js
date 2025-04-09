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

export function getInventoryByStoreId(storeId, PageNumber = 1, PageSize = 8) {
  return instance.get(`/api/inventory/store/${storeId}`, {
    params: { PageNumber, PageSize },
  });
}

export function updateProductPricesInStore(storeId, prices) {
  return instance.post("/api/inventory/store-price", {
    storeId,
    prices,
  });
}

export function ChangeInventory({
  storeId,
  staffId,
  imageUrl = "",
  description = "",
  items = [],
}) {
  return instance.post("/api/inventory/change", {
    storeId,
    staffId,
    imageUrl,
    description,
    items,
  });
}

function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function uploadfileIO(file) {
  const uuid = generateUUIDv4();
  const extension = file.name.split(".").pop();
  const newFileName = `${uuid}.${extension}`;

  const renamedFile = new File([file.slice()], newFileName, {
    type: file.type,
    lastModified: new Date(),
  });


  const formData = new FormData();
  formData.append("file", renamedFile);

  return instance.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
export function getStoreManagers({ storeId, pageNumber = 1, pageSize = 8 } = {}) {
  return instance.post("/api/store-manager/get", {
    pageNumber,
    pageSize,
    sortBy: "string", // Hoặc thay bằng cột bạn muốn sort
    isDescending: true,
    query: {
      storeId,
      managerId: "",
      managerName: "",
      managerPhone: "",
      managerEmail: ""
    }
  });
}
export function AuditInventory({
  storeId,
  staffId,
  imageUrl = "",
  description = "",
  items = [],
}) {
  return instance.post("/api/inventory/audit", {
    storeId,
    staffId,
    imageUrl,
    description,
    items,
  });
}

export function getInventoryHistoryByStoreId({ storeId, PageNumber = 1, PageSize = 8 }) {
  return instance.get(`/api/inventory/history/store/${storeId}`, {
    params: { PageNumber, PageSize },
  });
}

export function getInventoryDetailById({ id, PageNumber = 1, PageSize = 8 }) {
  return instance.get(`/api/inventory/history/${id}`, {
    params: { PageNumber, PageSize },
  });
}