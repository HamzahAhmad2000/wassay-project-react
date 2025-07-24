import React, { useCallback } from "react"; // Import useCallback
import { getAllCategories, deleteCategory } from "../../APIs/ProductAPIs";
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable";
import SearchFilter from "../../components/SearchFilter";
import useFetchAndFilter from "../../hooks/useFetchAndFilter";
import { handleDelete } from "../../utils/crudUtils";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    const response = await getAllCategories();
    return response.categories;
  }, []); // Empty dependency array, as getAllCategories should have a stable identity

  const { data: categories, isLoading, searchTerm, setSearchTerm, setData: setCategories } = useFetchAndFilter(
    fetchCategories,
    'categories'
  );

  const handleUpdateCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      navigate(`/update-category/${categoryId}`, { state: { category } });
    } else {
      toast.error(`Category with ID ${categoryId} not found.`);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    handleDelete(categoryId, deleteCategory, setCategories, 'categories');
  };

  const categoryHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Category", key: "category_name", sortable: true },
    { label: "Parent", key: "parent_category_name", sortable: true },
    { label: "Description", key: "description", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const categoryData = categories.map((category, index) => ({
    serial_no: index + 1,
    category_name: category.category_name || "N/A",
    parent_category_name: category.parent?.category_name || "N/A",
    description: category.description || "N/A",
    actions: (
      <div>
        <button className="action-button update-button mr-2" onClick={() => handleUpdateCategory(category.id)}>
          Update
        </button>
        <button className="action-button delete-button" onClick={() => handleDeleteCategory(category.id)}>
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="category-page">
      <h1 className="page-title">Category Details</h1>

      {/* Search & Filter Section */}
      <div className="filter-section mb-4 flex items-center justify-between px-4">
        {/* Search Input (Centered) */}
        <div className="flex-1 flex justify-center">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search categories..." />
        </div>

        {/* Add Category Button (Right Aligned) */}
        <Link to="/add-category">
          <button className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
            Add Category
          </button>
        </Link>
      </div>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : (
        <ReusableTable headers={categoryHeaders} data={categoryData} />
      )}
    </div>
  );
};

export default CategoryPage;