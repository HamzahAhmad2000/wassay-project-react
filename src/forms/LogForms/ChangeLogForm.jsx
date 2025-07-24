import { useState, useEffect } from "react";
import { getCategories, getCategoryChildren, postCategory } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const ChangeLogForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.category || {};
  
  const [categoryName, setCategoryName] = useState(existingData?.category_name || "");
  const [parentCategory, setParentCategory] = useState(existingData?.parent_category || "");
  const [description, setDescription] = useState(existingData?.description || "");
  const [categories, setCategories] = useState([]); // All available categories
  const [selectedHierarchy, setSelectedHierarchy] = useState([]); // Stores selected categories at each level
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories(); // Fetch root categories
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories. Please try again later.");
      }
    }
    fetchCategories();
  }, []);

  const fetchSubcategories = async (parentId, level) => {
    try {
      const response = await getCategoryChildren(parentId);
      const subcategories = response?.Childerns || [];

      // Update the hierarchy at the given level
      setSelectedHierarchy((prev) => {
        const updatedHierarchy = [...prev];
        updatedHierarchy[level] = { parentId, subcategories, selectedId: "" };
        return updatedHierarchy.slice(0, level + 1); // Remove deeper levels if parent is changed
      });
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleCategorySelect = (level, categoryId) => {
    if (!categoryId) return;
    // Set the selected category at the given level
    setSelectedHierarchy((prev) => {
      const updatedHierarchy = [...prev];
      updatedHierarchy[level] = { ...updatedHierarchy[level], selectedId: categoryId };
      return updatedHierarchy;
    });

    // Fetch subcategories of the newly selected category
    fetchSubcategories(categoryId, level + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const finalParent = selectedHierarchy.length > 0 ? selectedHierarchy[selectedHierarchy.length - 1].parentId : parentCategory;
    const body = {
      category_name: categoryName,
      parent_category: finalParent || null,
      description: description,
    };

    try {
      const response = await postCategory(body, mode === "edit" ? existingData.id : undefined);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Category added successfully!" : "Category updated successfully!");
        setTimeout(() => navigate("/categories"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Category. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Category" : "Edit Category"}</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category Name:</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Parent Category:</label>
          <select
            value={parentCategory}
            onChange={(e) => {
              setParentCategory(e.target.value);
              setSelectedHierarchy([]);
              handleCategorySelect(0, e.target.value)}}
            className="form-input"
          >
            <option value="">None (Main Category)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {selectedHierarchy.map((levelData, index) => (
          levelData?.subcategories?.length > 0 && (
            <div className="form-group" key={index}>
              <label>Subcategory Level {index + 1}:</label>
              <select
                value={levelData.selectedId}
                onChange={(e) => handleCategorySelect(index, e.target.value)}
                className="form-input"
              >
                <option value="">Select a Subcategory</option>
                {levelData.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.category_name}
                  </option>
                ))}
              </select>
            </div>
          )
        ))}

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          ></textarea>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Category" : "Update Category"}
        </button>
      </form>
    </div>
  );
};

ChangeLogForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ChangeLogForm;
