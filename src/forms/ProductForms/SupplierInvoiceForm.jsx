import { useState, useEffect } from "react";
import { getProducts, getSuppliers, postSupplierInvoice, postSupplierPayment } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import { getPurchaseOrders } from "/src/APIs/ProductAPIs";
import { getSupplierPaymentsAgainstPurchaseOrder } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              Create Supplier Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
            {formSuccess && <p className="text-green-600 text-sm mb-4">{formSuccess}</p>}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-[#101023] font-medium">
                  Supplier
                </Label>
                <Select value={formData.supplier} onValueChange={(value) => {
                  handleChange({ target: { name: 'supplier', value } });
                  handleSupplierPaymentChange({ target: { name: 'supplier', value } });
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Purchase Order */}
              <div className="space-y-2">
                <Label htmlFor="purchase_order" className="text-[#101023] font-medium">
                  Purchase Order
                </Label>
                <Select value={formData.purchase_order} onValueChange={(value) => {
                  handleChange({ target: { name: 'purchase_order', value } });
                  handleSupplierPaymentChange({ target: { name: 'purchase_order', value } });
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Purchase Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPurchaseOrders.map((order) => (
                      <SelectItem key={order.purchase_order.id} value={order.purchase_order.id}>
                        {order.purchase_order.id} - {order.purchase_order.purchase_order_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="invoice_number" className="text-[#101023] font-medium">
                  Invoice Number
                </Label>
                <Input
                  id="invoice_number"
                  type="text"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Invoice Date */}
              <div className="space-y-2">
                <Label htmlFor="invoice_date" className="text-[#101023] font-medium">
                  Invoice Date
                </Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={handleChange}
                  className="w-full"
                />
                <DateEventsDisplay
                  date={formData.invoice_date}
                  className="text-gray-600"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-[#101023] font-medium">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full"
                />
                <DateEventsDisplay
                  date={formData.due_date}
                  className="text-gray-600"
                />
              </div>

              {/* Shipping Expense */}
              <div className="space-y-2">
                <Label htmlFor="shipping_expense" className="text-[#101023] font-medium">
                  Shipping Expense
                </Label>
                <Input
                  id="shipping_expense"
                  type="number"
                  min={0}
                  value={formData.shipping_expense}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {/* Products Section */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#101023]">Products</h3>
                  <Button 
                    type="button" 
                    onClick={handleAddProduct}
                    className="bg-green-500 text-white hover:bg-green-600"
                  >
                    + Add Product
                  </Button>
                </div>
                
                {formData.products.map((product, index) => (
                  <div key={index} className="bg-white p-4 mb-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Product</Label>
                        <Select value={product.product.id} onValueChange={(value) => handleProductChange(index, "product", value)}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id}>
                                {prod.product_name} {prod.packaging_weight? `- ${prod.packaging_weight}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Quantity Ordered</Label>
                        <Input
                          type="number"
                          min="0"
                          disabled
                          value={product.quantity_ordered}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Previously Received</Label>
                        <Input
                          type="number"
                          min="0"
                          disabled
                          value={product.previously_received}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Quantity Received</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", Math.max(0, e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Total Cost</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.total_price}
                          onChange={(e) => handleProductChange(index, "total_price", Math.max(0, e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Discount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.discount}
                          onChange={(e) => handleProductChange(index, "discount", Math.max(0, e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Tax</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.tax}
                          onChange={(e) => handleProductChange(index, "tax", Math.max(0, e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <Button 
                        type="button" 
                        onClick={() => handleRemoveProduct(index)}
                        className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600"
                        aria-label="Remove product"
                      >
                        ×
                      </Button>
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

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full"
                />
                {formData.image && (
                  <img src={formData.image ? URL.createObjectURL(formData.image) : ""} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                )}
              </div>

              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="payment_status" className="text-[#101023] font-medium">
                  Payment Status
                </Label>
                <Select value={formData.payment_status} onValueChange={(value) => handleChange({ target: { name: 'payment_status', value } })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADVANCE">Advance</SelectItem>
                    <SelectItem value="On Receiving">On Receiving</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Cost */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-gray-600">Total Cost</Label>
                <p className="text-xl font-bold text-blue-500">
                  {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: 'USD' 
                  }).format(formData.totalCost || 0)}
                </p>
              </div>

              {/* Payment Section for On Receiving */}
              {formData.payment_status && formData.payment_status === 'On Receiving' && (
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
                  <h3 className="text-lg font-semibold text-[#101023]">Payment Details</h3>
                  
                  <div className="space-y-2">
                    <Label className="text-[#101023] font-medium">Payment Method</Label>
                    <Select value={supplierPayment.payment_method} onValueChange={(value) => handleSupplierPaymentChange({ target: { name: 'payment_method', value } })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK">Bank Transfer</SelectItem>
                        <SelectItem value="MOBILE">Mobile Payment</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {supplierPayment.payment_method === 'CASH' ? (
                    <div className="space-y-2">
                      <Label className="text-[#101023] font-medium">Amount</Label>
                      <Input
                        type="number"
                        name="amount_in_cash"
                        value={supplierPayment.amount_in_cash || 0}
                        onChange={handleSupplierPaymentChange}
                        step="0.01"
                        min="0"
                        className="w-full"
                        placeholder="Enter amount"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-[#101023] font-medium">Amount</Label>
                      <Input
                        type="number"
                        name="amount_in_bank"
                        value={supplierPayment.amount_in_bank || 0}
                        onChange={handleSupplierPaymentChange}
                        step="0.01"
                        min="0"
                        className="w-full"
                        placeholder="Enter amount"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[#101023] font-medium">Payment Date</Label>
                    <Input
                      type="date"
                      name="payment_date"
                      value={supplierPayment.payment_date}
                      onChange={handleSupplierPaymentChange}
                      className="w-full"
                    />
                    <DateEventsDisplay
                      date={supplierPayment.payment_date}
                      className="text-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#101023] font-medium">Notes</Label>
                    <Textarea
                      name="notes"
                      value={supplierPayment.notes}
                      onChange={handleSupplierPaymentChange}
                      className="w-full"
                      rows="4"
                      placeholder="Enter any notes"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#101023] font-medium">Payment Image</Label>
                    <Input
                      type="file"
                      name="image"
                      accept="image/*"
                      required
                      className="w-full"
                      onChange={handleSupplierPaymentChange}
                    />
                    {formData.image && (
                      <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/supplier-invoices")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierInvoiceForm;
