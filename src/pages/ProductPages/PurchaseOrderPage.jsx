import { useEffect, useState } from "react";
import { getPurchaseOrders, deletePurchaseOrders  } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { Link, useNavigate } from "react-router-dom";
import ImageModal from "/src/components/ImageModal";

const PurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image

  useEffect(() => {
    getPurchaseOrders().then((purchaseOrders) => {
      setPurchaseOrders(purchaseOrders);
      console.log("Purchase Orders:", purchaseOrders);
    });

  }, []);

  const handleUpdate = (purchaseOrderId) => {
    const purchaseOrder = purchaseOrders.find((p) => p.purchase_order.id === purchaseOrderId);
    if (purchaseOrder) {
      navigate(`/update-purchase-order/${purchaseOrderId}`, { state: { purchaseOrder } });
    } else {
      console.error(`PurchaseOrder with ID ${purchaseOrderId} not found.`);
    }
  };

  const handleDelete = (purchaseOrderId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this purchaseOrder?");
    if (confirmDelete) {
      deletePurchaseOrders(purchaseOrderId)
        .then((response) => {
          if (response.ok) {
            getPurchaseOrders().then((updatedPurchaseOrders) => {
              setPurchaseOrders(updatedPurchaseOrders);
            });
          } else {
            alert("Failed to delete the purchaseOrder. Please try again.");
          }
        })
        .catch((err) => {
          console.error("Error deleting purchaseOrder:", err);
          alert("An error occurred while trying to delete the purchaseOrder. Please try again.");
        });
    }
  };

  const toggleRow = (purchaseOrderId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseOrderId)) {
        newSet.delete(purchaseOrderId);
      } else {
        newSet.add(purchaseOrderId);
      }
      return newSet;
    });
  };

  return (
    <div className="purchaseOrder-page">
      <h1 className="page-title">PurchaseOrder Details</h1>

        
      <Link to="/add-purchase-order">
        <button className="action-button add-button">Add Purchase Order</button>
      </Link>


      <table className="styled-table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Company</th>
            <th>Branch</th>
            <th>WareHouse</th>
            <th>Order Date</th>
            <th>Used?</th>
            <th>Delivery Date</th>
            <th>Supplier</th>
            <th>Cost</th>
            <th>Image</th>
            <th>Products</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((purchaseOrder, index) => (
            <tr key={purchaseOrder.purchase_order.id}>
              <td>{index + 1}</td>
              <td>{purchaseOrder.purchase_order.company.name || "N/A"}</td>
              <td>{purchaseOrder.purchase_order.branch?.location || "N/A"}</td>
              <td>{purchaseOrder?.purchase_order?.warehouse?.location || "N/A"}</td>
              <td>{purchaseOrder.purchase_order.created_at || "N/A"}</td>
              <td>{purchaseOrder.purchase_order.used ? "used" : "not used"}</td>
              <td>{purchaseOrder.purchase_order.delivery_date || "N/A"}</td>
              <td>{purchaseOrder.purchase_order.supplier.name || "N/A"}</td>
              <td>{purchaseOrder.purchase_order.total_cost || "N/A"}</td>
              <td>{(purchaseOrder.purchase_order.image &&  (
                    <img
                          src={purchaseOrder.purchase_order.image}
                          alt="Purchase Order Image"
                          className="h-10 w-10 object-contain rounded"
                          onClick={() => setSelectedImage(`${purchaseOrder.purchase_order.image}`)}

                        />
                      )) || (
                        "No Image"
                      )}</td>
              <td>
                {purchaseOrder.products && purchaseOrder.products.length > 0 ? (
                  <div className="min-w-[250px]">
                    <button 
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                      onClick={() => toggleRow(purchaseOrder.purchase_order.id)}
                    >
                      <span className="font-medium">
                        {purchaseOrder.products.length} {purchaseOrder.products.length === 1 ? 'Product' : 'Products'}
                      </span>
                      <span className="text-sm">
                        {expandedRows.has(purchaseOrder.purchase_order.id) ? '▼' : '▶'}
                      </span>
                    </button>
                    {expandedRows.has(purchaseOrder.purchase_order.id) && (
                      <div className="mt-3 space-y-4 bg-white rounded-md shadow-sm border border-gray-200">
                        {purchaseOrder.products.map((product, i) => (
                          <div key={product.id} className="p-4">
                            {product.product.product_image && <img src={product.product.product_image} alt={product.product.product_name} className="w-16 h-16 object-cover rounded-md mx-auto" />}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="space-y-2">
                                <p>
                                  <span className="font-semibold text-gray-600">Name:</span>
                                  <span className="ml-2">{product.product.product_name}</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-600">Category:</span>
                                  <span className="ml-2">{product.product.category.category_name}</span>
                                </p>
                              </div>
                              <div className="space-y-2">
                                <p>
                                  <span className="font-semibold text-gray-600">Weight:</span>
                                  <span className="ml-2">{(product?.product?.packaging_weight || 0)} grams</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-gray-600">Quantity:</span>
                                  <span className="ml-2">{product.quantity}</span>
                                </p>
                              </div>
                              <p className="col-span-2">
                                <span className="font-semibold text-gray-600">Cost/Unit:</span>
                                <span className="ml-2">{(product.cost) || 'N/A'}</span>
                              </p>
                              <p className="col-span-2">
                                <span className="font-semibold text-gray-600">Total:</span>
                                <span className="ml-2">{product.cost ? `${(product.cost * product.quantity).toFixed(2)}` : 'N/A'}</span>
                              </p>
                            </div>
                            {i < purchaseOrder.products.length - 1 && (
                              <div className="mt-4 border-b border-gray-200"></div>
                            )}
                          </div>
                        ))}
                        <hr />
                        <p className="flex justify-between text-lg font-bold text-gray-600 pb-4 px-4"><span>Total Cost: </span> <span>{purchaseOrder.purchase_order.total_cost}</span></p>
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
                  onClick={() => handleUpdate(purchaseOrder.purchase_order.id)}
                >
                  Update
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleDelete(purchaseOrder.purchase_order.id)}
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

export default PurchaseOrderPage;
