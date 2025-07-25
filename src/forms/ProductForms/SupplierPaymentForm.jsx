import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  postSupplierPayment,
  getSuppliers,
  getPurchaseOrdersAgainstSupplier,
  getSupplierInvoiceAgainstSupplierAndPurchaseOrder,
} from "/src/APIs/ProductAPIs";
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DateEventsDisplay from "/src/components/DateEventsDisplay";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

const SupplierPaymentForm = () => {
  const navigate = useNavigate();
  
  const { state } = useLocation();
  const existingData = state?.supplierInvoice || {};
  
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [formData, setFormData] = useState({
    supplier: existingData.supplier || "",
    company: existingData.company || user.company || "",
    branch: existingData.branch || user.branch || "",
    purchase_order: existingData.purchase_order || "",
    invoice: existingData.invoice || "",
    amount_in_cash: existingData.amount_in_cash || 0,
    amount_in_bank: existingData.amount_in_bank || 0,
    payment_method: existingData.payment_method || "CASH",
    recorded_by: existingData.recorded_by || user.id,
    payment_date: existingData.payment_date || new Date().toISOString().split("T")[0],
    notes: existingData.notes || "",
    image: null, 
  });
  const [loading, setLoading] = useState(true);

  
    useEffect(() => {
      if (user && user.is_superuser)
        getCompanies().then((companies) => {
          setCompanies(companies);
        });
      if (user && !user.branch)
        getBranches().then((branches) => {
          setBranches(branches);
        });
  },[])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!formData.supplier){
          const suppliersData = await getSuppliers();
          setSuppliers(suppliersData);
        }
        if (formData.supplier){
          const poData = await getPurchaseOrdersAgainstSupplier(formData.supplier);
          setPurchaseOrders(poData);
        }
        
        if (formData.supplier && formData.purchase_order){
          const invoicesData = await getSupplierInvoiceAgainstSupplierAndPurchaseOrder(formData.supplier, formData.purchase_order);
          setSupplierInvoices(invoicesData);
        }

      } catch (error) {
        toast.error("Failed to load data for the form.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formData.supplier, formData.purchase_order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const newFormData = new FormData

      Object.keys(formData).forEach((key) => {
        console.log(key, formData[key])
        newFormData.append(key, formData[key])

      })
      const response = await postSupplierPayment(newFormData);
      const data = await response;
      if (response.id) {
        toast.success(
          `Supplier payment ${existingData.id ? "updated" : "added"} successfully!`
        );
        setTimeout(() => navigate("/supplier-payments"), 1500);

      } else {
        toast.error(
          `Failed to ${existingData.id ? "update" : "add"} supplier payment: ${
            data.error || "An error occurred."
          }`
        );
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${existingData.id ? "updating" : "adding"} the supplier payment.`,
        error
      );
    }
  };

  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {existingData.id ? "Update Supplier Payment" : "Add New Supplier Payment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Company */}
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">
                    Company
                  </Label>
                  <Select value={formData.company} onValueChange={(value) => handleChange({ target: { name: 'company', value } })}>
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

              {/* Branch */}
              {user && !user.branch && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">
                    Branch
                  </Label>
                  <Select value={formData.branch} onValueChange={(value) => handleChange({ target: { name: 'branch', value } })}>
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

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-[#101023] font-medium">
                  Supplier
                </Label>
                <Select value={formData.supplier} onValueChange={(value) => handleChange({ target: { name: 'supplier', value } })}>
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
                  Purchase Order (Optional)
                </Label>
                <Select value={formData.purchase_order} onValueChange={(value) => handleChange({ target: { name: 'purchase_order', value } })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Purchase Order" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders.map((po) => (
                      <SelectItem key={po.purchase_order.id} value={po.purchase_order.id}>
                        {po.purchase_order.purchase_order_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice" className="text-[#101023] font-medium">
                  Invoice (Optional)
                </Label>
                <Select value={formData.invoice} onValueChange={(value) => handleChange({ target: { name: 'invoice', value } })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierInvoices.map((invoice) => (
                      <SelectItem key={invoice.supplier_invoice.id} value={invoice.supplier_invoice.id}>
                        {invoice.supplier_invoice.invoice_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_in_cash" className="text-[#101023] font-medium">
                  Amount in Cash
                </Label>
                <Input
                  id="amount_in_cash"
                  type="number"
                  value={formData.amount_in_cash}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_in_bank" className="text-[#101023] font-medium">
                  Amount in Bank
                </Label>
                <Input
                  id="amount_in_bank"
                  type="number"
                  value={formData.amount_in_bank}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment_date" className="text-[#101023] font-medium">
                  Payment Date
                </Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
                <DateEventsDisplay
                  date={formData.payment_date}
                  className="text-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#101023] font-medium">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  required
                  className="w-full"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
                {formData.image && (
                  <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/supplier-payments")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {existingData.id ? "Update Payment" : "Add Payment"}
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

export default SupplierPaymentForm;