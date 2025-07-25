import { useState, useEffect } from "react";
import { getCategories, getCategoryChildren, postCategory } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Category" : "Edit Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="categoryName" className="text-[#101023] font-medium">
                  Category Name:
                </Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentCategory" className="text-[#101023] font-medium">
                  Parent Category:
                </Label>
                <Select 
                  value={parentCategory} 
                  onValueChange={(value) => {
                    setParentCategory(value);
                    setSelectedHierarchy([]);
                    handleCategorySelect(0, value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None (Main Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedHierarchy.map((levelData, index) => (
                levelData?.subcategories?.length > 0 && (
                  <div className="space-y-2" key={index}>
                    <Label htmlFor={`subcategory-${index}`} className="text-[#101023] font-medium">
                      Subcategory Level {index + 1}:
                    </Label>
                    <Select
                      value={levelData.selectedId}
                      onValueChange={(value) => handleCategorySelect(index, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {levelData.subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              ))}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">
                  Description:
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/categories")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Category" : "Update Category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

ChangeLogForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ChangeLogForm;
