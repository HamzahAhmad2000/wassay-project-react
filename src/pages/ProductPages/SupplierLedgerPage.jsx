import { useEffect, useState } from "react";
import { getSupplierLedgers } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";

const SupplierLedgerPage = () => {
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({
    purchaseOrders: new Set(),
    invoices: new Set(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLedgers, setFilteredLedgers] = useState([]);

  useEffect(() => {
    getSupplierLedgers()
      .then((ledgers) => {
        setLedgers(ledgers);
        setFilteredLedgers(ledgers);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ledgers:", error);
        alert("Failed to load ledgers. Please try again.");
        setIsLoading(false);
      });
  }, []);

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = ledgers;
    if (searchTerm) {
      filtered = ledgers.filter((ledger) =>
        [
          ledger.supplier?.name,
          ledger.purchase_order?.purchase_order_number,
          ledger.invoice?.invoice_number,
          ledger.transaction_type,
          ledger.description,
        ].some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredLedgers(filtered);
  }, [searchTerm, ledgers]);

  const toggleRow = (type, id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev[type]);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { ...prev, [type]: newSet };
    });
  };

  return (
    <div className="supplier-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Supplier Ledger Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText="Add Supplier Ledger"
        onButtonClick={() => navigate("/add-supplier-ledger")}
      />
      {isLoading ? (
        <p className="text-gray-500">Loading ledgers...</p>
      ) : filteredLedgers.length === 0 ? (
        <p className="text-gray-500">No ledgers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="styled-table min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLedgers.map((ledger, index) => (
                <tr key={ledger.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{ledger.supplier?.name || "N/A"}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {ledger.purchase_order?.products?.length > 0 ? (
                      <div className="min-w-[250px]">
                        <button
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                          onClick={() => toggleRow("purchaseOrders", ledger.purchase_order.id)}
                        >
                          <span className="font-medium">
                            {ledger.purchase_order.products.length}{" "}
                            {ledger.purchase_order.products.length === 1 ? "Product" : "Products"}
                          </span>
                          <span className="text-sm">
                            {expandedRows.purchaseOrders.has(ledger.purchase_order.id) ? "▼" : "▶"}
                          </span>
                        </button>
                        {expandedRows.purchaseOrders.has(ledger.purchase_order.id) && (
                          <div className="mt-3 bg-white rounded-md shadow-sm border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {ledger.purchase_order.products.map((product, i) => (
                                  <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.product.product_name || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.remaining}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No Products</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {ledger.invoice?.items?.length > 0 ? (
                      <div className="min-w-[250px]">
                        <button
                          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                          onClick={() => toggleRow("invoices", ledger.invoice.id)}
                        >
                          <span className="font-medium">
                            {ledger.invoice.items.length} {ledger.invoice.items.length === 1 ? "Item" : "Items"}
                          </span>
                          <span className="text-sm">
                            {expandedRows.invoices.has(ledger.invoice.id) ? "▼" : "▶"}
                          </span>
                        </button>
                        {expandedRows.invoices.has(ledger.invoice.id) && (
                          <div className="mt-3 bg-white rounded-md shadow-sm border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {ledger.invoice.items.map((item, i) => (
                                  <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_name || "N/A"}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price ? (item.price.toFixed(2) * item.quantity) : "N/A"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No Items</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ledger.invoice?.total_amount?.toFixed(2) || "0.00"}
                  </td>
                  {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(ledger.invoice?.total_amount + ledger.balance)?.toFixed(2) || "0.00"}
                  </td> */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ledger.balance?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ledger.description || "N/A"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ledger.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ledger.updated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/edit-supplier-ledger/${ledger.id}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupplierLedgerPage;