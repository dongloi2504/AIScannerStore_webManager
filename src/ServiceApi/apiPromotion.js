import instance from "./Customize-Axios";

export function getPromotionProducts({
    code,
    isSuspended,
    startAt,
    endAt,
    pageNumber = 1,
    pageSize = 10,
    sortBy,
    isDescending,
} = {}) {
    return instance.get("/api/promotion/product", {
        params: {
            Code: code,
            IsSuspended: isSuspended,
            StartAt: startAt,
            EndAt: endAt,
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortBy: sortBy,
            IsDescending: isDescending,
        },
    });
}

export function getPromotionOrders({
    code,
    isSuspended,
    startAt,
    endAt,
    pageNumber = 1,
    pageSize = 10,
    sortBy,
    isDescending,
} = {}) {
    return instance.get("/api/promotion/order", {
        params: {
            Code: code,
            IsSuspended: isSuspended,
            StartAt: startAt,
            EndAt: endAt,
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortBy: sortBy,
            IsDescending: isDescending,
        },
    });
}

export function getPromotionDeposits({
    code,
    isSuspended,
    startAt,
    endAt,
    pageNumber = 1,
    pageSize = 10,
    sortBy,
    isDescending,
} = {}) {
    return instance.get("/api/promotion/deposit", {
        params: {
            Code: code,
            IsSuspended: isSuspended,
            StartAt: startAt,
            EndAt: endAt,
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortBy: sortBy,
            IsDescending: isDescending,
        },
    });
}

export function postPromotionProduct(data) {
    return instance.post("/api/promotion/product", data);
}

export function postPromotionOrder(data) {
    return instance.post("/api/promotion/order", data);
}

export function postPromotionDeposit(data) {
    return instance.post("/api/promotion/deposit", data);
}

export function putPromotionProduct(data) {
  return instance.put("/api/promotion/product", data);
}

export function putPromotionOrder(data) {
  return instance.put("/api/promotion/order", data);
}

export function putPromotionDeposit(data) {
  return instance.put("/api/promotion/deposit", data);
}