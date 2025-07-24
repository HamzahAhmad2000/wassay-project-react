import { useEffect, useState } from "react";
import { getSupplierInvoices, deleteSupplierInvoices   } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { NavLink, useNavigate } from "react-router-dom";
import ImageModal from "/src/components/ImageModal";

const SupplierInvoicePage = () => {
  const navigate = useNavigate();
  const [supplierInvoices, setSupplierInvoices] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image

  useEffect(() => {
    getSupplierInvoices().then((supplierInvoices) => {
      setSupplierInvoices(supplierInvoices);
    });


  }, []);

  const handleUpdate = (supplierInvoiceId) => {
    const supplierInvoice = supplierInvoices.find((p) => p.supplier_invoice.id === supplierInvoiceId);
    if (supplierInvoice) {
      navigate(`/update-supplier-invoice/${supplierInvoiceId}`, { state: { supplierInvoice } });

    } else {
      console.error(`SupplierInvoce with ID ${supplierInvoiceId} not found.`);
    }
  };

  const handleDelete = (supplierInvoiceId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this supplierInvoice?");
    if (confirmDelete) {
      deleteSupplierInvoices(supplierInvoiceId)
        .then((response) => {
          if (response.ok) {
            getSupplierInvoices().then((updatedSupplierInvoices) => {

              setSupplierInvoices(updatedSupplierInvoices);
            });

          } else {
            alert("Failed to delete the supplierInvoice. Please try again.");
          }
        })
        .catch((err) => {
          console.error("Error deleting supplierInvoice:", err);
          alert("An error occurred while trying to delete the supplierInvoice. Please try again.");
        });
    }
  };

  const toggleRow = (supplierInvoiceId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(supplierInvoiceId)) {
        newSet.delete(supplierInvoiceId);
      } else {
        newSet.add(supplierInvoiceId);
      }
      return newSet;
    });
  };

  return (
    <div className="supplierInvoice-page">
      <h1 className="page-title">Supplier Invoice Details</h1>
      
        <NavLink
          to={'/add-supplier-invoice'}
          className={`action-button add-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300 mb-8`}
          title={`Add Supplier Invoice`}
          aria-label={`Add Supplier Invoice`}
        >
          Add Supplier Invoice
        </NavLink>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Supplier</th>
            <th>Order Date</th>
            <th>Due Date</th>
            <th>invoice Number</th>
            <th>Image</th>
            <th>Products</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {supplierInvoices.map((supplierInvoice, index) => (
            <tr key={supplierInvoice.supplier_invoice.id}>
              <td>{index + 1}</td>
              <td>{supplierInvoice.supplier_invoice.supplier.name || "N/A"}</td>
              <td>{supplierInvoice.supplier_invoice.invoice_date || "N/A"}</td>
              <td>{supplierInvoice.supplier_invoice.due_date || "N/A"}</td>
              <td>{supplierInvoice.supplier_invoice.invoice_number || "N/A"}</td>
               <td>{(supplierInvoice.supplier_invoice.image &&  (
                    <img
                          src={supplierInvoice.supplier_invoice.image}
                          alt="Purchase Order Image"
                          className="h-10 w-10 object-contain rounded"
                          onClick={() => setSelectedImage(`${supplierInvoice.supplier_invoice.image}`)}

                        />
                      )) || (
                        "No Image"
                      )}</td>
              <td>
                {supplierInvoice.invoice_items && supplierInvoice.invoice_items.length > 0 ? (
                  <div className="min-w-[250px]">
                    <button 
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                      onClick={() => toggleRow(supplierInvoice.supplier_invoice.id)}
                    >
                      <span className="font-medium">
                        {supplierInvoice.invoice_items.length} {supplierInvoice.invoice_items.length === 1 ? 'Product' : 'Products'}
                      </span>
                      <span className="text-sm">
                        {expandedRows.has(supplierInvoice.supplier_invoice.id) ? '▼' : '▶'}
                      </span>
                    </button>
                    {expandedRows.has(supplierInvoice.supplier_invoice.id) && (
                      <div className="mt-3 space-y-4 bg-white rounded-md shadow-sm border border-gray-200">
                        {supplierInvoice.invoice_items.map((product, i) => (
                          <div key={product.id} className="p-4">
                            {product?.product_image && <img src={`/media${product.product_image}`} alt="Product" className="w-20 h-20 object-cover rounded-md shadow-sm" />}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="space-y-2">
                                <p>
                                  <span className="font-semibold text-gray-600">Name:</span>
                                  <span className="ml-2">{product.product.product_name}</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-600">Category:</span>
                                  <span className="ml-2">{product.product.category.category_name || "N/A"}</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-600">Weight:</span>
                                  <span className="ml-2">{product.product.packaging_weight}</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-600">Quantity:</span>
                                  <span className="ml-2">{product.quantity}</span>

                                </p>
                              </div>
                              <p className="col-span-2">
                                <span className="font-semibold text-gray-600">Cost/Unit:</span>
                                <span className="ml-2">{product.price || 'N/A'}</span>
                              </p>
                              <p className="col-span-2">
                                <span className="font-semibold text-gray-600">Total:</span>
                                <span className="ml-2">{product.total_price}</span>
                              </p>
                            </div>

                            {i < supplierInvoice.invoice_items.length - 1 && (
                              <div className="mt-4 border-b border-gray-200"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No Products</span>
                )}
              </td>
              <td>
                <button
                  className="action-button update-button"
                  onClick={() => handleUpdate(supplierInvoice.supplier_invoice.id)}
                >
                  Update
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleDelete(supplierInvoice.supplier_invoice.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
        <ImageModal
          isOpen={!!selectedImage}
          imageSrc={selectedImage}
          altText="Enlarged Bill" // You can make this dynamic if needed
          onClose={() => setSelectedImage(null)}
        />
    </div>
  );
};

export default SupplierInvoicePage;
