import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getCategory, createCategory, updateCategory, deleteCategory } from "../ServiceApi/apiCatetory";
import GenericModal from "../components/GenericModal";

function CategoryManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [filters, setFilters] = useState({
    categoryId: "",
    categoryNameQuery: "",
    descriptionQuery: "",
  });

  // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategoryCode, setEditingCategoryCode] = useState("");

  useEffect(() => {
    loadCategories();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      const response = await getCategory({
        pageNumber: currentPage,
        pageSize: pageSize,
        ...filters,
      });
      setCategories(response.items ?? []);
      setTotalPages(Math.ceil((response.totalItem ?? 0) / pageSize));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const allCategoriesIds = useMemo(() => categories.map((category) => category.categoryId), [categories]);

  const handleCheckAll = (e) => {
    setSelectedCategories(e.target.checked ? allCategoriesIds : []);
  };

  const handleCheckOne = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteSelectedCategories = async () => {
    if (selectedCategories.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedCategories.length} categori(es)?`
    );
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedCategories.map((id) => deleteCategory(id));
      const results = await Promise.allSettled(deletePromises);

      const failedDeletes = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} categori(es).`);
      }

      setSelectedCategories([]);
      loadCategories();
    } catch (error) {
      console.error("Error deleting categories:", error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({ categoryName, description });
      console.log("Category created successfully");
      setShowModal(false);
      loadCategories();
      setCategoryName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const categoryFields = [
    {
      label: "Category Name",
      controlId: "categoryName",
      type: "text",
      value: categoryName,
      onChange: (e) => setCategoryName(e.target.value),
    },
    {
      label: "Category Description",
      controlId: "description",
      type: "text",
      value: description,
      onChange: (e) => setDescription(e.target.value),
    },
  ];

  const handleCreateNewCategory = () => {
    setShowModal(true);
  };

  // Khi bấm "Edit", lưu category cần chỉnh sửa và cập nhật giá trị ban đầu cho các trường
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditingCategoryName(category.categoryName);
    setEditingDescription(category.description);
    setEditingCategoryCode(category.categoryCode);
  };

  const handleUpdateCategory = async () => {
    try {
      await updateCategory({
        categoryId: editingCategory.categoryId,
        categoryName: editingCategoryName,
        description: editingDescription,
        categoryCode: editingCategoryCode,
      });
      console.log("Updated successfully");
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Category Management"
          data={categories}
          columns={[
            { key: "categoryId", label: "Category Code" },
            { key: "categoryName", label: "Category Name" },
            { key: "description", label: "Category Description" },
          ]}
          selectedItems={selectedCategories}
          handleCheckAll={handleCheckAll}
          handleCheckOne={handleCheckOne}
          handleDeleteSelected={handleDeleteSelectedCategories}
          handleSearch={loadCategories}
          filters={[
            { label: "Category Name", value: filters.categoryNameQuery },
            { label: "Category ID", value: filters.categoryId },
            { label: "Category Description", value: filters.descriptionQuery },
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["categoryNameQuery", "categoryId", "descriptionQuery"];
            setFilters((prev) => ({ ...prev, [filterKeys[index]]: value }));
          }}
          handlePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          handleNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          currentPage={currentPage}
          totalPages={totalPages}
          actions={[
            {
              label: "Edit",
              className: "edit",
              variant: "info",
              onClick: handleEditCategory,
            },
          ]}
          extraButtons={[
            {
              label: "Create New",
              variant: "primary",
              onClick: handleCreateNewCategory,
            },
            {
              label: "Delete",
              variant: "danger",
              onClick: handleDeleteSelectedCategories,
              className: "delete-btn",
              disabled: selectedCategories.length === 0,
            },
          ]}
        />
      </div>

      {showModal && (
        <GenericModal
          show={showModal}
          title="Create New Category"
          fields={categoryFields}
          onSave={handleCreateCategory}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingCategory && (
        <GenericModal
          show={true}
          title="Edit Category"
          fields={[
            {
              label: "Category Name",
              controlId: "editCategoryName",
              type: "text",
              value: editingCategoryName,
              onChange: (e) => setEditingCategoryName(e.target.value),
            },
            {
              label: "Category Description",
              controlId: "editDescription",
              type: "text",
              value: editingDescription,
              onChange: (e) => setEditingDescription(e.target.value),
            },
          ]}
          onSave={handleUpdateCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}

export default CategoryManagement;