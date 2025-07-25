import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getSuppliers, postGRN, getProducts, getPurchaseOrdersAgainstSupplier, getSupplierInvoiceAgainstSupplierAndPurchaseOrder } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getBranches, getWareHouses } from "../../APIs/CompanyAPIs";
import { ToastContainer, toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add GRN" : "Edit GRN"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-[#101023] font-medium">
                    Supplier:
                  </Label>
                  <Select
                    value={grn.supplier}
                    onValueChange={(value) => setGrn(prev => ({...prev, supplier: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Supplier" />
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

                <div className="space-y-2">
                  <Label htmlFor="purchase_order" className="text-[#101023] font-medium">
                    Purchase Order:
                  </Label>
                  <Select
                    value={grn.purchase_order}
                    onValueChange={(value) => setGrn(prev => ({...prev, purchase_order: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Purchase Order" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPurchaseOrders.length > 0 && filteredPurchaseOrders.map((order) => (
                        <SelectItem key={order.purchase_order.id} value={order.purchase_order.id}>
                          {order.purchase_order.purchase_order_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_invoice" className="text-[#101023] font-medium">
                    Supplier Invoice:
                  </Label>
                  <Select
                    value={grn.supplier_invoice}
                    onValueChange={(value) => setGrn(prev => ({...prev, supplier_invoice: value}))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Supplier Invoice" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSupplierInvoices.map((invoice) => (
                        <SelectItem key={invoice.supplier_invoice.id} value={invoice.supplier_invoice.id}>
                          {invoice.supplier_invoice.invoice_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grn_date" className="text-[#101023] font-medium">
                    GRN Date:
                  </Label>
                  <Input
                    id="grn_date"
                    type="date"
                    name="grn_date"
                    value={grn.grn_date}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <DateEventsDisplay
                    date={grn.grn_date}
                    className="text-gray-600 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch_number" className="text-[#101023] font-medium">
                    Batch Number:
                  </Label>
                  <Input
                    id="batch_number"
                    type="number"
                    name="batch_number"
                    value={grn.batch_number}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bill_no" className="text-[#101023] font-medium">
                    Supplier Bill No:
                  </Label>
                  <Input
                    id="bill_no"
                    type="number"
                    name="bill_no"
                    value={grn.bill_no}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="bill_date" className="text-[#101023] font-medium">
                      Payment Date:
                    </Label>
                    <Input
                      id="bill_date"
                      type="date"
                      name="bill_date"
                      value={grn.bill_date}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <DateEventsDisplay
                      date={grn.bill_date}
                      className="text-gray-600 text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="invoice_number" className="text-[#101023] font-medium">
                    Invoice Number:
                  </Label>
                  <Input
                    id="invoice_number"
                    type="number"
                    name="invoice_number"
                    value={grn.invoice_number}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_picture" className="text-[#101023] font-medium">
                    Invoice Picture:
                  </Label>
                  <Input
                    id="invoice_picture"
                    type="file"
                    name="invoice_picture"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  {grn.invoice_picture && (
                    <img 
                      src={grn.invoice_picture ? URL.createObjectURL(grn.invoice_picture) : ""} 
                      alt="Preview" 
                      className="mt-2 w-32 h-32 object-cover rounded-md" 
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-[#101023] font-medium">
                    Image
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full"
                    onChange={handleFileChange}
                  />
                  {grn.image && (
                    <img 
                      src={getImagePreviewSrc(grn.image)} 
                      alt="Preview" 
                      className="mt-2 w-32 h-32 object-cover rounded-md" 
                    />
                  )}
                </div>

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="payment_method" className="text-[#101023] font-medium">
                      Payment Method:
                    </Label>
                    <Select
                      value={grn.payment_method}
                      onValueChange={(value) => setGrn(prev => ({...prev, payment_method: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="payment_status" className="text-[#101023] font-medium">
                      Payment Status:
                    </Label>
                    <Select
                      value={grn.payment_status}
                      onValueChange={(value) => setGrn(prev => ({...prev, payment_status: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Payment Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="due">Due</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="shipping_expense" className="text-[#101023] font-medium">
                      Shipping Expense:
                    </Label>
                    <Input
                      id="shipping_expense"
                      type="number"
                      name="shipping_expense"
                      value={grn.shipping_expense}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                )}

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="total_cost" className="text-[#101023] font-medium">
                      Total Cost:
                    </Label>
                    <Input
                      id="total_cost"
                      type="number"
                      name="total_cost"
                      value={grn.total_cost.toFixed(2)}
                      className="w-full"
                      disabled
                    />
                  </div>
                )}

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_amount" className="text-[#101023] font-medium">
                      Discount Amount:
                    </Label>
                    <Input
                      id="discount_amount"
                      type="number"
                      name="discount_amount"
                      value={grn.discount_amount}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                )}

                {paymentStatus !== "Advance" && (
                  <div className="space-y-2">
                    <Label htmlFor="total_tax" className="text-[#101023] font-medium">
                      Total Tax:
                    </Label>
                    <Input
                      id="total_tax"
                      type="number"
                      name="total_tax"
                      value={grn.total_tax}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="total_amount" className="text-[#101023] font-medium">
                    Total Amount:
                  </Label>
                  <Input
                    id="total_amount"
                    type="number"
                    name="total_amount"
                    value={grn.total_amount}
                    onChange={handleChange}
                    className="w-full"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouse" className="text-[#101023] font-medium">
                    Warehouse:
                  </Label>
                  <Select
                    value={grn.warehouse}
                    onValueChange={(value) => setGrn(prev => ({...prev, warehouse: value}))}
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
                    Branch:
                  </Label>
                  <Select
                    value={grn.branch}
                    onValueChange={(value) => setGrn(prev => ({...prev, branch: value}))}
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

                <div className="space-y-2">
                  <Label htmlFor="grn_number" className="text-[#101023] font-medium">
                    GRN Number:
                  </Label>
                  <Input
                    id="grn_number"
                    type="text"
                    name="grn_number"
                    value={grn.grn_number}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#101023]">GRN Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Product</th>
                        <th className="border border-gray-300 p-2 text-left">Quantity in Supplier invoice</th>
                        <th className="border border-gray-300 p-2 text-left">Quantity in Purchase order</th>
                        <th className="border border-gray-300 p-2 text-left">Received Quantity</th>
                        <th className="border border-gray-300 p-2 text-left">Unit Cost</th>
                        <th className="border border-gray-300 p-2 text-left">Total Cost</th> 
                        <th className="border border-gray-300 p-2 text-left">Retail Price</th>
                        <th className="border border-gray-300 p-2 text-left">Retail Price / Unit</th>
                        <th className="border border-gray-300 p-2 text-left">Manufacturing Date</th>
                        <th className="border border-gray-300 p-2 text-left">Expiry Date</th>
                        <th className="border border-gray-300 p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grn.grn_products.map((product, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">
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
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              name="quantity_in_supplier_invoice"
                              value={product.quantity_in_supplier_invoice}
                              className="w-full"
                              disabled
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              name="quantity_in_purchase_order"
                              value={product.quantity_in_purchase_order}
                              className="w-full"
                              disabled
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              name="received_quantity"
                              value={product.received_quantity}
                              onChange={(e) => handleProductChange(index, e)}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              name="unit_cost"
                              value={product.unit_cost}
                              className="w-full"
                              disabled
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            {product.received_quantity * product.unit_cost}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="number"
                              name="retail_price"
                              value={product.retail_price}
                              onChange={(e) => handleProductChange(index, e)}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            {((parseFloat(product.retail_price)/parseFloat(product.received_quantity).toFixed(2) || 0) + " " + product.unit)}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="date"
                              name="manufacturing_date"
                              value={product.manufacturing_date}
                              onChange={(e) => handleProductChange(index, e)}
                              className="w-full"
                            />
                          </td>                
                          <td className="border border-gray-300 p-2">
                            <Input
                              type="date"
                              name="expiry_date"
                              value={product.expiry_date}
                              onChange={(e) => handleProductChange(index, e)}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Button
                              type="button"
                              onClick={() => removeProduct(index)}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-700 hover:bg-red-500 hover:text-white"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" onClick={addProduct} className="bg-[#423e7f] text-white hover:bg-[#201b50]">
                  Add Product
                </Button>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/grns")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add GRN" : "Update GRN"}
                </Button>
              </div>
            </form>

            <div className="mt-6 space-y-2">
              <h3 className="text-2xl font-bold text-[#101023]">
                Total Cost: <span className="text-red-500 font-medium">{grn.total_amount || 0}</span>
              </h3>
              <h3 className="text-2xl font-bold text-[#101023]">
                Estimated Revenue: <span className="text-green-500 font-medium">{estimatedRevenue}</span>
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
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
    </div>
  );
};

GRNForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default GRNForm;