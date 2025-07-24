import { useState, useEffect } from "react";
import "/src/styles/FormStyles.css"; // Ensure this CSS file contains the provided styles
import { getProducts, getSuppliers, postSupplierInvoice, postSupplierPayment } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import { getPurchaseOrders } from "/src/APIs/ProductAPIs";
import { getSupplierPaymentsAgainstPurchaseOrder } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
const SupplierInvoiceForm = () => {
  
  const { state } = useLocation();
  const existingData = state?.supplierInvoice || {};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    supplier: existingData?.supplier_invoice?.supplier.id || "",
    purchase_order: existingData.supplier_invoice?.purchase_order || "",
    invoice_number: existingData?.supplier_invoice?.invoice_number || "",
    invoice_date: existingData?.supplier_invoice?.invoice_date || (new Date()).toISOString().split('T')[0], // Format: YYYY-MM-DD,
    due_date: existingData?.supplier_invoice?.due_date || (new Date()).toISOString().split('T')[0], // Format: YYYY-MM-DD,
    shipping_expense: existingData?.supplier_invoice?.shipping_expense || 0,
    totalCost: existingData?.supplier_invoice?.total_cost || 0,
    payment_status: existingData?.supplier_invoice?.payment_status || "Pending",
    products: existingData?.invoice_items || [],
    image: null
  });
  // #TODO: Find a solution for quantity ordered in the update.

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  
  const [suppliers, setSupplies] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState([])
  const [products, setProducts] = useState([])
  const [amount_paid, setAmountPaid] = useState(0.0)
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [supplierPayment, setSupplierPayment] = useState({
    supplier: "" ,
    purchase_order: "",
    invoice: "",
    amount_in_bank: 0,
    amount_in_cash: 0,
    payment_method: 'CASH',
    branch: user.branch || "",
    company: user.company || "",
    payment_date: (new Date()).toISOString().split('T')[0], // Format: YYYY-MM-DD
    recorded_by: user.id,
    image: null,
    notes: ''
  });

  useEffect(() => {
    getSuppliers().then((suppliers) => {
      setSupplies(suppliers);
    });
    getProducts().then((products) => {
      setProducts(products);
    });
    getPurchaseOrders().then((purchaseOrders) => {
      setPurchaseOrders(purchaseOrders);
      setFilteredPurchaseOrders(purchaseOrders)
    });
},[])



  const handleSupplierPaymentChange = (e) => {

    const { name, value, type, files } = e.target;
    if (type === "file") {
      // Handle file input
      setSupplierPayment((prev) => ({
        ...prev,
        image: files[0] || null, // Store the first file or null if no file
      }));
    } else {
      setSupplierPayment((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name == 'supplier'){
      const tempPurchaseOrders = purchaseOrders.filter(p => p.purchase_order.supplier.id == value);
      setFilteredPurchaseOrders(tempPurchaseOrders)
    }
    else if (name == 'purchase_order'){
      let payment_in_cash = 0;
      let payment_in_bank = 0;
      const PO = filteredPurchaseOrders.find(p => p.purchase_order.id == value);
      getSupplierPaymentsAgainstPurchaseOrder(PO.purchase_order.id).then((payments) => {
        payments.map((payment) => {
          payment_in_bank += payment.amount_in_bank
          payment_in_cash += payment.amount_in_cash
        });
        setAmountPaid(payment_in_cash + payment_in_bank)
      })
      let products= []
      PO.products.forEach(element => {
        products.push({product: element.product, quantity_ordered: element.quantity, previously_received: (element.quantity_ordered - element.remaining || 0), quantity: 1, price: 0, discount: 0, tax: 0, total_price: 0, subtotal: 0})
      });

      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];

      setFormData((prev) => ({ ...prev, products: products, invoice_number: `SI/${value}/${formData.supplier}/${formattedDate}` }));
    }
    setFormData((prev)=>({ ...prev, [name]: value }));
  };


  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product: "",quantity_ordered:0, quantity: 1, price: 0, discount: 0, tax: 0, total_price: 0, subtotal: 0 }],
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];

    updatedProducts[index][field] = field === "quantity" || field === "cost" ? parseFloat(value) : value;
    updatedProducts[index].price = updatedProducts[index].total_price/updatedProducts[index].quantity;
    updatedProducts[index].subtotal = updatedProducts[index].total_price - updatedProducts[index].discount + updatedProducts[index].tax;

    setFormData({ ...formData, products: updatedProducts });

    // Update total cost
    const totalCost = updatedProducts.reduce((acc, item) => acc + parseFloat(item.quantity) * parseFloat(item.cost), 0);
    setFormData((prev) => ({ ...prev, totalCost }));
  };

  useEffect(() => {
    let totalCost = 0 + parseFloat(formData.shipping_expense);
    formData.products.forEach(product => {
      totalCost += parseFloat(product.subtotal)
    });
    setFormData((prev) => ({...prev, totalCost }));
  },[
    formData.products, formData.shipping_expense
  ])

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData({ ...formData, products: updatedProducts });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!formData.supplier || !formData.due_date || !formData.invoice_date) {
    setFormError("Please fill in all required fields.");
    toast.error("Please fill in all required fields.");
    setFormSuccess("");
    return;
  }

  // Validate products
  if (formData.products.length === 0) {
    setFormError("Please add at least one product.");
    toast.error("Please add at least one product.");
    setFormSuccess("");
    return;
  }

  const invalidProducts = formData.products.some(
    product => !product.product || !product.quantity || !product.price
  );
  if (invalidProducts) {
    setFormError("Please fill in all product details.");
    toast.error("Please fill in all product details.");
    setFormSuccess("");
    return;
  }

  // Restructure the data
  let total_cost = 0 + parseFloat(formData.shipping_expense || 0.0);
  formData.products.forEach(product => {
    total_cost += product.subtotal;
  });

  const sendData = new FormData()

  console.log(formData)

  // Append products array
    sendData.append("invoice_items", JSON.stringify(
      formData.products.map(product => ({
      product: product?.product?.id || product?.product,
      quantity: parseFloat(product.quantity).toFixed(2),
      price: parseFloat(product.price).toFixed(2),
      discount: parseFloat(product.discount).toFixed(2),
      tax: parseFloat(product.tax).toFixed(2),
      total_price: parseFloat(product.total_price).toFixed(2),
      subtotal: parseFloat(product.subtotal).toFixed(2),
      }))
    ));
    sendData.append("supplier_invoice[supplier]", formData.supplier);
    sendData.append("supplier_invoice[purchase_order]", formData.purchase_order);
    sendData.append("supplier_invoice[shipping_expense]", formData.shipping_expense);
    sendData.append("supplier_invoice[due_date]", formData.due_date);
    sendData.append("supplier_invoice[invoice_date]", formData.invoice_date);
    sendData.append("supplier_invoice[invoice_number]", formData.invoice_number);
    sendData.append("supplier_invoice[payment_status]", formData.payment_status);
    sendData.append("supplier_invoice[total_amount]", parseFloat(total_cost));
    if(formData.image) {
      sendData.append("supplier_invoice[image]", formData.image);
    }
  // const submissionData = {
  //   supplier_invoice: {
  //     supplier: formData.supplier,
  //     purchase_order: formData?.purchase_order,
  //     shipping_expense: parseFloat(formData.shipping_expense).toFixed(2),
  //     due_date: formData.due_date,
  //     invoice_date: formData.invoice_date,
  //     invoice_number: formData.invoice_number,
  //     payment_status: formData.payment_status,
  //     total_amount: parseFloat(total_cost),
  //   },
  //    invoice_items: formData.products.map(product => ({
  //     product: product?.product?.id || product?.product,
  //     quantity: parseFloat(product.quantity).toFixed(2),
  //     price: parseFloat(product.price).toFixed(2),
  //     discount: parseFloat(product.discount).toFixed(2),
  //     tax: parseFloat(product.tax).toFixed(2),
  //     total_price: parseFloat(product.total_price).toFixed(2),
  //     subtotal: parseFloat(product.subtotal).toFixed(2),
  //   })),
  // };

  try {
    // Submit Supplier Invoice first
    const response = await postSupplierInvoice(sendData);
    const SI = await response.json();

    if (SI?.supplier_invoice?.id) {

      if(formData.payment_status == 'On Receiving'){
        // Now submit Supplier Payment with the returned invoice ID
        const newSupplierPayment = {
          ...supplierPayment,
          invoice: SI.supplier_invoice.id,
        };

        // Create FormData object
      const supplierFormData = new FormData();
      console.log("newSupplierPayment:", newSupplierPayment)

      Object.keys(newSupplierPayment).forEach((key) => {
        console.log(key, newSupplierPayment[key])
        supplierFormData.append(key, newSupplierPayment[key])
      })
        
        const paymentResponse = await postSupplierPayment(supplierFormData);
        
        if (paymentResponse?.id) {
          toast.success("Supplier payment submitted successfully!");
          
          // await postPayment(newSupplierPayment);  // If needed
        } else {
          console.error("Failed to create Supplier Payment");
        }
      }
      
      setFormSuccess("Supplier Invoice and Payment submitted successfully!");
      toast.success("Supplier Invoice submitted successfully!");
      setTimeout(() => navigate("/supplier-invoices"), 1500);
      setFormError("");
    } else {
      throw new Error("Supplier Invoice submission failed");
    }

  } catch (error) {
    setFormError(error.message || "Failed to submit Supplier Invoice or Payment.");
    toast.error(error.message || "Failed to submit Supplier Invoice or Payment.");
    console.error("Submission error:", error);
  }
};


  return (
    <div className="form-container">
      <h2 className="form-heading">Create Supplier Invoice</h2>
      {formError && <p className="error-text">{formError}</p>}
      {formSuccess && <p className="success-text">{formSuccess}</p>}
      <form className="supplier-form" onSubmit={handleSubmit}>
       
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

        {/* Supplier */}
        <div className="form-group">
          <label htmlFor="purchase_order">Purchase Order</label>
          <select
            id="purchase_order"
            name="purchase_order"
            value={formData.purchase_order}
            onChange={(e)=>{
              handleChange(e)
              handleSupplierPaymentChange(e)
            }}
            className="form-input"
          >
            <option value="">Select a Purchase Order</option>
            {filteredPurchaseOrders.map((order) => (
              <option key={order.purchase_order.id} value={order.purchase_order.id}>
                {order.purchase_order.id} - {order.purchase_order.purchase_order_number}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Date */}
        <div className="form-group">
          <label htmlFor="invoice_number">Invoice Number</label>
          <input
            type="text"
            id="invoice_number"
            name="invoice_number"
            value={formData.invoice_number}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="invoice_date">Invoice Date</label>
          <input
            type="date"
            id="invoice_date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleChange}
            className="form-input"
          />
          
          <DateEventsDisplay
              date={formData.invoice_date}
              className="text-gray-600"
            />
        </div>


        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="form-input"
          />

          <DateEventsDisplay
              date={formData.due_date}
              className="text-gray-600"
            />
        </div>

        <div className="form-group">
          <label htmlFor="shipping_expense">Shipping Expense</label>
          <input
            type="number"
            id="shipping_expense"
            min={0}
            name="shipping_expense"
            value={formData.shipping_expense}
            onChange={handleChange}
            className="form-input"
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
                  <label className="mb-1 text-sm text-gray-600">Quantity Ordered</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Quantity Ordered"
                    disabled
                    value={product.quantity_ordered}
                    onChange={(e) => handleProductChange(index, "quantity_ordered", Math.max(1, e.target.value))}
                    className="form-input w-25 rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Previously Received Quantity</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Previously Received Quantity"
                    disabled
                    value={product.previously_received}
                    // onChange={(e) => handleProductChange(index, "quantity_ordered", Math.max(1, e.target.value))}
                    className="form-input w-25 rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Quantity Received</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Quantity"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, "quantity", Math.max(0, e.target.value))}
                    className="form-input w-25 rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Total Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Total Cost"
                    value={product.total_price}
                    onChange={(e) => handleProductChange(index, "total_price", Math.max(0, e.target.value))}
                    className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>


                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Discount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Discount Amount"
                    value={product.discount}
                    onChange={(e) => handleProductChange(index, "discount", Math.max(0, e.target.value))}
                    className="form-input w-full rounded border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                

                <div className="flex flex-col">
                  <label className="mb-1 text-sm text-gray-600">Tax</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Tax Amount"
                    value={product.tax}
                    onChange={(e) => handleProductChange(index, "tax", Math.max(0, e.target.value))}
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

              
              
              <div className="text-right mt-2 text-sm text-gray-600">
                Subtotal: {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: 'PKR' 
                }).format(((product.quantity * product.price)- product.discount + product.tax) || 0)}
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
            <img src={formData.image ? URL.createObjectURL(formData.image) : ""} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>


         {/* Payment Status */}
         <div className="form-group">
          <label htmlFor="payment_status">Payment Status</label>
          <select
            id="payment_status"
            name="payment_status"
            value={formData.payment_status}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select a Payment Status</option>
              
            <option value={"ADVANCE"}>
                Advance
              </option>
              <option value={"On Receiving"}>
                On Receiving
              </option>
              <option value={"Credit"}>
                Credit
              </option>
              
          </select>
        </div>


        {/* Total Cost */}
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
          <label className="block text-gray-600">Total Cost</label>
          <p className="text-xl font-bold text-blue-500">
            {new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'USD' 
            }).format(formData.totalCost || 0)}
          </p>
        </div>

        {formData.payment_status && formData.payment_status == 'On Receiving' &&( <>
          <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            name="payment_method"
            value={supplierPayment.payment_method || 'CASH'}
            onChange={handleSupplierPaymentChange}
            className="form-input"
          >
            <option value="CASH">Cash</option>
            <option value="BANK">Bank Transfer</option>
            <option value="MOBILE">Mobile Payment</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        {supplierPayment.payment_method === 'CASH' ? (
            <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                    type="number"
                    name="amount_in_cash"
                    value={supplierPayment.amount_in_cash || 0}
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
                    value={supplierPayment.amount_in_bank || 0}
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
            value={supplierPayment.payment_date}
            onChange={handleSupplierPaymentChange}
            className="form-input"
          />
          <DateEventsDisplay
              date={supplierPayment.payment_date}
              className="text-gray-600"
            />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={supplierPayment.notes}
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
          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
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

export default SupplierInvoiceForm;
