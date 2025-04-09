import instance from "./Customize-Axios";

  
  // Hàm lấy danh sách Category
  export function getCategory({
    pageNumber = 0,
    pageSize,
    sortBy,
    categoryId,
    categoryNameQuery,
    descriptionQuery,
  } = {}) {
    const query = {
      categoryId,
      categoryNameQuery,
      descriptionQuery,
  };
    return instance.post("/api/category/get", {
      pageNumber, 
      pageSize,
      sortBy,
      query,
    });
  }
  
  // Hàm cập nhật Category
  export function updateCategory({ categoryId, categoryName, description, isSuspended = true, }) {
    return instance.put("/api/category", {
      categoryId,
      isSuspended,
      categoryName,
      description,
    });
  }

  // Hàm tạo Category
export function createCategory({ categoryName, description }) {
    return instance.post("/api/category", {
      categoryName,
      description,
    });
  }

  // Hàm xoá Category
  export function deleteCategory(ids) {
    return instance.delete(`/api/category`, {
      data: ids ,
      headers: { "Content-Type": "application/json" }, 
    });
  }
  