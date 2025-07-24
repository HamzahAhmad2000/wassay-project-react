import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postHomemadeProducts, getHouseMadeProducts, getOpenProductsPrice } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getBranches, getWareHouses } from "../../APIs/CompanyAPIs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {mode === "add" ? "Add Home-made Products" : "Edit Home-made Products"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Warehouse and Branch */}
        <fieldset className="border border-gray-200 p-4 rounded-lg bg-gray-50">
          <legend className="text-lg font-semibold text-gray-700">Location</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700">
                Warehouse
              </label>
              <select
                id="warehouse"
                name="warehouse"
                value={data.warehouse}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.location}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                id="branch"
                name="branch"
                value={data.branch}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Products Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Home Made Products</h3>
          <div className="space-y-6">
            {data.homemade_products.map((product, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Product */}
                  <div>
                    <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700">
                      Product
                    </label>
                    <select
                      id={`product-${index}`}
                      name="product"
                      value={product.product}
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((prod) => (
                        <option key={prod.id} value={prod.id}>
                          {prod.product_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Received Quantity */}
                  <div>
                    <label htmlFor={`received_quantity-${index}`} className="block text-sm font-medium text-gray-700">
                      Received Qty
                    </label>
                    <input
                      type="number"
                      id={`received_quantity-${index}`}
                      name="received_quantity"
                      value={product.received_quantity}
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Unit Cost */}
                  <div>
                    <label htmlFor={`unit_cost-${index}`} className="block text-sm font-medium text-gray-700">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      id={`unit_cost-${index}`}
                      name="unit_cost"
                      value={product.unit_cost || 0}
                      disabled
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Retail Price */}
                  <div>
                    <label htmlFor={`retail_price-${index}`} className="block text-sm font-medium text-gray-700">
                      Retail Price
                    </label>
                    <input
                      type="number"
                      id={`retail_price-${index}`}
                      name="retail_price"
                      value={product.retail_price}
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Total Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                    <p className="mt-1 block w-full p-2 text-gray-700">
                      {(product.received_quantity * product.unit_cost) || 0}
                    </p>
                  </div>

                  {/* Expected Revenue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Revenue</label>
                    <p className="mt-1 block w-full p-2 text-gray-700">
                      {(product.received_quantity * product.retail_price) || 0}
                    </p>
                  </div>

                  {/* Manufacturing Date */}
                  <div>
                    <label htmlFor={`manufacturing_date-${index}`} className="block text-sm font-medium text-gray-700">
                      Mfg Date
                    </label>
                    <input
                      type="date"
                      id={`manufacturing_date-${index}`}
                      name="manufacturing_date"
                      value={product.manufacturing_date}
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label htmlFor={`expiry_date-${index}`} className="block text-sm font-medium text-gray-700">
                      Exp Date
                    </label>
                    <input
                      type="date"
                      id={`expiry_date-${index}`}
                      name="expiry_date"
                      value={product.expiry_date}
                      onChange={(e) => handleProductChange(index, e)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Remove product"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={addProduct}
            className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + Add Product
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : mode === "add" ? "Add HomeMade Product" : "Update HomeMade Product"}
          </button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

HomeMadeProductsForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default HomeMadeProductsForm;