import { useEffect, useState } from "react";
import { getCustomerLedgers } from "/src/APIs/CustomerAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the ReusableTable

const CustomerLedgerPage = () => {
  const navigate = useNavigate();
  const [ledgers, setLedgers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLedgers, setFilteredLedgers] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    getCustomerLedgers()
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
      filtered = filtered.filter((ledger) =>
        Object.keys(ledger).some((key) => {
          const value = ledger[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredLedgers(filtered);
  }, [searchTerm, ledgers]);

  const toggleRow = (receiptsId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(receiptsId)) {
        newSet.delete(receiptsId);
      } else {
        newSet.add(receiptsId);
      }
      return newSet;
    });
  };

  const ledgerHeaders = [
    { label: "Sr. No.", key: "serial_no" }, // We'll generate this in the data mapping
    { label: "Customer", key: "customer_name", sortable: true },
    { label: "Staff", key: "staff_name", sortable: true },
    { label: "Receipt", key: "receipt_details", sortable: false }, // Custom rendering
    { label: "Total Amount", key: "total_amount", sortable: true },
    { label: "Paid", key: "amount_paid", sortable: true },
    { label: "Balance", key: "balance", sortable: true },
    { label: "Created At", key: "created_at", sortable: true },
    { label: "Updated At", key: "updated_at", sortable: true },
    // No 'Actions' header in this table based on the provided code
  ];

  const ledgerData = filteredLedgers.map((customer, index) => ({
    serial_no: index + 1,
    customer_name: customer.customer_name,
    staff_name: customer.staff_name || "",
    receipt_details: (
      <div className="min-w-[250px]">
        {customer?.receipt?.length > 0 ? (
          <>
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
              onClick={() => toggleRow(customer.receipt.receipt)}
            >
              <span className="font-medium">
                {customer?.receipt?.length} {customer?.receipt?.length === 1 ? 'Product' : 'Products'}
              </span>
              <span className="text-sm">
                {expandedRows.has(customer.receipt.receipt) ? '▼' : '▶'}
              </span>
            </button>
            {expandedRows.has(customer.receipt.receipt) && (
              <div className="mt-3 bg-white rounded-md shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.receipt.map((product, i) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product?.product_name || "No Name"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.product?.category?.category_name || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.floor(product.total_price / product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(product.price).toFixed(2) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Total Cost:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.receipt.reduce((acc, product) => acc + product.total_price, 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500 italic">No Products</span>
        )}
      </div>
    ),
    total_amount: customer.total_amount,
    amount_paid: customer.amount_paid,
    balance: customer.balance,
    created_at: new Date(customer.created_at).toLocaleString(),
    updated_at: new Date(customer.updated_at).toLocaleString(),
  }));

  return (
    <div className="customer-page">
      <h1 className="page-title">Customer Ledger Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Customer Ledger"}
        onButtonClick={() => {
          navigate(`/add-customer-ledger`);
        }}
      />
      {isLoading ? (
        <p>Loading ledgers...</p>
      ) : (
        <ReusableTable headers={ledgerHeaders} data={ledgerData} />
      )}
    </div>
  );
};

export default CustomerLedgerPage;