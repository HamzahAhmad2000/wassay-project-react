import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { getProducts, getGRNs } from "/src/APIs/ProductAPIs";
import { postPackingProducts, getOpenProductsAccordingToGRN } from "/src/APIs/ProductAPIs";


const PackOpenProduct = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.product || {};
  const [openProducts, setOpenProducts] = useState([]);
  // const [filteredOpenProducts, setFilteredOpenProducts] = useState([]);
  const [GRNs, setGRNs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [remainingQuantity, setRemainingQuantity] = useState(0);
  const [packaged_products, setPackagedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({});
  // const [actuallRemainingQuantity, setActualRemainingQuantity] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    open_product: existingData?.open_product?.id || "",
    packages_made: [],    
    supplier: existingData?.supplier?.id || "",
    total_quantity: existingData?.total_quantity || 0,
    remaining_quantity: existingData?.remaining_quantity || 0
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "grn") {
      await getOpenProductsAccordingToGRN(value).then((response) => {
          setOpenProducts(response)
        })
        .catch((error) => {
          console.error(error);
        });
    }
    
    
    if(name === 'open_product') {
        // Reset form when changing product
        setFormData(prev => ({
          ...prev,
          packages_made: [],
          open_product: value,
        }));
        
        if (!value) {
          setSelectedProduct({});
          setPackagedProducts([]);
          setTotalQuantity(0);
          setRemainingQuantity(0);
          return;
        }

        const product = openProducts.find(p => p.id === parseInt(value))
        
        setSelectedProduct(product || {});
        
        try {
          const packs = await getProducts(null, product?.product_name || null);
          setPackagedProducts(packs || []);
          setTotalQuantity(product?.quantity_in_stock || 0);
          setRemainingQuantity(product?.quantity_in_stock || 0);
          setFormData(prev => ({
            ...prev,
            supplier: product?.supplier_id || "",
          }));
        } catch (err) {
          setError("Failed to load packaged products");
          console.error(err);
        }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddProduct = () => {
    setFormData(prev => ({
      ...prev,
      packages_made: [...prev.packages_made, { product: "", quantity: 1, retail_price: "", cost_price: "" }],
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.packages_made];
    updatedProducts[index][field] = field === "quantity" || field === "retail_price" || field === "cost_price" 
      ? parseFloat(value) : value;

    if (field === "product") {
      const selectedPackage = packaged_products.find(p => p.id == value);
      if (selectedPackage) {
        const cost = selectedProduct.cost_price * selectedPackage.packaging_weight * updatedProducts[index].quantity;
        updatedProducts[index].cost_price = cost;
      }
    } else if (field === "quantity") {
      const selectedPackage = packaged_products.find(p => p.id == updatedProducts[index].product);
      if (selectedPackage) {
        const cost = selectedProduct.cost_price * selectedPackage.packaging_weight;
        updatedProducts[index].cost_price = cost;
      }
    }

    setFormData({ ...formData, packages_made: updatedProducts });
  };

  // Calculate remaining quantity when packages change
  useEffect(() => {
    const updatedProducts = [...formData.packages_made];
    let totalWeightUsed = 0;
    
    updatedProducts.forEach(item => {
      const product = packaged_products.find(p => p.id == item.product);
      if (product && item.quantity) {
        const productWeight = parseFloat(product.packaging_weight || 0);
        item.total_weight = productWeight * item.quantity;
        totalWeightUsed += item.total_weight;
      }
    });
    
    setRemainingQuantity(totalQuantity - totalWeightUsed);
    setFormData(prev => ({
      ...prev, 
      total_quantity: totalWeightUsed
    }));
  }, [formData.packages_made, packaged_products, totalQuantity]);

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...formData.packages_made];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, packages_made: updatedProducts });
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
        const GRNSResponse = await getGRNs();
        setGRNs(GRNSResponse || []);
        // const response = await getOpenProducts();
        // setOpenProducts(response || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Please try again later.");
      }
    }
    fetchProducts();
  }, []);

  // Form validation
  const validateForm = () => {
    if (!formData.open_product) {
      setError("Please select an open product");
      return false;
    }
    
    if (formData.packages_made.length === 0) {
      setError("Please add at least one product package");
      return false;
    }
    
    for (const item of formData.packages_made) {
      if (!item.product) {
        setError("Please select a product for all packages");
        return false;
      }
      
      if (!item.retail_price) {
        setError("Please set retail prices for all products");
        return false;
      }
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
      const response = await postPackingProducts(formData)
      if(response.status === 200){
          // Simulate API success
          setTimeout(() => {
              setSuccess("Products packaged successfully!");
              setIsSubmitting(false);
              // navigate("/products");
            }, 1000);

        }
      
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Calculate if there are any validation issues
  const hasValidationIssues =  (formData.packages_made.length > 0 && formData.packages_made.some(p => !p.product || !p.retail_price));

  return (
    <div className="form-container max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="form-heading text-2xl font-bold mb-6 text-blue-800">
        {mode === "add" ? "Pack Open Products" : "Edit Packaging"}
      </h2>
      
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
      
      <form onSubmit={handleSubmit} className="product-form space-y-6">
        {/* Product selection section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">1. Select Open Product</h3>
          
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select GRN:</label>
            <select
              value={formData.grn}
              name="grn"
              onChange={handleChange}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select GRN --</option>
              {GRNs.map((grn) => (
                <option key={grn.id} value={grn.id}>
                  {grn.grn_number} (Supplier: {grn.supplier})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Open Product:</label>
            <select
              value={formData.open_product}
              name="open_product"
              onChange={handleChange}
              className="form-input w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select open product --</option>
              {openProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name} (ID: {product.id}) - {product.quantity_in_stock} {product.unit} available
                </option>
              ))}
            </select>
          </div>

          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity (unit: {selectedProduct.unit}):</label>
              <input
                name="totalQuantity"
                value={totalQuantity}
                disabled
                className="form-input w-full bg-gray-100 rounded-md border-gray-300"
                type="number"
              />
            </div>
            
            <div className="form-group">
              <label className={`block text-sm font-medium ${remainingQuantity < 100 ? "text-amber-700" : "text-gray-700"} mb-1`}>
                Remaining Quantity (unit: {selectedProduct.unit}):
              </label>
              <input
                name="remainingQuantity"
                value={remainingQuantity}
                disabled
                className={`form-input w-full rounded-md ${
                  remainingQuantity < 0 
                    ? "bg-red-100 border-red-500 text-red-900" 
                    : remainingQuantity < 100 
                      ? "bg-amber-50 border-amber-300" 
                      : "bg-gray-100 border-gray-300"
                }`}
                type="number"
              />
              {remainingQuantity >= 0 && remainingQuantity < 100 && (
                <p className="mt-1 text-sm text-amber-600">
                  Low remaining quantity
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Products Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Add Packaged Products</h3>
            <button 
              type="button" 
              onClick={handleAddProduct}
              disabled={!formData.open_product}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                !formData.open_product 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 transition-colors"
              }`}
            >
              + Add Product
            </button>
          </div>
          
          {formData.open_product && formData.packages_made.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No products added yet. Click &quot;Add Product&quot; to start packaging.</p>
            </div>
          )}
          
          {!formData.open_product && (
            <div className="text-center py-8 text-gray-500">
              <p>Please select an open product first</p>
            </div>
          )}
          
          {formData.packages_made.map((product, index) => (
            <div key={index} className="bg-white p-4 mb-4 rounded-lg shadow border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={product.product}
                    onChange={(e) => handleProductChange(index, "product", e.target.value)}
                    className={`form-input w-full rounded-md border ${
                      !product.product ? "border-amber-300" : "border-gray-300"
                    } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                  >
                    <option value="">Select a product</option>
                    {packaged_products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.product_name} {prod.packaging_weight ? `(${prod.packaging_weight} ${prod.unit})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", Math.max(1, parseInt(e.target.value || 1)))}
                      className="form-input w-full text-center border-l-0 border-r-0 border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per unit</label>
                  <input
                    type="text"
                    value={product.cost_price ? `${product.cost_price.toFixed(2)}` : "-"}
                    disabled
                    className="form-input w-full bg-gray-100 rounded-md border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={product.retail_price}
                      onChange={(e) => handleProductChange(index, "retail_price", Math.max(0, parseFloat(e.target.value || 0)))}
                      className={`form-input w-full pl-12 rounded-md ${
                        !product.retail_price ? "border-amber-300" : "border-gray-300"
                      } focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm">
                  {product.product && packaged_products.find(p => p.id == product.product)?.packaging_weight && (
                    <span className="text-gray-600">
                      Total weight: {(product.quantity * packaged_products.find(p => p.id == product.product)?.packaging_weight).toFixed(2)}g
                    </span>
                  )}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => handleRemoveProduct(index)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          {formData.packages_made.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">Used Quantity:</span>
                <span className="font-medium text-blue-800">{formData.total_quantity.toFixed(2)}{selectedProduct.unit}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium text-blue-800">Remaining Quantity:</span>
                <span className={`font-medium ${remainingQuantity < 0 ? "text-red-600" : "text-blue-800"}`}>
                  {remainingQuantity.toFixed(2)}g
                </span>
              </div>
            </div>
          )}
          <div className="form-group">
              <label className={`block text-sm font-medium ${remainingQuantity < 100 ? "text-amber-700" : "text-gray-700"} mb-1`}>
                Actuall Remaining Quantity (unit: {selectedProduct.unit}):
              </label>
              <input
                name="remaining_quantity"
                value={formData.remaining_quantity}
                onChange={handleChange}
                min={0}
                className={`form-input w-full rounded-md ${
                  formData.remaining_quantity < 0 
                    ? "bg-red-100 border-red-500 text-red-900" 
                    : formData.remaining_quantity < 100 
                      ? "bg-amber-50 border-amber-300" 
                      : "bg-gray-100 border-gray-300"
                }`}
                type="number"
              />
              {formData.remaining_quantity < 0 && (
                <p className="mt-1 text-sm text-red-600">
                  Remaining Quantity cannot be negative.
                </p>
              )}
              
              {( (remainingQuantity) && (remainingQuantity-formData.remaining_quantity)/totalQuantity < -0.02 || (remainingQuantity-formData.remaining_quantity)/totalQuantity > 0.02 )&& (
                <p className="mt-1 text-sm text-amber-600">
                  Percentage Error. {(((remainingQuantity-formData.remaining_quantity)/totalQuantity)*100).toFixed(2)}%
                </p>
              )}
            </div>
        </div>

        <div className="flex justify-end mt-6">
          <button 
            type="button" 
            onClick={() => navigate("/products")}
            className="px-6 py-2 mr-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || hasValidationIssues || formData.packages_made.length === 0 || (remainingQuantity-formData.remaining_quantity)/totalQuantity < -0.02 || (remainingQuantity-formData.remaining_quantity)/totalQuantity > 0.02}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              isSubmitting || hasValidationIssues || formData.packages_made.length === 0 || ((remainingQuantity-formData.remaining_quantity)/totalQuantity < -0.02) || ((remainingQuantity-formData.remaining_quantity)/totalQuantity > 0.02)
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700 transition-colors"
            }`}
          >
            {isSubmitting ? "Processing..." : "Complete Packaging"}
          </button>
        </div>
      </form>
    </div>
  );
};

PackOpenProduct.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default PackOpenProduct;