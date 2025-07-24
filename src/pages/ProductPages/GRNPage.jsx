import React, { useCallback, useState } from "react";
import { getGRNs, deleteGRN } from "../../APIs/ProductAPIs"; 
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; 
import SearchFilter from "../../components/SearchFilter";
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; 
import { handleDelete } from "../../utils/crudUtils"; 
import { toast } from "react-toastify";
import ImageModal from "/src/components/ImageModal";

const GRNPage = () => {
  const navigate = useNavigate();

  const fetchGRNsData = useCallback(async () => {
    const response = await getGRNs();
    return response;
  }, []);
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image

  const { data: grns, isLoading, searchTerm, setSearchTerm, setData: setGRNs } = useFetchAndFilter(
    fetchGRNsData,
    'grns'
  );

  const handleUpdateGRN = (grnId) => {
    const grn = grns.find((c) => c.id === grnId);
    if (grn) {
      navigate(`/update-grn/${grnId}`, { state: { grn } });
    } else {
      toast.error(`GRN with ID ${grnId} not found.`);
    }
  };

  const handleDeleteGRN = (grnId) => {
    handleDelete(grnId, deleteGRN, setGRNs, 'grns');
  };

  const grnHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Supplier", key: "supplier", sortable: true },
    { label: "Supplier Invoice", key: "supplier_invoice", sortable: true },
    { label: "Purchase Order", key: "purchase_order", sortable: true },
    { label: "Picture", key: "invoice_picture", sortable: false },
    { label: "GRN Date", key: "grn_date", sortable: true },
    { label: "Batch Number", key: "batch_number", sortable: true },
    { label: "Bill No", key: "bill_no", sortable: true },
    { label: "Bill Date", key: "bill_date", sortable: true },
    { label: "Invoice Number", key: "invoice_number", sortable: true },
    { label: "Payment Method", key: "payment_method", sortable: true },
    { label: "Payment Status", key: "payment_status", sortable: true },
    { label: "Shipping Expense", key: "shipping_expense", sortable: true },
    { label: "Total Tax", key: "total_tax", sortable: true },
    { label: "Total Cost", key: "total_cost", sortable: true },
    { label: "Discount Amount", key: "discount_amount", sortable: true },
    { label: "Total Amount", key: "total_amount", sortable: true },
    { label: "Warehouse", key: "warehouse", sortable: true },
    { label: "Branch", key: "branch", sortable: true },
    { label: "GRN Number", key: "grn_number", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const grnData = grns.map((grn, index) => ({
    serial_no: index + 1,
    supplier: grn.supplier || "N/A",
    supplier_invoice: grn.supplier_invoice || "N/A",
    purchase_order: grn.purchase_order || "N/A",
    invoice_picture: grn.invoice_picture ? (
        <img
          src={grn.invoice_picture}
          alt="grn invoice_picture"
          className="h-10 w-10 object-contain rounded"
          onClick={() => setSelectedImage(`${grn.invoice_picture}`)}

        />
      ) : (
        "No Picture}"
      ),
    grn_date: grn.grn_date || "N/A",
    batch_number: grn.batch_number || "N/A",
    bill_no: grn.bill_no || "N/A",
    bill_date: grn.bill_date || "N/A",
    invoice_number: grn.invoice_number || "N/A",
    payment_method: grn.payment_method || "N/A",
    payment_status: grn.payment_status || "N/A",
    shipping_expense: grn.shipping_expense || "N/A",
    total_tax: grn.total_tax || "N/A",
    total_cost: grn.total_cost || "N/A",
    discount_amount: grn.discount_amount || "N/A",
    total_amount: grn.total_amount || "N/A",
    warehouse: grn.warehouse || "N/A",
    branch: grn.branch || "N/A",
    grn_number: grn.grn_number || "N/A",
    actions: (
      <div>
        <button className="action-button update-button mr-2" onClick={() => handleUpdateGRN(grn.id)}>
          Update
        </button>
        <button className="action-button delete-button" onClick={() => handleDeleteGRN(grn.id)}>
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="grn-page">
      <h1 className="page-title">GRN Details</h1>
      <div className="filter-section mb-4 flex items-center justify-between px-4">
        <div className="flex-1 flex justify-center">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search GRNs..." />
        </div>
        <Link to="/add-grn">
          <button className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
            Add GRN
          </button>
        </Link>
      </div>
      {isLoading ? (
        <p>Loading GRNs...</p>
      ) : (
        <ReusableTable headers={grnHeaders} data={grnData} />
      )}
      
              <ImageModal
                isOpen={!!selectedImage}
                imageSrc={selectedImage}
                altText="Enlarged Bill" // You can make this dynamic if needed
                onClose={() => setSelectedImage(null)}
              />
    </div>
  );
};

export default GRNPage;