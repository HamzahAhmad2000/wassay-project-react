import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getSuppliers, postGRN, getProducts, getPurchaseOrdersAgainstSupplier, getSupplierInvoiceAgainstSupplierAndPurchaseOrder } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getBranches, getWareHouses } from "../../APIs/CompanyAPIs";
import { ToastContainer, toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const GRNForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.grn || {};

  const [grn, setGrn] = useState({
    supplier: existingData?.supplier || "",
    supplier_invoice: existingData?.supplier_invoice || "",
    purchase_order: existingData?.purchase_order || "",
    grn_date: existingData?.grn_date || "",
    batch_number: existingData?.batch_number || "",
    bill_no: existingData?.bill_no || "",
    bill_date: existingData?.bill_date || "",
    invoice_number: existingData?.invoice_number || "",
    invoice_picture: null,
    image: null,
    payment_method: existingData?.payment_method || "",
    payment_status: existingData?.payment_status || "",
    shipping_expense: existingData?.shipping_expense || 0.0,
    total_tax: existingData?.total_tax || 0.0,
    total_cost: existingData?.total_cost || 0.0,
    discount_amount: existingData?.discount_amount || 0.0,
    total_amount: existingData?.total_amount || 0.0,
    warehouse: existingData?.warehouse || "",
    branch: existingData?.branch || "",
    grn_number: existingData?.grn_number || "",
    grn_products: existingData?.grn_products || [],
  });

  useEffect(() => {
    setGrn((prevGrn) => ({
      ...prevGrn,
      total_amount: parseFloat(grn.shipping_expense) + parseFloat(grn.total_tax) + parseFloat(grn.total_cost) - parseFloat(grn.discount_amount),
    }));
  },[grn.shipping_expense, grn.total_tax, grn.total_cost, grn.discount_amount, grn.total_amount]);

  const [suppliers, setSuppliers] = useState([]);
  const [estimatedRevenue, setEstimatedRevenue] = useState(0);
  
  const [filteredSupplierInvoices, setFilteredSupplierInvoices] = useState([]);
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState([]);

  const [warehouses, setWarehouses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData);
        const warehousesData = await getWareHouses();
        setWarehouses(warehousesData);
        const branchesData = await getBranches();
        setBranches(branchesData);
        const productsData = await getProducts();
        setProducts(productsData);

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Unable to load data. Please try again later.");
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!grn.supplier) {
      setError("Supplier is required.");
      return false;
    }
    if (!grn.supplier_invoice) {
      setError("Supplier Invoice is required.");
      return false;
    }
    if (!grn.purchase_order) {
      setError("Purchase Order is required.");
      return false;
    }
    if (!grn.grn_date) {
      setError("GRN Date is required.");
      return false;
    }
    if (!grn.batch_number) {
      setError("Batch Number is required.");
      return false;
    }
    if (!grn.bill_no) {
      setError("Bill No is required.");
      return false;
    }
    if (!grn.bill_date) {
      setError("Bill Date is required.");
      return false;
    }
    if (!grn.invoice_number) {
      setError("Invoice Number is required.");
      return false;
    }
    if (!grn.payment_method) {
      setError("Payment Method is required.");
      return false;
    }
    if (!grn.payment_status) {
      setError("Payment Status is required.");
      return false;
    }
    if (!grn.total_cost) {
      setError("Total Cost is required.");
      return false;
    }
    if (!grn.total_amount) {
      setError("Total Amount is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body = { ...grn };

    const formData = new FormData();

    Object.keys(body).forEach((key) => {
      if (key !== "grn_products") {
        if (body[key] != null || body[key] != undefined) 
          formData.append(key, body[key]);
      } else {
        body[key].forEach((product) => {
          product.retail_price = parseFloat(product.retail_price) / parseFloat(product.received_quantity);
        })
        formData.append(key, JSON.stringify(body[key]));
      }
    });

    try {
      let response;
      if (mode === "add") {
        response = await postGRN(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postGRN(formData, existingData.id);
      }

      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "GRN added successfully!" : "GRN updated successfully!");
        toast.success(mode === "add" ? "GRN added successfully!" : "GRN updated successfully!");
        setTimeout(() => navigate("/grns"), 1500); // Auto-redirect
      } else {
        const data = await response.json();
        toast.error(data.detail || "Failed to process GRN. Please check your inputs.");
        setError(data.detail || "Failed to process GRN. Please check your inputs.");
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name=="supplier_invoice"){
      const selected= filteredSupplierInvoices.find(p=>(p.supplier_invoice.id==value))
      setPaymentStatus(selected?.supplier_invoice?.payment_status || "Pending")
    }
    setGrn((prevGrn) => ({
      ...prevGrn,
      [name]: value,
    }));
  };

  useEffect(()=>{
    if(grn.supplier)
      getPurchaseOrdersAgainstSupplier(grn.supplier).then((response)=>{
        setFilteredPurchaseOrders(response)
      })

    if (grn.supplier && grn.purchase_order)
      getSupplierInvoiceAgainstSupplierAndPurchaseOrder(grn.supplier, grn.purchase_order).then((response)=>{
        setFilteredSupplierInvoices(response)
      })
  },[grn.supplier, grn.purchase_order])

  useEffect(() =>{
    let selectedInvoice ;
    let selectedPurchaseOrder ;
    if(grn.supplier_invoice && filteredSupplierInvoices?.length>0){

      selectedInvoice = filteredSupplierInvoices.find(
        (invoice) => invoice.supplier_invoice.id == grn.supplier_invoice
      );
    }
    if(grn.purchase_order && filteredPurchaseOrders?.length>0){
      selectedPurchaseOrder = filteredPurchaseOrders.find(
        (order) => order.purchase_order.id == grn.purchase_order
      );
    }
    if (selectedInvoice && selectedPurchaseOrder) {
      console.table(selectedInvoice.invoice_items);
      console.table(selectedPurchaseOrder.products);
      const productsFromInvoice = selectedInvoice.invoice_items.map((item) => {
        const purchaseOrderProduct = selectedPurchaseOrder.products.find(
          (poItem) => poItem.product.id === item.product.id
        );



        return {
          product: item.product.id,
          received_quantity: 0,
          quantity_in_supplier_invoice: item.quantity || 0,
          unit_cost: item.price,
          unit: item.product.unit,
          expiry_date: "",
          manufacturing_date: "",
          quantity_in_purchase_order: purchaseOrderProduct ? purchaseOrderProduct.quantity : 0,
        };
      });
      setGrn((prevGrn) => ({
        ...prevGrn,
        grn_products: productsFromInvoice,
      }));
    }
  },[grn.supplier_invoice, grn.purchase_order, filteredSupplierInvoices])

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setGrn((prevGrn) => ({
      ...prevGrn,
      [name]: files[0],
    }));
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;

    // Validate numeric inputs
    if (["received_quantity", "unit_cost", "retail_price"].includes(name)) {
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        return; // Don't update if invalid number
      }
    }
    
    // First update the products array
    const updatedProducts = [...grn.grn_products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [name]: value,
    };
  
    // Calculate totals based on updated products
    if (name === "received_quantity" || name === "unit_cost") {
      const t_cost = updatedProducts.reduce((sum, product) => {
        const qty = parseFloat(product.received_quantity) || 0;
        const cost = parseFloat(product.unit_cost) || 0;
        return sum + (qty * cost);
      }, 0);
  
      setGrn((prevGrn) => ({
        ...prevGrn,
        grn_products: updatedProducts,
        total_cost: t_cost
      }));
    } 
    else if (name === "retail_price" || name === "received_quantity") {
      const estimated = updatedProducts.reduce((sum, product) => {
        const price = parseFloat(product.retail_price) || 0;
        return sum + (price);
      }, 0);
  
      setGrn((prevGrn) => ({
        ...prevGrn,
        grn_products: updatedProducts
      }));
      setEstimatedRevenue(estimated); // Fixed typo
    }
    else {
      // For other fields, just update the products array
      setGrn((prevGrn) => ({
        ...prevGrn,
        grn_products: updatedProducts,
      }));
    }
  };

  const addProduct = () => {
    setGrn((prevGrn) => ({
      ...prevGrn,
      grn_products: [
        ...prevGrn.grn_products,
        { product: "", received_quantity: 0, unit_cost: 0.0, retail_price: 0.0, expiry_date: "", manufacturing_date: "" },
      ],
    }));
  };

  const removeProduct = (index) => {
    const updatedProducts = [...grn.grn_products];
    updatedProducts.splice(index, 1);
    setGrn((prevGrn) => ({
      ...prevGrn,
      grn_products: updatedProducts,
    }));
  };

  return (
    <div className="form-container">
       <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
      <h2 className="form-heading">{mode === "add" ? "Add GRN" : "Edit GRN"}</h2>
      <form className="grn-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Supplier:</label>
          <select
            name="supplier"
            value={grn.supplier}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Purchase Order:</label>
          <select
            name="purchase_order"
            value={grn.purchase_order}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Purchase Order</option>
            {filteredPurchaseOrders.length > 0 && filteredPurchaseOrders.map((order) => (
              <option key={order.purchase_order.id} value={order.purchase_order.id}>
                {order.purchase_order.purchase_order_number}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Supplier Invoice:</label>
          <select
            name="supplier_invoice"
            value={grn.supplier_invoice}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Select Supplier Invoice</option>
            {filteredSupplierInvoices.map((invoice) => (
              <option key={invoice.supplier_invoice.id} value={invoice.supplier_invoice.id}>
                {invoice.supplier_invoice.invoice_number}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>GRN Date:</label>
          <input
            type="date"
            name="grn_date"
            value={grn.grn_date}
            onChange={handleChange}
            className="form-input"
            required
          />
          
          <DateEventsDisplay
              date={grn.grn_date}
              className="text-gray-600"
            />
        </div>
        <div className="form-group">
          <label>Batch Number:</label>
          <input
            type="number"
            name="batch_number"
            value={grn.batch_number}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Supplier Bill No:</label>
          <input
            type="number"
            name="bill_no"
            value={grn.bill_no}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Payment Date:</label>
          <input
            type="date"
            name="bill_date"
            value={grn.bill_date}
            onChange={handleChange}
            className="form-input"
          />
          
          <DateEventsDisplay
              date={grn.bill_date}
              className="text-gray-600"
            />
        </div>

        <div className="form-group">
          <label>Invoice Number:</label>
          <input
            type="number"
            name="invoice_number"
            value={grn.invoice_number}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Invoice Picture:</label>
          <input
            type="file"
            name="invoice_picture"
            onChange={handleFileChange}
            className="form-input"
          />

           {grn.invoice_picture &&
            // Display the invoice_picture preview if an invoice_picture is selected
            <img src={grn.invoice_picture ? URL.createObjectURL(grn.invoice_picture) : ""} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

         <div className="form-group">
          <label>Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="form-input"
            required
            onChange={handleFileChange}
          />
          
          
          {grn.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(grn.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Payment Method:</label>
          <select
            type="text"
            name="payment_method"
            value={grn.payment_method}
            onChange={handleChange}
            className="form-input"
          >
            <option value="" defaultChecked disabled>Select Payment Method</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Payment Status:</label>
          <select
            type="text"
            name="payment_status"
            value={grn.payment_status}
            onChange={handleChange}
            className="form-input"
          >
            <option value="" defaultChecked disabled>Select Payment Status</option>
            <option value="paid">Paid</option>
            <option value="paid">Partial</option>
            <option value="due">Due</option>
          </select>
        </div>
        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Shipping Expense:</label>
          <input
            type="number"
            name="shipping_expense"
            value={grn.shipping_expense}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        
        
        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Total Cost:</label>
          <input
            type="number"
            name="total_cost"
            value={grn.total_cost.toFixed(2)}
            className="form-input"
            disabled
            required
          />
        </div>
        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Discount Amount:</label>
          <input
            type="number"
            name="discount_amount"
            value={grn.discount_amount}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group" style={{display: paymentStatus==="Advance" ? "none" : "block"}}>
          <label>Total Tax:</label>
          <input
            type="number"
            name="total_tax"
            value={grn.total_tax}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Total Amount:</label>
          <input
            type="number"
            name="total_amount"
            value={grn.total_amount}
            onChange={handleChange}
            className="form-input"
            disabled
          />
        </div>
        <div className="form-group">
          <label>Warehouse:</label>
          <select
            name="warehouse"
            value={grn.warehouse}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.location}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Branch:</label>
          <select
            name="branch"
            value={grn.branch}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.location}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>GRN Number:</label>
          <input
            type="text"
            name="grn_number"
            value={grn.grn_number}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <h3>GRN Products</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity in Supplier invoice</th>
              <th>Quantity in Purchase order</th>
              <th>Received Quantity</th>
              <th>Unit Cost</th>
              <th>Total Cost</th> 
              <th>Retail Price</th>
              <th>Retail Price / Unit</th>
              <th>Manufacturing Date</th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {grn.grn_products.map((product, index) => (
              <tr key={index}>
                <td>
                  <select
                    name="product"
                    value={product.product}
                    onChange={(e) => handleProductChange(index, e)}
                    className="form-input"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.product_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity_in_supplier_invoice"
                    value={product.quantity_in_supplier_invoice}
                    className="form-input"
                    disabled
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="quantity_in_purchase_order"
                    value={product.quantity_in_purchase_order}
                    className="form-input"
                    disabled
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="received_quantity"
                    value={product.received_quantity}
                    onChange={(e) => handleProductChange(index, e)}
                    className="form-input"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="unit_cost"
                    value={product.unit_cost}
                    className="form-input"
                    disabled
                  />
                </td>
                <td>{product.received_quantity * product.unit_cost}</td>
                
                  {/* Retail Price */}
                  <td >
                    <input
                      type="number"
                      id={`retail_price-${index}`}
                      name="retail_price"
                      value={product.retail_price}
                      onChange={(e) => handleProductChange(index, e)}
                      className="form-input"
                      required
                    />
                  </td>

                  {/* Retail Price  Per  Unit*/}
                  <td >
                      {((parseFloat(product.retail_price)/parseFloat(product.received_quantity).toFixed(2) || 0) + " " + product.unit)}
                      
                  </td>

                <td>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={product.manufacturing_date}
                    onChange={(e) => handleProductChange(index, e)}
                    className="form-input"
                  />
                </td>                
                <td>
                  <input
                    type="date"
                    name="expiry_date"
                    value={product.expiry_date}
                    onChange={(e) => handleProductChange(index, e)}
                    className="form-input"
                  />
                </td>
                <td>
                  <button type="button" onClick={() => removeProduct(index)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addProduct}>
          Add Product
        </button>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add GRN" : "Update GRN"}
        </button>
      </form>

      <h3 className="text-2xl font-bold flex">Total Cost: <p className="text-red-500 font-medium pl-3">{grn.total_amount || 0}</p></h3>
      <h3 className="text-2xl font-bold flex">Estimated Revenue: <p className="text-green-500  font-medium pl-3">{estimatedRevenue}</p></h3>
    </div>
  );
};


GRNForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};


export default GRNForm