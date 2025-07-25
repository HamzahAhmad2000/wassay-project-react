import { useState, useEffect, useMemo, useRef } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postReceipts } from "/src/APIs/TaxAPIs";
import { postCLP, getCustomers, getCLPByCustomer } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getInventoryByBranch } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { getLPR } from "/src/APIs/CompanyAPIs";

const CashierReceiptForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const existingData = state?.receipt || {};
  const [user] = useState(JSON.parse(localStorage.getItem("OrbisUser")));

  const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState({});
  const [loyaltyRules, setLoyaltyRules] = useState(null); // Store loyalty rules
  const [usedLoyaltyPoints, setUsedLoyaltyPoints] = useState(0); // Track used points

  // Initialize line items
  const initialLineItems = Array.isArray(existingData.line_items)
    ? existingData.line_items
    : (existingData.line_items ? [existingData.line_items] : []);

  const [lineItems, setLineItems] = useState(initialLineItems.length ? initialLineItems : [{
    product: "",
    quantity: 1,
    discount: 0,
    price: 0,
    total_price: 0
  }]);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [transactionStarted, setTransactionStarted] = useState(false);
  const transactionStartTime = useRef(null);

  const [receipt, setReceipt] = useState({
    id: existingData.id || "",
    branch: existingData?.branch || user?.branch || "",
    customer: existingData?.customer?.id || "",
    sales_person: existingData?.sales_person?.id || user?.id || "",
    payment_method: existingData?.payment_method || "",
    payment_status: existingData?.payment_status || "Pending",
    transection_id: existingData?.transection_id || "",
    tax_amount: existingData?.tax_amount || 0.0,
    on_hold: false,
    discount_amount: existingData?.discount_amount || 0.0,
    total_amount: existingData?.total_amount ? (existingData.total_amount - existingData.discount_amount + existingData.tax_amount) : 0.0,
    amount_paid: existingData?.amount_paid || 0.0,
    payment_by_cash: existingData?.payment_by_cash || 0.0,
    payment_by_card: existingData?.payment_by_card || 0.0,
    payment_by_gift_card: existingData?.payment_by_gift_card || 0.0,
    payment_by_credit_card: existingData?.payment_by_credit_card || 0.0,
    payment_by_bank_transfer: existingData?.payment_by_bank_transfer || 0.0,
    payment_by_mobile_money: existingData?.payment_by_mobile_money || 0.0,
    online_sale: existingData?.online_sale || false,
    invoice_number: existingData?.invoice_number || "",
    transaction_time: existingData?.transaction_time || 0,
    line_items: initialLineItems,
    gift_receipt: existingData?.gift_receipt || false,
    loyalty_points_used: existingData?.loyalty_points_used || 0, // Add field for tracking
  });

  // Fetch loyalty point rules
  useEffect(() => {
    async function fetchLoyaltyRules() {
      try {
        const response = await getLPR()
        console.log('LPR', response)
        setLoyaltyRules(response[0]); // Assuming single rule per company
      } catch (err) {
        console.error("Failed to fetch loyalty rules:", err);
        toast.error("Unable to load loyalty point rules.");
      }
    }
    if (user?.company) {
      fetchLoyaltyRules();
    }
  }, [user.company]);


  useEffect(()=>{
    console.log("receipt.customer", receipt.customer)
    console.log("loyaltyRules:",loyaltyRules)
    console.log("availableLoyaltyPoints:",availableLoyaltyPoints.points)
  }, 
  [receipt.customer, loyaltyRules, availableLoyaltyPoints.points])

  // Verify token
  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    verifyToken(token).catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch customers and products
  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, productsData] = await Promise.all([
          getCustomers(),
          getInventoryByBranch("branch", user.branch)
        ]);
        setCustomers(customersData);
        setProducts(productsData.filter(product => product.quantity_in_stock > 0));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Unable to load data. Please try again later.");
        toast.error("Unable to load data. Please try again later.");
      }
    }
    fetchData();
  }, [user.branch]);

  // Fetch customer loyalty points
  useEffect(() => {
    if (receipt.customer) {
      getCLPByCustomer(receipt.customer).then((data) => {
        if (data && data.length > 0) {
          setAvailableLoyaltyPoints(data[0] || {});
        } else {
          setAvailableLoyaltyPoints({});
        }
      }).catch((err) => {
        console.error("Failed to fetch CLP data:", err);
        toast.error("Failed to fetch loyalty points.");
      });
    }
  }, [receipt.customer]);

  // Handle loyalty points usage
  const handleUseLoyaltyPoints = () => {
    if (!loyaltyRules || !receipt.customer) {
      toast.error("Please select a customer and ensure loyalty rules are loaded.");
      return;
    }

    if (availableLoyaltyPoints.points <= 0) {
      toast.error("No loyalty points available.");
      return;
    }

    // Calculate discount based on loyalty rules
    const pointsToUse = Math.min(availableLoyaltyPoints.points, 1000 * Math.floor(availableLoyaltyPoints.points / 1000)); // Use in multiples of 1000
    const cashbackPer1000 = loyaltyRules.for_every_1000_LP_CB;
    let discount = (pointsToUse / 1000) * cashbackPer1000;

    // Apply max discount if specified
    if (loyaltyRules.max_discount > 0) {
      if (loyaltyRules.discount_type === "percentage") {
        const maxDiscount = calculatedValues.subtotal * (loyaltyRules.max_discount / 100);
        discount = Math.min(discount, maxDiscount);
      } else {
        discount = Math.min(discount, loyaltyRules.max_discount);
      }
    }

    // Update receipt and loyalty points
    setReceipt(prev => ({
      ...prev,
      discount_amount: prev.discount_amount + discount,
      loyalty_points_used: pointsToUse,
    }));
    setUsedLoyaltyPoints(pointsToUse);
    setAvailableLoyaltyPoints((prev) => ({...prev , "points": prev.points - pointsToUse}));

    toast.success(`Applied ${pointsToUse} loyalty points for $${discount.toFixed(2)} discount.`);
  };

  // Update customer loyalty points API call
  const updateCustomerLoyaltyPoints = async (pointsUsed) => {
    try {
      console.log(availableLoyaltyPoints.points, pointsUsed)
      await postCLP(availableLoyaltyPoints, availableLoyaltyPoints.id)


    } catch (err) {
      console.error("Failed to update loyalty points:", err);
      throw new Error("Failed to update loyalty points.");
    }
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    if (!transactionStarted && field === "product" && value !== "") {
      setTransactionStarted(true);
      transactionStartTime.current = Date.now();
    }

    setLineItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === "product") {
        const selectedProduct = products.find(product => product.id == value);
        if (selectedProduct) {
          updatedItems[index] = {
            ...updatedItems[index],
            product: selectedProduct.id,
            product_name: selectedProduct.product_name,
            packaging_weight: selectedProduct.packaging_weight,
            price: selectedProduct.retail_price,
            discount: selectedProduct.discount || 0,
            total_price: (selectedProduct.discount || selectedProduct.retail_price) * (updatedItems[index].quantity || 1)
          };
        }
      } else {
        updatedItems[index].total_price =
          (updatedItems[index].quantity || 0) * (updatedItems[index].discount || updatedItems[index].price);
      }

      return updatedItems;
    });
  };

  // Add and remove line items
  const addLineItem = () => {
    if (!transactionStarted && lineItems.length === 0) {
      setTransactionStarted(true);
      transactionStartTime.current = Date.now();
    }
    setLineItems([...lineItems, { product: "", quantity: 1, price: 0, total_price: 0 }]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    } else {
      setError("At least one product is required");
      toast.error("At least one product is required");
    }
  };

  // Calculate totals
  useEffect(() => {
    const totalBeforeDiscount = lineItems
      .filter(item => !item.has_returned)
      .reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);
    const discountAmount = Number(receipt.discount_amount) || 0;
    const totalAfterDiscount = Math.max(0, totalBeforeDiscount - discountAmount);

    const taxRate = receipt.payment_method === "Card" ? 0.05 : 0.16;
    const taxAmount = totalAfterDiscount * taxRate;

    const amountPaid = Number(
      parseFloat(receipt.payment_by_cash) +
      parseFloat(receipt.payment_by_card) +
      parseFloat(receipt.payment_by_gift_card) +
      parseFloat(receipt.payment_by_credit_card) +
      parseFloat(receipt.payment_by_bank_transfer) +
      parseFloat(receipt.payment_by_mobile_money)
    ) || 0;

    let paymentStatus = "Pending";
    if (amountPaid >= calculatedValues.finalAmount.toFixed(2)) {
      paymentStatus = "Completed";
    } else if (amountPaid > 0) {
      paymentStatus = "Partial";
    }

    setReceipt(prev => ({
      ...prev,
      line_items: lineItems,
      total_amount: totalAfterDiscount,
      tax_amount: taxAmount,
      payment_status: paymentStatus,
    }));
  }, [lineItems, receipt.discount_amount, receipt.payment_method, receipt.amount_paid, receipt.payment_by_cash, receipt.payment_by_card, receipt.payment_by_gift_card, receipt.payment_by_credit_card, receipt.payment_by_bank_transfer, receipt.payment_by_mobile_money]);

  // Form validation
  const validateForm = () => {
    if (!receipt.payment_method) {
      setError("Payment method is required.");
      toast.error("Payment method is required.");
      return false;
    }
    if (!lineItems.length || lineItems.some(item => !item.product)) {
      setError("At least one product must be selected.");
      toast.error("At least one product must be selected.");
      return false;
    }
    if ((receipt.payment_method === "Online" || receipt.payment_method === "Mobile Wallet") && !receipt.transection_id) {
      setError("Transaction ID is required for online/mobile wallet payments.");
      toast.error("Transaction ID is required for online/mobile wallet payments.");
      return false;
    }
    return true;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "discount_amount") {
      const newDiscount = parseFloat(value) || 0;
      const oldDiscount = parseFloat(receipt.discount_amount) || 0;
      const totalBeforeDiscount = parseFloat(receipt.total_amount) + oldDiscount;

      setReceipt(prev => ({
        ...prev,
        discount_amount: newDiscount,
        total_amount: Math.max(0, totalBeforeDiscount - newDiscount)
      }));
    } else {
      setReceipt(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      let transactionTime = 0;
      if (transactionStarted && transactionStartTime.current) {
        transactionTime = Math.floor((Date.now() - transactionStartTime.current) / 1000);
      }

      const preparedReceipt = {
        ...receipt,
        transaction_time: transactionTime,
        loyalty_points_used: usedLoyaltyPoints,
      };

      if (mode === "edit") {
        preparedReceipt.line_items = lineItems.map(item => ({
          ...item,
          product: typeof item.product === 'object' ? item.product.id : item.product
        }));
      }

      // Update loyalty points if used
      if (usedLoyaltyPoints > 0) {
        await updateCustomerLoyaltyPoints(usedLoyaltyPoints);
      }

      let response;
      if (mode === 'add') {
        response = await postReceipts(preparedReceipt);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postReceipts(preparedReceipt, existingData.id);
      }

      if (response.ok) {
        setSuccess(mode === "add" ? "Receipt added successfully!" : "Receipt updated successfully");
        toast.success(mode === "add" ? "Receipt added successfully!" : "Receipt updated successfully");
        setTimeout(() => {
          navigate("/receipts");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process receipt. Please check your inputs.");
        toast.error(data.detail || "Failed to process receipt. Please check your inputs.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  // Memoize calculated values
  const calculatedValues = useMemo(() => {
    const subtotal = lineItems
      .filter(item => !item.has_returned)
      .reduce((acc, item) => acc + (Number(item.total_price) || 0), 0);

    const total_discount = lineItems
      .filter(item => !item.has_returned)
      .reduce((acc, item) => acc + (Number(item.discount) || 0), 0);

    return {
      subtotal,
      total_discount,
      finalAmount: receipt.total_amount + Number(receipt.tax_amount),
      balanceDue: receipt.total_amount - (receipt.amount_paid) + Number(receipt.tax_amount)
    };
  }, [lineItems, receipt.total_amount, receipt.tax_amount, receipt.amount_paid]);

  // Update amount paid
  useEffect(() => {
    let paid = parseFloat(receipt.payment_by_cash) +
      parseFloat(receipt.payment_by_card) +
      parseFloat(receipt.payment_by_gift_card) +
      parseFloat(receipt.payment_by_credit_card) +
      parseFloat(receipt.payment_by_bank_transfer) +
      parseFloat(receipt.payment_by_mobile_money);

    setReceipt((prev) => ({ ...prev, amount_paid: paid }));
  }, [
    receipt.payment_by_cash,
    receipt.payment_by_card,
    receipt.payment_by_gift_card,
    receipt.payment_by_credit_card,
    receipt.payment_by_bank_transfer,
    receipt.payment_by_mobile_money
  ]);

  return (
    <div className="form-container bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {mode === "add" ? "Create New Receipt" : "Edit Receipt"}
      </h2>

      {(error || success) && (
        <div className={`mb-4 p-3 rounded-lg ${error ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {error || success}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Customer & Payment Method Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Customer <span className="text-red-500">*</span></label>
            <select
              name="customer"
              value={receipt.customer}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.phone_number})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
            <select
              name="payment_method"
              value={receipt.payment_method}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Mobile Wallet">Mobile Wallet</option>
              <option value="Online">Online</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {receipt.payment_method === "Card" ? "Card payments have a 5% tax rate" : "Cash/online payments have a 16% tax rate"}
            </div>
          </div>
        </div>

        <div className="space-y-1" style={{ display: (receipt.payment_method === "Online" || receipt.payment_method === "Mobile Wallet") ? 'block' : 'none' }}>
          <label className="block font-medium text-gray-700">Transaction ID <span className="text-red-500">*</span></label>
          <input
            name="transection_id"
            value={receipt.transection_id}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Table */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-700">Products <span className="text-red-500">*</span></label>
            <button
              type="button"
              onClick={addLineItem}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 text-sm flex items-center"
            >
              <span className="mr-1">+</span> Add Product
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-300 rounded-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="p-2 border-b">Product</th>
                  <th className="p-2 border-b">Quantity</th>
                  <th className="p-2 border-b">Price</th>
                  <th className="p-2 border-b">Discount</th>
                  <th className="p-2 border-b">Total</th>
                  {mode === "edit" && <th className="p-2 border-b">Return</th>}
                  <th className="p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={index} className={item.has_returned ? "bg-red-50" : ""}>
                    <td className="p-2 border-b">
                      <select
                        name="product"
                        value={mode === "add" ? item.product : (item.product?.id || item.product)}
                        onChange={(e) => handleLineItemChange(index, "product", e.target.value)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.product_name}
                            {product.product_weight ? ` - ${product.product_weight}` : ""}
                            {product.unit} - {product.retail_price}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border-b">
                      <input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => handleLineItemChange(index, "quantity", parseInt(e.target.value, 10) || 0)}
                        min="1"
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="p-2 border-b">
                      <input
                        type="number"
                        value={item.price || ""}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleLineItemChange(index, "price", parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="p-2 border-b">
                      <input
                        type="number"
                        value={item.discount || 0}
                        min="0"
                        step="0.01"
                        onChange={(e) => handleLineItemChange(index, "discount", parseFloat(e.target.value) || 0)}
                        className="w-full p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </td>
                    <td className="p-2 border-b font-bold text-gray-700">
                      ${(item.total_price || 0).toFixed(2)}
                    </td>
                    {mode === "edit" &&
                      <td className="p-2 border-b text-center">
                        <input
                          type="checkbox"
                          checked={item.has_returned || false}
                          onChange={(e) => handleLineItemChange(index, "has_returned", e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                    }
                    <td className="p-2 border-b">
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        ✖ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Subtotal:</label>
            <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg">
              ${calculatedValues.subtotal.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Discount Amount:</label>
            <input
              type="number"
              name="discount_amount"
              value={receipt.discount_amount.toFixed(2)}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Tax Amount:</label>
            <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg">
              ${receipt.tax_amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Customer Loyalty Points:</label>
            <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg font-bold">
              {availableLoyaltyPoints?.points?.toFixed(2)}
            </div>
          </div>
          {availableLoyaltyPoints.points > 0 && (
            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleUseLoyaltyPoints}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Use Loyalty Points
              </Button>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Total Amount:</label>
            <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg font-bold">
              ${calculatedValues.finalAmount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Cash:</label>
            <input
              type="number"
              name="payment_by_cash"
              value={receipt.payment_by_cash || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Card:</label>
            <input
              type="number"
              name="payment_by_card"
              value={receipt.payment_by_card || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Gift Card:</label>
            <input
              type="number"
              name="payment_by_gift_card"
              value={receipt.payment_by_gift_card || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Credit Card:</label>
            <input
              type="number"
              name="payment_by_credit_card"
              value={receipt.payment_by_credit_card || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Bank Transfer:</label>
            <input
              type="number"
              name="payment_by_bank_transfer"
              value={receipt.payment_by_bank_transfer || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Amount Paid By Mobile Wallet:</label>
            <input
              type="number"
              name="payment_by_mobile_money"
              value={receipt.payment_by_mobile_money || 0.0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Total Amount Paid:</label>
            <input
              type="number"
              name="amount_paid"
              value={receipt.amount_paid || 0.0}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>

          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Balance Due:</label>
            <div className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-red-600 font-bold">
              ${calculatedValues.balanceDue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block font-medium text-gray-700">Payment Status:</label>
            <select
              name="payment_status"
              value={receipt.payment_status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block font-medium text-gray-700">Invoice Number:</label>
            <input
              type="text"
              name="invoice_number"
              value={receipt.invoice_number}
              onChange={handleChange}
              placeholder="Invoice Number"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="online_sale"
              name="online_sale"
              checked={receipt.online_sale}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 mr-2"
            />
            <label htmlFor="online_sale" className="font-medium text-gray-700">
              Online Sale
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="gift_receipt"
              name="gift_receipt"
              checked={receipt.gift_receipt}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 mr-2"
            />
            <label htmlFor="gift_receipt" className="font-medium text-gray-700">
              Gift Receipt
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="on_hold"
              name="on_hold"
              checked={receipt.on_hold}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 mr-2"
            />
            <label htmlFor="on_hold" className="font-medium text-gray-700">
              Hold Receipt
            </label>
          </div>

          {transactionStarted && (
            <div className="space-y-1">
              <label className="block font-medium text-gray-700">Transaction Timer:</label>
              <div className="text-blue-600 font-medium">
                Timer running...
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/receipts')}
            className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            {mode === "add" ? "Create Receipt" : "Update Receipt"}
          </button>
        </div>
      </form>
    </div>
  );
};

CashierReceiptForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default CashierReceiptForm;