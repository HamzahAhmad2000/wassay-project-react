import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { getHouseMadeProducts, getRawMaterials } from "/src/APIs/ProductAPIs";
import { postIngredient } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const IngredientsForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.product || {};
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rawMaterials, setRawMaterials] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [houseMadeProducts, setHouseMadeProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    product_produced: existingData?.product_produced?.id || "",
    products_used: existingData?.products_user || [],
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    if(name === 'product_produced') {
        // Reset form when changing product
        setFormData(prev => ({
          ...prev,
          products_used: [],
        }));
        
        if (!value) {
          setRawMaterials([]);
          return;
        }
        
    }
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      products_used: [...prev.products_used, { product: "", quantity: 1}],
    }));
  };

  const handleProductChange =async (index, field, value) => {
    const updatedProducts = [...formData.products_used];

    updatedProducts[index][field] = field === "quantity" 
      ? parseFloat(value) : value;

    setFormData({ ...formData, products_used: updatedProducts });
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...formData.products_used];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products_used: updatedProducts });
  };

  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).catch(() => navigate("/login"));
    }
  }, [navigate]);

  // Clear notifications after delay
  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
        // if (success) navigate("/products");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error, navigate]);

  // Fetch open products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getHouseMadeProducts();
        setHouseMadeProducts(response || []);
        const products = await getRawMaterials();
        setRawMaterials(products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Please try again later.");
      }
    }
    fetchProducts();
  }, []);

  // Form validation
  const validateForm = () => {
    if (!formData.product_produced) {
      setError("Please select product");
      return false;
    }
    
    if (formData.products_used.length === 0) {
      setError("Please add at least one ingredient");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // This is where you would implement your API call
      const response = await postIngredient(formData)

      if (!response.ok){
        toast.error(`Error posting Ingredients`)
        return
      }
      
      // Simulate API success
      setTimeout(() => {
        setSuccess("Products raw successfully!");
        setIsSubmitting(false);
      }, 1000);
        setTimeout(() => navigate("/ingredients"), 1500);

      
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Ingredients" : "Edit Ingredients"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Notification area */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
                <p className="font-medium">{success}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product selection section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">1. Select Product Produced</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="product_produced" className="text-[#101023] font-medium">
                    Product Produced:
                  </Label>
                  <Select
                    value={formData.product_produced}
                    onValueChange={(value) => {
                      setFormData(prev => ({
                        ...prev,
                        product_produced: value,
                        products_used: [],
                      }));
                      if (!value) {
                        setRawMaterials([]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Select Product Produced --" />
                    </SelectTrigger>
                    <SelectContent>
                      {houseMadeProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_name} (ID: {product.id}) - {product.quantity_in_stock}g available
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Products Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">2. Add raw Products</h3>
                  <Button 
                    type="button" 
                    onClick={handleAddProduct}
                    disabled={!formData.product_produced}
                    className={`${
                      !formData.product_produced 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-[#423e7f] hover:bg-[#201b50]"
                    } text-white`}
                  >
                    + Add Product
                  </Button>
                </div>
                
                {formData.product_produced && formData.products_used.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No products added yet. Click "Add Product" to start packaging.</p>
                  </div>
                )}
                
                {!formData.product_produced && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Please select an open product first</p>
                  </div>
                )}
                
                {formData.products_used.map((product, index) => (
                  <div key={index} className="bg-white p-4 mb-4 rounded-lg shadow border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <Label className="text-[#101023] font-medium">Product</Label>
                        <Select
                          value={product.product}
                          onValueChange={(value) => handleProductChange(index, "product", value)}
                        >
                          <SelectTrigger className={`w-full ${
                            !product.product ? "border-amber-300" : ""
                          }`}>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.product_name} {prod.packaging_weight ? `(${prod.packaging_weight}g)` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-[#101023] font-medium">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", Math.max(1, parseInt(e.target.value || 1)))}
                          className="w-full text-center"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm">
                        {product.product && rawMaterials.find(p => p.id == product.product)?.packaging_weight && (
                          <span className="text-gray-600">
                            Total weight: {(product.quantity * rawMaterials.find(p => p.id == product.product)?.packaging_weight).toFixed(2)}g
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        type="button" 
                        onClick={() => handleRemoveProduct(index)}
                        variant="outline"
                        className="border-red-500 text-red-700 hover:bg-red-500 hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  onClick={() => navigate("/products")}
                  variant="outline"
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || formData.products_used.length === 0}
                  className={`${
                    isSubmitting || formData.products_used.length === 0
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#423e7f] hover:bg-[#201b50]"
                  } text-white`}
                >
                  {isSubmitting ? "Processing..." : "Complete Packaging"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

IngredientsForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default IngredientsForm;