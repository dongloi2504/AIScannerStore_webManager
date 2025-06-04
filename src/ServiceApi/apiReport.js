import instance from "./Customize-Axios";
export function getStoreDashboardReport(storeId) {
  return instance.get(`/api/report/dashboard/store/${storeId}`);
}


export function getProductReport({
  pageNumber,
  pageSize,
  sortBy,
  isDescending,
  dateFrom,
  dateTo,
  storeId,
  productName,
  productCode,
  categoryName,
}) {
  return instance.post("/api/report/product/get", {
    pageNumber,
    pageSize,
    sortBy,
    isDescending,
    query: {
      dateFrom,
      dateTo,
      storeId,
      productName,
      productCode,
      categoryName,
    },
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

export function exportSalesReport({storeId, dateFrom, dateTo}) {
  return instance.get(`/api/report-export/sales/${storeId}`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo
    }
  });
}

export function exportInventoryReport({storeId, dateFrom, dateTo}) {
  return instance.get(`/api/report-export/inventory/${storeId}`, {
    responseType: 'blob',
     params: {
      dateFrom,
      dateTo
    }
  });
}


export function exportProductReport({storeId, dateFrom, dateTo}) {
  return instance.get(`/api/report-export/product/${storeId}`, {
    responseType: 'blob',
     params: {
      dateFrom,
      dateTo
    }
  });
}



export function exportDeviceReport({storeId, dateFrom, dateTo}) {
  return instance.get(`/api/report-export/device/${storeId}`, {
    responseType: 'blob',
    params: {
      dateFrom,
      dateTo
    }
  });
}