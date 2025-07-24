import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postInventoryAdjustments, getProducts } from "/src/APIs/ProductAPIs";
import "/src/styles/FormStyles.css";
import PropTypes, { object } from 'prop-types';
import { toast } from "react-toastify";
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const InventoryAdjustment = ({ mode = "add" }) => {
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const { state } = useLocation();
  const existingData = state?.inventory_adjustment || {};
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [products, setProducts] = useState([]);


  const [inventory_adjustment, setInventoryAdjustment] = useState({
    company: existingData?.company || user?.company || "",
    branch: existingData?.branch || user?.branch || "",
    warehouse: existingData?.warehouse || user?.warehouse || "",
    product: existingData?.product || "",
    quantity_adjusted: existingData?.quantity_adjusted || 0,
    adjustment_type: existingData.adjustment_type || "",
    recorded_by: existingData.recorded_by || user.id || "",

    reason: existingData?.reason || "",
    comment: existingData?.comment || "",

    image: existingData?.image || null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInventoryAdjustment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
// File input handler
const handleFileChange = (e) => {
  const file = e.target.files[0] || null; // Take only the first file
  setInventoryAdjustment((prev) => ({
    ...prev,
    image: file, // Store a single File object or null
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
        // if (success) navigate("/inventory_adjustments");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, error, navigate]);


  useEffect(() => {
    async function fetchData() {
      try {
        const productData = await getProducts(); // Fetch root products
        const warehouses = await getWareHouses()
        const companies = await getCompanies()
        console.log(productData)
        const branches = await getBranches()
        setProducts(productData);
        setWarehouses(warehouses);
        setCompanies(companies);
        setBranches(branches);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Unable to load data. Please try again later.");
        toast.error("Unable to load data. Please try again later.")
      }
    }
    fetchData();
  }, []);

  const validateForm = () => {
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  const updatedProduct = {
    ...inventory_adjustment,
    product: inventory_adjustment.product,
  };

  console.log("Updated Product:", updatedProduct);

  if (!validateForm()) return;

  const formData = new FormData();

  // Append all fields except image
  Object.keys(updatedProduct).forEach((key) => {
    if (key !== "image") {
      // Append the value directly unless it's null or undefined
      if (updatedProduct[key] != null) {
        formData.append(key, updatedProduct[key]);
      }
    }
  });
// Handle image if it's a File
  if (updatedProduct.image instanceof File) {
    formData.append("image", updatedProduct.image);
  } else if (Array.isArray(updatedProduct.image)) {
    console.warn("Image field is an array, skipping append:", updatedProduct.image);
    // Optionally handle array of files if server accepts multiple images
    // updatedProduct.image.forEach((file, index) => {
    //   if (file instanceof File) formData.append(`image[${index}]`, file);
    // });
  }

  // Log FormData contents for debugging
  for (let [key, value] of formData.entries()) {
    console.log(`FormData key: ${key}, value:`, value);
  }

  try {
    let response;
    if (mode === "add") {
      response = await postInventoryAdjustments(formData);
    } else if (mode === "edit" && existingData?.id) {
      response = await postInventoryAdjustments(formData, existingData.id);
    }

    if (response.id) {
      setSuccess(mode === "add" ? "Product added successfully!" : "Product updated successfully!");
      toast.success(mode === "add" ? "Product added successfully!" : "Product updated successfully!");
      setTimeout(() => navigate("/inventory-adjustment"), 1500);
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
      <form onSubmit={(e) => handleSubmit(e, inventory_adjustment)} className="inventory_adjustment-form">

        {user && user.is_superuser && (
          <div>
            <label className="block text-sm font-medium">Company</label>
            <select
              name="company"
              value={inventory_adjustment.company}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {user && !user.branch && (
            <div>
              <label className="block text-sm font-medium">Branch</label>
              <select
                name="branch"
                value={inventory_adjustment.branch}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.address}
                  </option>
                ))}
              </select>
            </div>
          )}
          {user && !user.warehouse && (
            <div>
              <label className="block text-sm font-medium">Warehouse</label>
              <select
                name="warehouse"
                value={inventory_adjustment.warehouse}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          
        <div className="form-group">
          <label>Product:</label>
          <select
            value={inventory_adjustment.product || ""}
            name='product'
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.product_name + " " + product.packaging_weight +  " " + product.unit + " - " + product.id}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Adjusted Quantity:</label>
          <input 
            type="number" 
            name="quantity_adjusted" 
            min={0} 
            value={inventory_adjustment.quantity_adjusted} 
            onChange={handleChange} 
            required 
            className="form-input" 
          />
        </div>

        
        <div className="form-group">
          <label>Adjustment Type:</label>
          <select name="adjustment_type" value={inventory_adjustment.adjustment_type} onChange={handleChange} className="form-input">
            <option value="">Select Adjustment Type</option>
            <option value="Theft">Theft</option>
            <option value="Spoilage">Spoilage</option>
            <option value="Damage">Damage</option>
          </select>
        </div>



        <div className="form-group">
          <label>Reason:</label>
          <textarea type="text" name="reason" value={inventory_adjustment.reason} onChange={handleChange} className="form-input" />
        </div>

        <div className="form-group">
          <label>Comment:</label>
          <textarea type="text" name="comment" value={inventory_adjustment.comment} onChange={handleChange} className="form-input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required
            className="form-input"
            onChange={(e) => setInventoryAdjustment({ ...inventory_adjustment, image: e.target.files[0] })}
          />
          {inventory_adjustment.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(inventory_adjustment.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">{mode === "add" ? "Add Inventory Adjustment" : "Update Inventory Adjustment"}</button>
      </form>
    </div>
  );
};

InventoryAdjustment.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default InventoryAdjustment;
