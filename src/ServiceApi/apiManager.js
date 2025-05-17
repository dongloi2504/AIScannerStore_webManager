import instance from "./Customize-Axios";
export function getEditRequestsByStore({
  storeId,
  orderCode,
  status,
  customerEmail,
  staffEmail,
  pageNumber = 1,
  pageSize = 10,
  sortBy,
  isDescending = true,
} = {}) {
  const query = {
    OrderCode: orderCode,
    Status: status,
    CustomerEmail: customerEmail,
    StaffEmail: staffEmail,
    PageNumber: pageNumber,
    PageSize: pageSize,
    SortBy: sortBy,
    IsDescending: isDescending,
  };

  return instance.get(`/api/order/edit-request/store/${storeId}`, {
    params: query,
  });
}

export function rejectEditRequest({ requestId, replierId, replyContent }) {
  return instance.post("/api/order/edit-request/reject", {
    requestId,
    replierId,
    replyContent,
  });
}
