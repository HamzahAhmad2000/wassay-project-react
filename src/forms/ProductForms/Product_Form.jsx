import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoryChildren, postProduct, getCategories } from "/src/APIs/ProductAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Checkbox } from "../../additionalOriginuiComponents/ui/checkbox";

const ProductForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.product || {};
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  const [selectedHierarchy, setSelectedHierarchy] = useState([]); // Stores selected categories at each level

  const [product, setProduct] = useState({
    product_name: existingData?.product_name || "",
    unit: existingData.unit || "",
    category: existingData?.category?.id || "",
    company: existingData?.company || user?.company || "",
    brand_name: existingData?.brand_name || "",
    sku: existingData?.sku || "",
    barcode: existingData?.barcode || "",
    description: existingData?.description || "",
    reorder_level: existingData?.reorder_level || "",
    restock_quantity: existingData?.restock_quantity || "",
    season: existingData?.season || "",
    gender: existingData?.gender || "",
    returnable: existingData?.returnable || false,
    digital_product: existingData?.digital_product || false,
    warranty_period: existingData?.warranty_period || 0,
    handling_instructions: existingData?.handling_instructions || "",
    material_composition: existingData?.material_composition || "",
    packaging_dimensions: existingData?.packaging_dimensions || "",
    packaging_weight: existingData?.packaging_weight || "",
    images: existingData?.images || [],
    housemade: existingData?.housemade || false,
    bundle: existingData?.bundle || false,
    raw_material: existingData?.raw_material || false,
    open_item: existingData?.open_item || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      images: files
    }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
        // if (success) navigate("/products");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, error, navigate]);


  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories(); // Fetch root categories
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories. Please try again later.");
        toast.error("Unable to load categories. Please try again later.")
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

  const validateForm = () => {
    if (!product.product_name.trim()) {
      setError("Product name is required.");
      toast.error("Product name is required.")
      return false;
    }
    // if (!product.category) {
    //   setError("Category is required.");
    //   return false;
    // }
    if (!product.restock_quantity) {
      setError("Stock quantity is required.");
      toast.error("Stock quantity is required.")
      
      return false;
    }
    if (!product.reorder_level) {
      setError("Reorder level is required.");
      toast.error("Reorder level is required.");
      return false;
    }
    if (!product.barcode) {
      setError("Barcode is required.");
      toast.error("Barcode is required.");
      return false;
    }
    if (!product.sku) {
      setError("SKU is required.");
      toast.error("SKU is required.");
      return false;
    }
    return true;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  const updatedProduct = { 
    ...product, 
    category: selectedHierarchy[selectedHierarchy.length - 1]?.parentId || product.category 
  };
  
  if (!validateForm()) return;
  const formData = new FormData();

  // Handle all fields except images
  Object.keys(updatedProduct).forEach((key) => {
    if (key !== "images") {
      if (typeof updatedProduct[key] === "object" && updatedProduct[key] !== null) {
        formData.append(key, JSON.stringify(updatedProduct[key]));
      } else {
        formData.append(key, updatedProduct[key]);
      }
    }
  });

    // Append images if available
    updatedProduct.images.length > 0 && updatedProduct.images?.forEach((file) => {
        formData.append("images", file);
    });

  try {
    let response;
    if (mode === "add") {
      response = await postProduct(formData);
    } else if (mode === "edit" && existingData?.id) {
      response = await postProduct(formData, existingData.id);
    }

    if (response.ok) {
      setSuccess(mode === "add" ? "Product added successfully!" : "Product updated successfully!");
      toast.success(mode === "add" ? "Product added successfully!" : "Product updated successfully!");
        setTimeout(() => navigate("/products"), 1500);

    } else {
      try {
        const data = await response.json();
        setError(data.detail || "An error occurred. Please try again.");
        toast.error(data.detail || "An error occurred. Please try again.");
      } catch {
        setError("An error occurred. Please try again.");
        toast.error("An error occurred. Please try again.");
      }
    }
  } catch (err) {
    console.error("Error:", err);
    setError("An error occurred. Please try again.");
    toast.error("An error occurred. Please try again.");
  }
};

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Product" : "Edit Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, product)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_name" className="text-[#101023] font-medium">Product Name:</Label>
                  <Input 
                    type="text" 
                    name="product_name" 
                    value={product.product_name} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-[#101023] font-medium">Unit:</Label>
                  <Select
                    value={product.unit}
                    onValueChange={(value) => setProduct(prev => ({...prev, unit: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Measuring Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="kilogram">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="ml">miliLiter</SelectItem>
                      <SelectItem value="QTY">QTY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[#101023] font-medium">Category:</Label>
                  <Select
                    value={product.category || selectedHierarchy[0]?.selectedId || ""}
                    onValueChange={(value) => {
                      setSelectedHierarchy([]);
                      handleCategorySelect(0, value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None (Main Category)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.category_name + " - " + category.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_name" className="text-[#101023] font-medium">Brand Name:</Label>
                  <Input 
                    type="text" 
                    name="brand_name" 
                    value={product.brand_name} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-[#101023] font-medium">SKU:</Label>
                  <Input 
                    type="text" 
                    name="sku" 
                    value={product.sku} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-[#101023] font-medium">Barcode:</Label>
                  <Input 
                    type="text" 
                    name="barcode" 
                    value={product.barcode} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorder_level" className="text-[#101023] font-medium">Reorder Level:</Label>
                  <Input 
                    type="number" 
                    name="reorder_level" 
                    value={product.reorder_level} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restock_quantity" className="text-[#101023] font-medium">Restock Quantity:</Label>
                  <Input 
                    type="number" 
                    name="restock_quantity" 
                    value={product.restock_quantity} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="season" className="text-[#101023] font-medium">Season:</Label>
                  <Select
                    value={product.season}
                    onValueChange={(value) => setProduct(prev => ({...prev, season: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="Winter">Winter</SelectItem>
                      <SelectItem value="Tropical">Tropical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-[#101023] font-medium">Gender:</Label>
                  <Select
                    value={product.gender}
                    onValueChange={(value) => setProduct(prev => ({...prev, gender: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty_period" className="text-[#101023] font-medium">Warranty Period (days):</Label>
                  <Input 
                    type="number" 
                    name="warranty_period" 
                    value={product.warranty_period} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging_weight" className="text-[#101023] font-medium">Packaging Weight (grams):</Label>
                  <Input 
                    type="number" 
                    name="packaging_weight" 
                    value={product.packaging_weight} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packaging_dimensions" className="text-[#101023] font-medium">Packaging Dimensions (L x W x H) (cms):</Label>
                  <Input 
                    type="text" 
                    name="packaging_dimensions" 
                    value={product.packaging_dimensions} 
                    onChange={handleChange} 
                    className="w-full" 
                  />
                </div>
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
                            {sub.category_name + " - " + sub.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              ))}

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">Description:</Label>
                <textarea 
                  name="description" 
                  value={product.description} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="handling_instructions" className="text-[#101023] font-medium">Handling Instructions:</Label>
                <textarea 
                  name="handling_instructions" 
                  value={product.handling_instructions} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material_composition" className="text-[#101023] font-medium">Material Composition:</Label>
                <textarea 
                  name="material_composition" 
                  value={product.material_composition} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent" 
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#101023]">Product Options</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="returnable"
                      checked={product.returnable}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, returnable: checked}))}
                    />
                    <Label htmlFor="returnable" className="text-[#101023]">Returnable</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="digital_product"
                      checked={product.digital_product}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, digital_product: checked}))}
                    />
                    <Label htmlFor="digital_product" className="text-[#101023]">Digital Product</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="open_item"
                      checked={product.open_item}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, open_item: checked}))}
                    />
                    <Label htmlFor="open_item" className="text-[#101023]">Open Item</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="housemade"
                      checked={product.housemade}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, housemade: checked}))}
                    />
                    <Label htmlFor="housemade" className="text-[#101023]">Home-made</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bundle"
                      checked={product.bundle}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, bundle: checked}))}
                    />
                    <Label htmlFor="bundle" className="text-[#101023]">Bundle</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="raw_material"
                      checked={product.raw_material}
                      onCheckedChange={(checked) => setProduct(prev => ({...prev, raw_material: checked}))}
                    />
                    <Label htmlFor="raw_material" className="text-[#101023]">Raw Material</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images" className="text-[#101023] font-medium">Images:</Label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange}
                  className="w-full" 
                />
              </div>
              
              {product.images && product.images.length > 0 && (
                <img 
                  src={getImagePreviewSrc(product.images[0])} 
                  alt="Preview" 
                  className="mt-2 w-32 h-32 object-cover rounded-md" 
                />
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Product" : "Update Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

ProductForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default ProductForm;
