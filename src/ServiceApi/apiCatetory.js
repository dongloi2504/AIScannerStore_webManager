import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Category
  export function getCategory({
    pageNumber = 0,
    pageSize,
    sortBy,
    isDescending = true,
    categoryCode,
    categoryNameQuery,
    descriptionQuery,
    isSuspended,
  } = {}) {
    const query = {
      categoryCode,
      categoryNameQuery,
      descriptionQuery,
      isSuspended,
  };
    return instance.post("/api/category/get", {
      pageNumber, 
      pageSize,
      sortBy,
      isDescending,
      query,
    });
  }
  
  // Hàm cập nhật Category
  export function updateCategory({ categoryId, categoryName, description, categoryCode, isSuspended,}) {
    return instance.put("/api/category", {
      categoryId,
      categoryName,
      description,
      categoryCode,
      isSuspended,
    });
  }

  // Hàm tạo Category
export function createCategory({ categoryName, description, categoryCode }) {
    return instance.post("/api/category", {
      categoryName,
      description,
      categoryCode,
    });
  }

  // Hàm xoá Category
  export function deleteCategory(ids) {
    return instance.delete(`/api/category`, {
      data: {ids : [ids]} ,
      headers: { "Content-Type": "application/json" }
    });
  }
  