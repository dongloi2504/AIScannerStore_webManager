import instance from "./Customize-Axios";
export function getStoreDashboardReport(storeId) {
  return instance.get(`/api/report/dashboard/store/${storeId}`);
}


export function getProductReport({ pageNumber, pageSize, sortBy, isDescending, dateFrom, dateTo, storeId }) {
  return instance.post("/api/report/product/get", {
    pageNumber,
    pageSize,
    sortBy,
    isDescending,
    query: {
      dateFrom,
      dateTo,
      storeId
    }
  });
}

export function getSalesReport({ storeId, productId, dateFrom, dateTo }) {
  return instance.get("/api/report/sales", {
    params: {
      StoreId: storeId,
      ProductId: productId, 
      DateFrom: dateFrom,   
      DateTo: dateTo,
    },
  });
}

export function getDeviceReport({ pageNumber, pageSize, sortBy, isDescending, dateFrom, dateTo, storeId }) {
  return instance.post("/api/report/device/get", {
    pageNumber,
    pageSize,
    sortBy,
    isDescending,
    query: {
      dateFrom,
      dateTo,
      storeId,
    },
  });
}

export function exportSalesReport(storeId) {
  return instance.get(`/api/report-export/sales/${storeId}`, {
    responseType: 'blob',
  });
}

export function exportInventoryReport(storeId) {
  return instance.get(`/api/report-export/inventory/${storeId}`, {
    responseType: 'blob',
  });
}


export function exportProductReport(storeId) {
  return instance.get(`/api/report-export/product/${storeId}`, {
    responseType: 'blob',
  });
}



export function exportDeviceReport(storeId) {
  return instance.get(`/api/report-export/device/${storeId}`, {
    responseType: 'blob',
  });
}