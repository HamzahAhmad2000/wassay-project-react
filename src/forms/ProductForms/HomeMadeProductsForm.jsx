import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postHomemadeProducts, getHouseMadeProducts, getOpenProductsPrice } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getBranches, getWareHouses } from "../../APIs/CompanyAPIs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const HomeMadeProductsForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.data || {};
  const navigate = useNavigate();

  const [data, setData] = useState({
    warehouse: "",
    branch: "",
    homemade_products: [],
  })

  const [warehouses, setWarehouses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          async function fetchData() {
            try {
              const warehousesData = await getWareHouses();
              setWarehouses(warehousesData);
              const branchesData = await getBranches();
              setBranches(branchesData);
              const productsData = await getHouseMadeProducts();
              setProducts(productsData);
            } catch (err) {
              console.error("Failed to fetch data:", err);
              toast.error("Something went wrong.", err);
            }
          }
          fetchData();
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  const validateForm = () => {
    if( data.branch && data.warehouse)
      return "Select One of the following: Branch or Warehouse";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      setLoading(false);
      return;
    }

    try {
      let response;
      if (mode === "add") {
        response = await postHomemadeProducts(data);
      } else if (mode === "edit" && existingData?.id) {
        response = await postHomemadeProducts(data, existingData.id);
      }
      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to save data");
      }
        setTimeout(() => navigate("/inventory"), 1500);

    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again."+ " " +  JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevGrn) => ({ ...prevGrn, [name]: value }));
  };
  const handleProductChange = async (index, e) => {
    const updatedProducts = [...data.homemade_products];
    const { name, value } = e.target;

    if (name === "product") {
        const price = await getOpenProductsPrice(value);

        updatedProducts[index] = { 
            ...updatedProducts[index], 
            unit_cost: price.total_cost || 0, // Ensure it's never undefined
            product: value
        };
        console.table(updatedProducts[index])
    } else {
        updatedProducts[index] = { 
            ...updatedProducts[index], 
            [name]: value 
        };
        console.table(updatedProducts[index])
    }

    setData((prevGrn) => ({ ...prevGrn, homemade_products: updatedProducts }));
};

  const addProduct = () => {
    setData((prevGrn) => ({
      ...prevGrn,
      homemade_products: [
        ...prevGrn.homemade_products,
        { product: "", received_quantity: 0, unit_cost: 0.0, retail_price: 0.0, expiry_date: "", manufacturing_date: "" },
      ],
    }));
  };

  const removeProduct = (index) => {
    const updatedProducts = [...data.homemade_products];
    updatedProducts.splice(index, 1);
    setData((prevGrn) => ({ ...prevGrn, homemade_products: updatedProducts }));
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Home-made Products" : "Edit Home-made Products"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Warehouse and Branch */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse" className="text-[#101023] font-medium">
                      Warehouse
                    </Label>
                    <Select
                      value={data.warehouse}
                      onValueChange={(value) => setData(prev => ({...prev, warehouse: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-[#101023] font-medium">
                      Branch
                    </Label>
                    <Select
                      value={data.branch}
                      onValueChange={(value) => setData(prev => ({...prev, branch: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Home Made Products</h3>
                <div className="space-y-6">
                  {data.homemade_products.map((product, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Product */}
                        <div className="space-y-2">
                          <Label htmlFor={`product-${index}`} className="text-[#101023] font-medium">
                            Product
                          </Label>
                          <Select
                            value={product.product}
                            onValueChange={(value) => handleProductChange(index, { target: { name: "product", value } })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id}>
                                  {prod.product_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Received Quantity */}
                        <div className="space-y-2">
                          <Label htmlFor={`received_quantity-${index}`} className="text-[#101023] font-medium">
                            Received Qty
                          </Label>
                          <Input
                            type="number"
                            id={`received_quantity-${index}`}
                            name="received_quantity"
                            value={product.received_quantity}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full"
                          />
                        </div>

                        {/* Unit Cost */}
                        <div className="space-y-2">
                          <Label htmlFor={`unit_cost-${index}`} className="text-[#101023] font-medium">
                            Unit Cost
                          </Label>
                          <Input
                            type="number"
                            id={`unit_cost-${index}`}
                            name="unit_cost"
                            value={product.unit_cost || 0}
                            disabled
                            className="w-full"
                          />
                        </div>

                        {/* Retail Price */}
                        <div className="space-y-2">
                          <Label htmlFor={`retail_price-${index}`} className="text-[#101023] font-medium">
                            Retail Price
                          </Label>
                          <Input
                            type="number"
                            id={`retail_price-${index}`}
                            name="retail_price"
                            value={product.retail_price}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full"
                          />
                        </div>

                        {/* Total Cost */}
                        <div className="space-y-2">
                          <Label className="text-[#101023] font-medium">Total Cost</Label>
                          <p className="p-2 text-gray-700 bg-gray-50 rounded">
                            {(product.received_quantity * product.unit_cost) || 0}
                          </p>
                        </div>

                        {/* Expected Revenue */}
                        <div className="space-y-2">
                          <Label className="text-[#101023] font-medium">Revenue</Label>
                          <p className="p-2 text-gray-700 bg-gray-50 rounded">
                            {(product.received_quantity * product.retail_price) || 0}
                          </p>
                        </div>

                        {/* Manufacturing Date */}
                        <div className="space-y-2">
                          <Label htmlFor={`manufacturing_date-${index}`} className="text-[#101023] font-medium">
                            Mfg Date
                          </Label>
                          <Input
                            type="date"
                            id={`manufacturing_date-${index}`}
                            name="manufacturing_date"
                            value={product.manufacturing_date}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full"
                          />
                        </div>

                        {/* Expiry Date */}
                        <div className="space-y-2">
                          <Label htmlFor={`expiry_date-${index}`} className="text-[#101023] font-medium">
                            Exp Date
                          </Label>
                          <Input
                            type="date"
                            id={`expiry_date-${index}`}
                            name="expiry_date"
                            value={product.expiry_date}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => removeProduct(index)}
                          variant="outline"
                          className="border-red-500 text-red-700 hover:bg-red-500 hover:text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Product Button */}
                <Button
                  type="button"
                  onClick={addProduct}
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  + Add Product
                </Button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#423e7f] text-white hover:bg-[#201b50] ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Processing..." : mode === "add" ? "Add HomeMade Product" : "Update HomeMade Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

HomeMadeProductsForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default HomeMadeProductsForm;