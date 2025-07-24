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
    <div className="supplier-payment-form-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="page-title">
        {existingData.id ? "Update Supplier Payment" : "Add New Supplier Payment"}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 space-y-4">
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

        <div>
          <label htmlFor="supplier" className="block text-gray-700 text-sm font-bold mb-2">
            Supplier:
          </label>
          <select
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
        <div>
          <label htmlFor="purchase_order" className="block text-gray-700 text-sm font-bold mb-2">
            Purchase Order (Optional):
          </label>
          <select
            id="purchase_order"
            name="purchase_order"
            value={formData.purchase_order}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select Purchase Order</option>
            {purchaseOrders.map((po) => (
              <option key={po.purchase_order.id} value={po.purchase_order.id}>
                {po.purchase_order.purchase_order_number} {/* Adjust based on how you want to display PO */}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="invoice" className="block text-gray-700 text-sm font-bold mb-2">
            Invoice (Optional):
          </label>
          <select
            id="invoice"
            name="invoice"
            value={formData.invoice}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select Invoice</option>
            {supplierInvoices.map((invoice) => (
              <option key={invoice.supplier_invoice.id} value={invoice.supplier_invoice.id}>
                {invoice.supplier_invoice.invoice_number} {/* Adjust based on how you want to display Invoice */}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amount_in_cash" className="block text-gray-700 text-sm font-bold mb-2">
            Amount in Cash:
          </label>
          <input
            type="number"
            id="amount_in_cash"
            name="amount_in_cash"
            value={formData.amount_in_cash}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div>
          <label htmlFor="amount_in_bank" className="block text-gray-700 text-sm font-bold mb-2">
            Amount in Bank:
          </label>
          <input
            type="number"
            id="amount_in_bank"
            name="amount_in_bank"
            value={formData.amount_in_bank}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div>
          <label htmlFor="payment_date" className="block text-gray-700 text-sm font-bold mb-2">
            Payment Date:
          </label>
          <input
            type="date"
            id="payment_date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />

          <DateEventsDisplay
              date={formData.payment_date}
              className="text-gray-600"
            />
        </div>
        <div>
          <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
            Notes (Optional):
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
          
          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {existingData.id ? "Update Payment" : "Add Payment"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/supplier-payments")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierPaymentForm;