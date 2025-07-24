import { useState, useEffect } from "react";
import "/src/styles/FormStyles.css"; // Ensure this CSS file contains the provided styles
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { getProducts, getSuppliers, postPurchaseOrder, postSupplierPayment } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";



const PurchaseOrderForm = () => {
  
  const { state } = useLocation();
  const existingData = state?.purchaseOrder || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [formData, setFormData] = useState({
    company: existingData?.purchase_order?.company.id || user.company || "",
    warehouse: existingData?.purchase_order?.warehouse.id || user.warehouse || "",
    branch: existingData?.purchase_order?.branch.id || user.branch || "",
    supplier: existingData?.purchase_order?.supplier.id || "",
    deliveryDate: existingData?.purchase_order?.delivery_date || "",
    products: existingData?.products || [],
    image: existingData?.purchase_order?.image || "",
  });

  const navigate = useNavigate()

   // Form state
   const [advancePaymentFormData, setAdvancePaymentFormData] = useState({
    supplier: "" ,
    purchase_order: "",
    invoice: "",
    amount_in_bank: 0,
    amount_in_cash: 0,
    payment_method: 'CASH',
    payment_date: (new Date()).toISOString().split('T')[0], // Format: YYYY-MM-DD
    recorded_by: user.id,
    image: null,
    notes: ''
  });


  const [advancePayment, setAdvancePayment] = useState(false);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [suppliers, setSupplies] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (user && user.is_superuser)
      getCompanies().then((companies) => {
        setCompanies(companies);
      });
    if (user && !user.branch)
      getBranches().then((branches) => {
        setBranches(branches);
      });
    if (user && !user.warehouse)
      getWareHouses().then((warehouses) => {
        setWarehouses(warehouses);
      });
    getSuppliers().then((suppliers) => {
      setSupplies(suppliers);
    });
    getProducts().then((products) => {
      setProducts(products);
    });
},[])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product: "", quantity: 1}],
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] = field === "quantity" ? parseFloat(value) : value;
    setFormData({ ...formData, products: updatedProducts });
  };
  const handleSupplierPaymentChange = (e) => {

    const { name, value, type, files } = e.target;
    if (type === "file") {
      // Handle file input
      setAdvancePaymentFormData((prev) => ({
        ...prev,
        image: files[0] || null, // Store the first file or null if no file
      }));
    } else {
      setAdvancePaymentFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products: updatedProducts });
  };

  

  useEffect(() => {
    const PostAP = async () =>{
      // Create FormData object
      const supplierFormData = new FormData();
      console.log("advancePaymentFormData:", advancePaymentFormData)

      Object.keys(advancePaymentFormData).forEach((key) => {
        console.log(key, advancePaymentFormData[key])
        supplierFormData.append(key, advancePaymentFormData[key])
      })

      try {
        const response = await postSupplierPayment(supplierFormData); // No ID for create
        console.log("response:", response)
        // setSuccess("Supplier payment submitted successfully!");
        toast.success("Supplier payment submitted successfully!");
        // Reset form
        setAdvancePayment(false);
        setAdvancePaymentFormData({
          payment_method: "CASH",
          amount_in_cash: 0,
          amount_in_bank: 0,
          payment_date: "",
          notes: "",
          image: null,
        });
      } catch (err) {
        // setError(err.message || "Failed to submit supplier payment.");
        toast.error(err.message || "Failed to submit supplier payment.");
      }
    }

    if (advancePayment && advancePaymentFormData.purchase_order) {
      PostAP();
    }
  }, [advancePaymentFormData, advancePaymentFormData.purchase_order, advancePayment])

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.company || !formData.supplier) {
      setFormError("Please fill in all required fields.");
      setFormSuccess("");
      return;
    }

    if (formData.products.length === 0) {
      setFormError("Please add at least one product.");
      setFormSuccess("");
      return;
    }

    // Validate each product has required fields
    const invalidProducts = formData.products.some(
      product => !product.product || !product.quantity
    );
    if (invalidProducts) {
      setFormError("Please fill in all product details.");
      setFormSuccess("");
      return;
    }

    // Restructure the data to match backend expectations

    const sendData = new FormData()
    // Append products array
    sendData.append("products", JSON.stringify(
      formData.products.map(product => ({
        product: existingData.length > 0 ? product.product.id : product.product, // Product ID
        quantity: parseInt(product.quantity),
      }))
    ));

    console.log(formData)

    // Append purchase order fields
    sendData.append("purchase_order[company]", formData.company);
    sendData.append("purchase_order[warehouse]", formData.warehouse);
    sendData.append("purchase_order[branch]", formData.branch);
    sendData.append("purchase_order[supplier]", formData.supplier);
    sendData.append("purchase_order[delivery_date]", formData.deliveryDate);
    sendData.append("purchase_order[total_cost]", parseFloat(formData.totalCost));
    if (formData.image) {
      sendData.append("purchase_order[image]", formData.image); // Append image file
    }

    try {
      const  response = await postPurchaseOrder(sendData, existingData?.purchase_order?.id);
      const jsonResponse = await response.json();
      if (await jsonResponse.status == 'success'){
        if(advancePayment){

          advancePaymentFormData.purchase_order = jsonResponse.data.purchase_order.id;
          setAdvancePaymentFormData((advancePaymentFormData=> ({ ...advancePaymentFormData, purchase_order: jsonResponse.data.purchase_order.id })));
        }
      }
      setFormSuccess("Purchase Order submitted successfully!", response);
      
      // Reset the form
      // setFormData({
      //   company: "",
      //   warehouse: "",
      //   branch: "",
      //   supplier: "",
      //   deliveryDate: "",
      //   totalCost: 0,
      //   products: [],
      // });

        setTimeout(() => navigate("/purchase-orders"), 1500);

      setFormError("");
    } catch (error) {
      setFormError(
        error.response?.data?.message || 
        "Failed to submit purchase order. Please try again."
      );
      console.error("Error submitting purchase order:", error);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">Create Purchase Order</h2>
      {formError && <p className="error-text">{formError}</p>}
      {formSuccess && <p className="success-text">{formSuccess}</p>}
      <form className="company-form" onSubmit={handleSubmit}>
        {/* Company */}
        {user && user.is_superuser && (

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <select
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          )}

        {/* Warehouse */}
        {user && !user.warehouse && (

          <div className="form-group">
            <label htmlFor="warehouse">Warehouse</label>
            <select
              id="warehouse"
              name="warehouse"
              value={formData.warehouse}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.address}
                </option>
              ))}
            </select>
          </div>
          )}

        {/* Branch */}
        {user && !user.branch && (
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.address}
                </option>
              ))}
            </select>
          </div>
          )}

        {/* Supplier */}
        <div className="form-group">
          <label htmlFor="supplier">Supplier</label>
          <select
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={(e)=>{
              handleChange(e)
              handleSupplierPaymentChange(e)
            }}
            className="form-input"
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Date */}
        <div className="form-group">
          <label htmlFor="deliveryDate">Delivery Date</label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleChange}
            className="form-input"
          />

          <DateEventsDisplay
              date={formData.deliveryDate}
              className="text-gray-600"
            />
        </div>

        {/* Products Section */}
        <div className="mt-8 mb-8 p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <button 
              type="button" 
              onClick={handleAddProduct}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              + Add Product
            </button>
          </div>
          
          {formData.products.map((product, index) => (
            <div key={index} className="bg-gray-50 p-4 mb-4 rounded-lg">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Product</label>
                  <select
                    value={product.product.id}
                    onChange={(e) => handleProductChange(index, "product", e.target.value)}
                    className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={""}>Select a product</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.product_name} {prod.packaging_weight? `- ${prod.packaging_weight}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", Math.max(1, e.target.value))}
                    className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button 
                  type="button" 
                  onClick={() => handleRemoveProduct(index)}
                  className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center transition-colors"
                  aria-label="Remove product"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="form-input"
            required
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        
        <div>
          <input type="checkbox" id="advancePayment" name="advancePayment" checked={advancePayment} onChange={(e) => setAdvancePayment(e.target.checked)} />
          <label htmlFor="advancePayment" className="ml-2">Advance Payment</label>
        </div>


        {advancePayment && ( <>
          <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            name="payment_method"
            value={advancePaymentFormData.payment_method || 'CASH'}
            onChange={handleSupplierPaymentChange}
            className="form-input"
          >
            <option value="CASH">Cash</option>
            <option value="BANK">Bank Transfer</option>
            <option value="MOBILE">Mobile Payment</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        {advancePaymentFormData.payment_method === 'CASH' ? (
            <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                    type="number"
                    name="amount_in_cash"
                    value={advancePaymentFormData.amount_in_cash || 0}
                    onChange={handleSupplierPaymentChange}
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Enter amount"
                    />
            </div>
        ):(        
            <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                    type="number"
                    name="amount_in_bank"
                    value={advancePaymentFormData.amount_in_bank || 0}
                    onChange={handleSupplierPaymentChange}
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Enter amount"
                />
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Date</label>
          <input
            type="date"
            name="payment_date"
            value={advancePaymentFormData.payment_date}
            onChange={(e)=>{
              handleSupplierPaymentChange(e)
            }}
            className="form-input"
          />

         <DateEventsDisplay
              date={advancePaymentFormData.payment_date}
              className="text-gray-600"
            />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={advancePaymentFormData.notes}
            onChange={handleSupplierPaymentChange}
            className="form-input"
            rows="4"
            placeholder="Enter any notes"
          />
        </div>

        
        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required

            className="form-input"
            onChange={handleSupplierPaymentChange}
          />
          
          {advancePayment.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(advancePayment.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>


        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium `}
        >
          {'Save Payment'}
        </button>
        </>

        )}

        {/* Submit */}
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;
