import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách order
  export function getLiveOrder({
    pageNumber = 0,
    pageSize,
    sortBy,
    isDescending = true
  } = {}) {
    const query = {
	  pageNumber,
      pageSize,
      sortBy,
      isDescending,
    };
    return instance.get("/api/order/live",{ params: query });
  }
  
  // Hàm edit order
  export function editLiveOrder({
	  staffId,
	  oldOrderId,
	  items = []
  } = {}) {
	let command = {
		staffId,
		oldOrderId,
		items,
	}
    return instance.post(`/api/order/live`, command, { headers: { "Content-Type": "application/json" } });
  }
  
  export function timeoutOrder(id) {
	return instance.post('/api/order/timeout/' + id);
  }
  
  export function getSingleOrder(id) {
	  return instance.get('/api/order/' + id);
  }
	  