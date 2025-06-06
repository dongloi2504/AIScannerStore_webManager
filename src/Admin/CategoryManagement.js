import React, { useState, useEffect, useMemo } from "react";
import "../Styles/GlobalStyles.css";
import Sidebar from "../components/SideBar";
import DataTable from "../components/DataTable";
import { getCategory, createCategory, updateCategory, deleteCategory } from "../ServiceApi/apiCatetory";
import GenericModal from "../components/GenericModal";
import { useToast } from "../Context/ToastContext";

function CategoryManagement() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    categoryCode: "",
    categoryNameQuery: "",
    descriptionQuery: "",
	isSuspended: false,
  });
  

  // State cho modal chỉnh sửa (Edit) sử dụng GenericModal
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCategoryCode, setEditingCategoryCode] = useState("");
  const [editingSuspend, setEditingSuspend] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [currentPage]);

  const loadCategories = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
      `Are you sure you want to suspend ${selectedCategories.length} categori(es)?`
    );
    if (!confirmDelete) return;
	deleteCategory(selectedCategories)
	.then(res => {
	  setSelectedCategories([]);
      loadCategories();
	  showToast("Categori(es) suspended!","info");
	}).catch(error => {
		const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
	})
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({ categoryCode, categoryName, description });
      setShowModal(false);
      loadCategories();
      setCategoryName("");
      setDescription("");
      setCategoryCode("");
	  showToast("Category Created!", "info");
    } catch (error) {
      const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
    }
  };

  const categoryFields = [
    {
      label: "Category Code",
      controlId: "categoryCode",
      type: "text",
	  maxLength: 50,
	  required: true,
      value: categoryCode,
      required: true,
      onChange: (e) => setCategoryCode(e.target.value),
    },
    {
      label: "Category Name",
      controlId: "categoryName",
      type: "text",
      value: categoryName,
	  required: true,
	  maxLength: 50,
      onChange: (e) => setCategoryName(e.target.value),
    },
    {
      label: "Category Description",
      controlId: "description",
      type: "text",
      value: description,
      required: true,
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
	setEditingSuspend(category.isSuspended);
  };

  const handleUpdateCategory = async () => {
    try {
      await updateCategory({
        categoryId: editingCategory.categoryId,
        categoryName: editingCategoryName,
        description: editingDescription,
        categoryCode: editingCategoryCode,
		isSuspended: editingSuspend,
      });
      setEditingCategory(null);
      loadCategories();
	  showToast("Category updated!", "info");
    } catch (error) {
      const message =
          typeof error.response?.data === "string" ? error.response.data : "Unexplained error";
		showToast(message, "error");
		throw error;
    }
  };

  return (
    <div className={`page-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar onToggle={setIsSidebarOpen} />
      <div className="content">
        <DataTable
          title="Category Management"
          loading={loading}
          data={categories}
          columns={[
            { key: "categoryCode", label: "Category Code" },
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
            { label: "Category Code", value: filters.categoryCode },
            { label: "Category Description", value: filters.descriptionQuery },
			{ label: "Suspend", value: filters.isSuspended, type:"checkbox", hasLabel: true }
          ]}
          setFilters={(index, value) => {
            const filterKeys = ["categoryNameQuery", "categoryCode", "descriptionQuery", "isSuspended"];
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
              label: "Suspend",
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
              label: "Category Code",
              controlId: "editCategoryCode",
              type: "text",
              value: editingCategoryCode,
              onChange: (e) => setEditingCategoryCode(e.target.value),
            },
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
			{
			  label: "Suspend",
			  controlId: "editSuspend",
			  type: "checkbox",
			  value: editingSuspend,
			  onChange: (e) => setEditingSuspend(e.target.checked),
			}
          ]}
          onSave={handleUpdateCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}

export default CategoryManagement;