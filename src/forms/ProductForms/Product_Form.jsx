import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoryChildren, postProduct, getCategories } from "/src/APIs/ProductAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { toast } from "react-toastify";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

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
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Product" : "Edit Product"}</h2>
      <form onSubmit={(e) => handleSubmit(e, product)} className="product-form">
        <div className="form-group">
          <label>Product Name:</label>
          <input type="text" name="product_name" value={product.product_name} onChange={handleChange} required className="form-input" />
        </div>

        
        <div className="form-group">
          <label>Unit:</label>
          <select name="unit" value={product.unit} onChange={handleChange} className="form-input">
            <option value="">Select Measuring Unit</option>
            <option value="gram">Gram</option>
            <option value="kilogram">Kilogram</option>
            <option value="liter">Liter</option>
            <option value="ml">miliLiter</option>
            <option value="QTY">QTY</option>
          </select>
        </div>


        <div className="form-group">
          <label>Category:</label>
          <select
            value={product.category || selectedHierarchy[0]?.selectedId || ""}
            onChange={(e) => {
              setSelectedHierarchy([]);
              handleCategorySelect(0, e.target.value)
            }}
            className="form-input"
          >
            <option value="">None (Main Category)</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name + " - " + category.id}
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
                    {sub.category_name + " - " + sub.id}
                  </option>
                ))}
              </select>
            </div>
          )
        ))}

        <div className="form-group">
          <label>Brand Name:</label>
          <input type="text" name="brand_name" value={product.brand_name} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>SKU:</label>
          <input type="text" name="sku" value={product.sku} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Barcode:</label>
          <input type="text" name="barcode" value={product.barcode} onChange={handleChange} className="form-input" />
        </div>


        <div className="form-group">
          <label>Description:</label>
          <textarea name="description" value={product.description} onChange={handleChange} rows="3" className="form-input" />
        </div>

        <div className="form-group">
          <label>Reorder Level:</label>
          <input type="number" name="reorder_level" value={product.reorder_level} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Restock Quantity:</label>
          <input type="number" name="restock_quantity" value={product.restock_quantity} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Season:</label>
          <select name="season" value={product.season} onChange={handleChange} className="form-input">
            <option value="">Select Season</option>
            <option value="Summer">Summer</option>
            <option value="Winter">Winter</option>
            <option value="Tropical">Tropical</option>
          </select>
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select name="gender" value={product.gender} onChange={handleChange} className="form-input">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>
        

        <div className="form-group">
          <label>Color:</label>
          <input type="text" name="color" checked={product.color} onChange={handleChange} className="form-checkbox" />
        </div>


        <div className="form-group">
          <label>Returnable:</label>
          <input type="checkbox" name="returnable" checked={product.returnable} onChange={handleChange} className="form-checkbox" />
        </div>

        <div className="form-group">
          <label>Digital Product:</label>
          <input type="checkbox" name="digital_product" checked={product.digital_product} onChange={handleChange} className="form-checkbox" />
        </div>

        
        <div className="form-group">
          <label>Open Item:</label>
          <input type="checkbox" name="open_item" checked={product.open_item} onChange={handleChange} className="form-checkbox" />
        </div>
        
        <div className="form-group">
          <label>Home-made:</label>
          <input type="checkbox" name="housemade" checked={product.housemade} onChange={handleChange} className="form-checkbox" />
        </div>

        <div className="form-group">
          <label>Bundle:</label>
          <input type="checkbox" name="bundle" checked={product.bundle} onChange={handleChange} className="form-checkbox" />
        </div>


        <div className="form-group">
          <label>Raw Material:</label>
          <input type="checkbox" name="raw_material" checked={product.raw_material} onChange={handleChange} className="form-checkbox" />
        </div>

        <div className="form-group">
          <label>Warranty Period (days):</label>
          <input type="number" name="warranty_period" value={product.warranty_period} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Handling Instructions:</label>
          <textarea name="handling_instructions" value={product.handling_instructions} onChange={handleChange} rows="3" className="form-input" />
        </div>

        <div className="form-group">
          <label>Material Composition:</label>
          <textarea name="material_composition" value={product.material_composition} onChange={handleChange} rows="3" className="form-input" />
        </div>

        <div className="form-group">
          <label>Packaging Dimensions (L x W x H) (cms):</label>
          <input type="text" name="packaging_dimensions" value={product.packaging_dimensions} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Packaging Weight (grams):</label>
          <input type="number" name="packaging_weight" value={product.packaging_weight} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Images:</label>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={handleFileChange}
            required
            className="form-input" 
          />
        </div>
        
                  {product.image &&
                    // Display the image preview if an image is selected
                    <img src={getImagePreviewSrc(product.images[0])} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                  }

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">{mode === "add" ? "Add Product" : "Update Product"}</button>
      </form>
    </div>
  );
};

ProductForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default ProductForm;
