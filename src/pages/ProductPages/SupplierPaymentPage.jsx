import { useEffect, useState } from "react";
import {
  getSupplierPayments,
  deleteSupplierPayment,
  ApproveSupplierPayment
} from "../../APIs/ProductAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReusableTable from "../../components/ReusableTable";
import { Pencil, Trash2 } from "lucide-react";
import ImageModal from "/src/components/ImageModal";

const SupplierPaymentPage = () => {
    const navigate = useNavigate();
    const [supplierPayments, setSupplierPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSupplierPayments, setFilteredSupplierPayments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // State for modal image
  
    useEffect(() => {
      fetchSupplierPaymentsData();
    }, []);
  
    const fetchSupplierPaymentsData = async () => {
      setLoading(true);
      try {
        const data = await getSupplierPayments();
        setSupplierPayments(data);
        setFilteredSupplierPayments(data);
      } catch (error) {
        toast.error("Failed to load supplier payments. Please refresh the page.", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      let filtered = supplierPayments;
      if (searchTerm) {
        filtered = filtered.filter((payment) =>
          Object.keys(payment).some((key) => {
            const value = payment[key];
            return (
              value &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          })
        );
      }
      setFilteredSupplierPayments(filtered);
    }, [searchTerm, supplierPayments]);
  
    const handleUpdate = (paymentId) => {
      // Implement navigation to the update page if needed
      toast.info(`Update functionality for Payment ID: ${paymentId} will be implemented here.`);
    };
  
    const handleDelete = async (paymentId) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this supplier payment?"
      );
      if (!confirmDelete) {
        toast.info("Delete action canceled.");
        return;
      }
  
      try {
        const response = await deleteSupplierPayment(paymentId);
        const data = await response;
        if (data.ok) {
          toast.success("Supplier payment deleted successfully!");
          setTimeout(async () => {
            try {
              await fetchSupplierPaymentsData(); // Refresh the list
            } catch (error) {
              toast.error("Failed to refresh supplier payments.");
              console.error("Error fetching supplier payments:", error);
            }
          }, 1000);
        } else {
          toast.error("Failed to delete supplier payment.");
        }
      } catch (error) {
        toast.error(
          "An error occurred while deleting the supplier payment.",
          error
        );
      }
    };


    const handleApprove = async (paymentId) => {
      const confirmApprove = window.confirm(
        "Are you sure you want to approve this supplier payment?"
      );
      if (!confirmApprove) {
        toast.info("Approve action canceled.");
        return;
      }
  
      try {
        const response = await ApproveSupplierPayment(paymentId);
        const data = await response;
        console.log(data)
        if (data.data.id) {
          toast.success("Supplier payment approved successfully!");
          setTimeout(async () => {
            try {
              await fetchSupplierPaymentsData(); // Refresh the list
            } catch (error) {
              toast.error("Failed to refresh supplier payments.");
              console.error("Error fetching supplier payments:", error);
            }
          }, 1000);
        } else {
          toast.error("Failed to approve supplier payment.");
        }
      } catch (error) {
        toast.error(
          "An error occurred while deleting the supplier payment.",
          error
        );
      }
    };
  
    const supplierPaymentHeaders = [
      { label: "Sr. No.", key: "serial_no" },
      { label: "Supplier", key: "supplier_name", sortable: true },
      { label: "PO", key: "purchase_order", sortable: true },
      { label: "Invoice", key: "invoice", sortable: true },
      { label: "Amount (Cash)", key: "amount_in_cash", sortable: true },
      { label: "Amount (Bank)", key: "amount_in_bank", sortable: true },
      { label: "Payment Method", key: "payment_method", sortable: true },
      { label: "Payment Date", key: "payment_date", sortable: true },
      { label: "Recorded By", key: "recorded_by_name", sortable: true },
      { label: "Notes", key: "notes", sortable: true },

      { label: "Image", key: "image", sortable: false },

      { label: "Actions", key: "actions", sortable: false },
    ];
  
    const supplierPaymentData = filteredSupplierPayments.map((payment, index) => ({
      serial_no: index + 1,
      supplier_name: payment.supplier ? payment.supplier : "N/A", // Adjust based on API response
      purchase_order: payment.purchase_order ? payment.purchase_order : "N/A", // Adjust based on API response
      invoice: payment.invoice ? payment.invoice : "N/A", // Adjust based on API response
      amount_in_cash: payment.amount_in_cash,
      amount_in_bank: payment.amount_in_bank,
      payment_method: payment.payment_method,
      payment_date: new Date(payment.payment_date).toLocaleDateString(),
      recorded_by_name: payment.recorded_by ? payment.recorded_by : "N/A", // Adjust based on API response
      notes: payment.notes || "N/A",
      image: payment.image ? (
        <img
          src={payment.image}
          alt="Payment Image"
          className="h-10 w-10 object-contain rounded"
          onClick={() => setSelectedImage(`${payment.image}`)}

        />
      ) : (
        "No Image"
      ),
      actions: (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdate(payment.id)}
            className="inline-flex items-center px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white focus:outline-none text-sm"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Update
          </button>
          <button
            onClick={() => handleDelete(payment.id)}
            className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>

          {!payment.approved && 
          (
             <button
            onClick={() => handleApprove(payment.id)}
            className="inline-flex items-center px-2 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white focus:outline-none text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Approve
          </button>
          )}
        </div>
      ),
    }));
  
    if (loading) {
      return <div>Loading supplier payments...</div>;
    }
  
    return (
      <div className="supplier-payment-page">
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
        <h1 className="page-title">Supplier Payments</h1>
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          buttonText={"Add Payment"}
          onButtonClick={() => {
            navigate("/add-supplier-payment"); // Replace with your actual add payment route
          }}
        />
        <ReusableTable headers={supplierPaymentHeaders} data={supplierPaymentData} />

        <ImageModal
          isOpen={!!selectedImage}
          imageSrc={selectedImage}
          altText="Enlarged Bill" // You can make this dynamic if needed
          onClose={() => setSelectedImage(null)}
        />
      </div>
    );
  };
  
export default SupplierPaymentPage;