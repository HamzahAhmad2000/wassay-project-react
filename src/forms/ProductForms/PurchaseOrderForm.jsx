import { useState, useEffect } from "react";
import "/src/styles/FormStyles.css"; // Ensure this CSS file contains the provided styles
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { getProducts, getSuppliers, postPurchaseOrder, postSupplierPayment } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Checkbox } from "../../additionalOriginuiComponents/ui/checkbox";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              Create Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <p className="text-red-600 text-sm mb-4">{formError}</p>}
            {formSuccess && <p className="text-green-600 text-sm mb-4">{formSuccess}</p>}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company */}
                {user && user.is_superuser && (
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                    <Select
                      value={formData.company}
                      onValueChange={(value) => setFormData(prev => ({...prev, company: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Warehouse */}
                {user && !user.warehouse && (
                  <div className="space-y-2">
                    <Label htmlFor="warehouse" className="text-[#101023] font-medium">Warehouse</Label>
                    <Select
                      value={formData.warehouse}
                      onValueChange={(value) => setFormData(prev => ({...prev, warehouse: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Branch */}
                {user && !user.branch && (
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData(prev => ({...prev, branch: value}))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Supplier */}
                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-[#101023] font-medium">Supplier</Label>
                  <Select
                    value={formData.supplier}
                    onValueChange={(value) => {
                      setFormData(prev => ({...prev, supplier: value}));
                      setAdvancePaymentFormData(prev => ({...prev, supplier: value}));
                    }}
                  >
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

                {/* Delivery Date */}
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="text-[#101023] font-medium">Delivery Date</Label>
                  <Input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="w-full"
                  />
                  <DateEventsDisplay
                    date={formData.deliveryDate}
                    className="text-gray-600 text-sm"
                  />
                </div>
              </div>

              {/* Products Section */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#101023]">Products</h3>
                  <Button 
                    type="button" 
                    onClick={handleAddProduct}
                    className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                  >
                    + Add Product
                  </Button>
                </div>
                
                {formData.products.map((product, index) => (
                  <div key={index} className="bg-white p-4 mb-4 rounded-lg shadow">
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
                      <div className="space-y-2">
                        <Label className="text-[#101023] font-medium">Product</Label>
                        <Select
                          value={product.product.id}
                          onValueChange={(value) => handleProductChange(index, "product", value)}
                        >
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
                        <Label className="text-[#101023] font-medium">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Quantity"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", Math.max(1, e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <Button 
                        type="button" 
                        onClick={() => handleRemoveProduct(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-700 hover:bg-red-500 hover:text-white"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-[#101023] font-medium">Image</Label>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
                
                {formData.image && (
                  <img 
                    src={getImagePreviewSrc(formData.image)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md" 
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="advancePayment"
                  checked={advancePayment}
                  onCheckedChange={(checked) => setAdvancePayment(checked)}
                />
                <Label htmlFor="advancePayment" className="text-[#101023]">Advance Payment</Label>
              </div>

              {advancePayment && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                  <h3 className="text-lg font-semibold text-[#101023]">Advance Payment Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method" className="text-[#101023] font-medium">Payment Method</Label>
                      <Select
                        value={advancePaymentFormData.payment_method || 'CASH'}
                        onValueChange={(value) => setAdvancePaymentFormData(prev => ({...prev, payment_method: value}))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="BANK">Bank Transfer</SelectItem>
                          <SelectItem value="MOBILE">Mobile Payment</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {advancePaymentFormData.payment_method === 'CASH' ? (
                      <div className="space-y-2">
                        <Label htmlFor="amount_in_cash" className="text-[#101023] font-medium">Amount</Label>
                        <Input
                          type="number"
                          name="amount_in_cash"
                          value={advancePaymentFormData.amount_in_cash || 0}
                          onChange={handleSupplierPaymentChange}
                          step="0.01"
                          min="0"
                          className="w-full"
                          placeholder="Enter amount"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="amount_in_bank" className="text-[#101023] font-medium">Amount</Label>
                        <Input
                          type="number"
                          name="amount_in_bank"
                          value={advancePaymentFormData.amount_in_bank || 0}
                          onChange={handleSupplierPaymentChange}
                          step="0.01"
                          min="0"
                          className="w-full"
                          placeholder="Enter amount"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="payment_date" className="text-[#101023] font-medium">Payment Date</Label>
                      <Input
                        type="date"
                        name="payment_date"
                        value={advancePaymentFormData.payment_date}
                        onChange={handleSupplierPaymentChange}
                        className="w-full"
                      />
                      <DateEventsDisplay
                        date={advancePaymentFormData.payment_date}
                        className="text-gray-600 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-[#101023] font-medium">Notes</Label>
                      <textarea
                        name="notes"
                        value={advancePaymentFormData.notes}
                        onChange={handleSupplierPaymentChange}
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                        rows="4"
                        placeholder="Enter any notes"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_image" className="text-[#101023] font-medium">Payment Image</Label>
                      <Input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="w-full"
                        onChange={handleSupplierPaymentChange}
                      />
                      
                      {advancePaymentFormData.image && (
                        <img 
                          src={getImagePreviewSrc(advancePaymentFormData.image)} 
                          alt="Preview" 
                          className="mt-2 w-32 h-32 object-cover rounded-md" 
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/purchase-orders")}
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

export default PurchaseOrderForm;
