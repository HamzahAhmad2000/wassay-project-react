import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postInventoryAdjustments, getProducts } from "/src/APIs/ProductAPIs";
import "/src/styles/FormStyles.css";
import PropTypes, { object } from 'prop-types';
import { toast } from "react-toastify";
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Product" : "Edit Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, inventory_adjustment)} className="space-y-6">
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label className="text-[#101023] font-medium">Company</Label>
                  <Select
                    value={inventory_adjustment.company}
                    onValueChange={(value) => setInventoryAdjustment(prev => ({...prev, company: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {user && !user.branch && (
                <div className="space-y-2">
                  <Label className="text-[#101023] font-medium">Branch</Label>
                  <Select
                    value={inventory_adjustment.branch}
                    onValueChange={(value) => setInventoryAdjustment(prev => ({...prev, branch: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {user && !user.warehouse && (
                <div className="space-y-2">
                  <Label className="text-[#101023] font-medium">Warehouse</Label>
                  <Select
                    value={inventory_adjustment.warehouse}
                    onValueChange={(value) => setInventoryAdjustment(prev => ({...prev, warehouse: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="product" className="text-[#101023] font-medium">Product:</Label>
                <Select
                  value={inventory_adjustment.product || ""}
                  onValueChange={(value) => setInventoryAdjustment(prev => ({...prev, product: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name + " " + product.packaging_weight +  " " + product.unit + " - " + product.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity_adjusted" className="text-[#101023] font-medium">Adjusted Quantity:</Label>
                <Input 
                  type="number" 
                  name="quantity_adjusted" 
                  min={0} 
                  value={inventory_adjustment.quantity_adjusted} 
                  onChange={handleChange} 
                  className="w-full" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment_type" className="text-[#101023] font-medium">Adjustment Type:</Label>
                <Select
                  value={inventory_adjustment.adjustment_type}
                  onValueChange={(value) => setInventoryAdjustment(prev => ({...prev, adjustment_type: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Adjustment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Theft">Theft</SelectItem>
                    <SelectItem value="Spoilage">Spoilage</SelectItem>
                    <SelectItem value="Damage">Damage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-[#101023] font-medium">Reason:</Label>
                <textarea 
                  type="text" 
                  name="reason" 
                  value={inventory_adjustment.reason} 
                  onChange={handleChange} 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-[#101023] font-medium">Comment:</Label>
                <textarea 
                  type="text" 
                  name="comment" 
                  value={inventory_adjustment.comment} 
                  onChange={handleChange} 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-[#101023] font-medium">Image</Label>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full"
                  onChange={handleFileChange}
                />
                {inventory_adjustment.image && (
                  <img 
                    src={getImagePreviewSrc(inventory_adjustment.image)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md" 
                  />
                )}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/inventory-adjustment")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Inventory Adjustment" : "Update Inventory Adjustment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

InventoryAdjustment.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default InventoryAdjustment;
