import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Customer
  export function getCustomer({
    pageNumber = 0,
    pageSize,
    SortBy,
    isDescending = true,
    id,
    name,
    code,
    email,
    phone,
    isSuspended
  } = {}) {
    const query = {
      name,
      code,
      email,
      phone,
      isSuspended,
    };
    if (id) {
      query.id = id;
    }

    return instance.post("/api/customer/get",{
      pageNumber,
      pageSize,
      SortBy,
      isDescending,
      query,
    });
  }
  
  // Hàm cập nhật Staff
  export function updateCustomer({ id, code, isSuspended = true, }) {
    return instance.put(`/api/customer/${id}`, {
      params: {
        customerId: id
      },
      id,
      isSuspended,
      code,
    });
  }
  //Hàm Staff Details
  export function customerDetail(id) {
    return instance.get(`/api/customer/${id}`);
  }

  export function deleteStaff(ids ) {
    return instance.delete(`/api/staff`, {
      data: [ids] ,
      headers: { "Content-Type": "application/json" },
    });
  }


  