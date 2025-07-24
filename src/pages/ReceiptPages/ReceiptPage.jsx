import { useEffect, useState } from "react";
import { getReceipts, deleteReceipts } from "/src/APIs/TaxAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";
import { verifyToken } from "/src/APIs/TokenAPIs";

const ReceiptPage = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => {
          navigate("/login");
        });
    }
  }, [navigate]);

  useEffect(() => {
    getReceipts()
      .then((data) => {
        setReceipts(data);
        setFilteredReceipts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching receipts:", error);
        alert("Failed to load receipts. Please try again.");
        setIsLoading(false);
      });
  }, []);

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = receipts;
    if (searchTerm) {
      filtered = filtered.filter((receipt) => {
        return Object.keys(receipt).some((key) => {
          const value = receipt[key];

          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some((nestedValue) =>
              nestedValue &&
              nestedValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      });
    }

    if (paymentMethodFilter) {
      filtered = filtered.filter(
        (receipt) => receipt.payment_method === paymentMethodFilter
      );
    }

    if (paymentStatusFilter) {
      filtered = filtered.filter(
        (receipt) => receipt.payment_status === paymentStatusFilter
      );
    }

    setFilteredReceipts(filtered);
  }, [searchTerm, receipts, paymentMethodFilter, paymentStatusFilter]);

  const handleUpdate = (receiptId) => {
    const receipt = receipts.find((c) => c.id === receiptId);
    if (receipt) {
      navigate(`/update-receipt/${receiptId}`, { state: { receipt } });
    } else {
      console.error(`Receipt with ID ${receiptId} not found.`);
    }
  };

  const handleDelete = (receiptId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this receipt?");
    if (confirmDelete) {
      deleteReceipts(receiptId)
        .then((response) => {
          if (response.ok) {
            setReceipts(receipts.filter((receipt) => receipt.id !== receiptId));
          } else {
            console.error("Failed to delete receipt:", response.status);
            alert("Failed to delete the receipt. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting receipt:", error);
          alert("An error occurred. Unable to delete the receipt at this time.");
        });
    }
  };

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

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    if (sortBy === null) return 0;

    let valueA, valueB;

    if (sortBy === "customer") {
      valueA = `${a.customer?.first_name} ${a.customer?.last_name}`.toLowerCase();
      valueB = `${b.customer?.first_name} ${b.customer?.last_name}`.toLowerCase();
    } else if (sortBy === "sales_person") {
      valueA = a.sales_person?.user_name?.toLowerCase() || "";
      valueB = b.sales_person?.user_name?.toLowerCase() || "";
    } else {
      valueA = a[sortBy];
      valueB = b[sortBy];
    }

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = (valueB || '').toString().toLowerCase();
    } else if (valueA instanceof Date) {
      valueA = new Date(valueA).getTime();
      valueB = (valueB instanceof Date ? new Date(valueB).getTime() : -Infinity);
    } else if (typeof valueA === 'number') {
      valueB = valueB || -Infinity;
    } else {
      valueA = valueA ? valueA.toString().toLowerCase() : "";
      valueB = valueB ? valueB.toString().toLowerCase() : "";
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  const paymentMethods = [...new Set(receipts.map((r) => r.payment_method))];
  const paymentStatuses = [...new Set(receipts.map((r) => r.payment_status))];

  return (
    <div className="receipt-page">
      <h1 className="page-title">Receipt Details</h1>

      <div className="filters-container">
        <Link to="/add-receipt">
          <button className="action-button add-button">Add Receipt</button>
        </Link>
        <div className="filter">
          <label htmlFor="paymentMethod">Payment Method:</label>
          <select
            id="paymentMethod"
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="">All</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label htmlFor="paymentStatus">Payment Status:</label>
          <select
            id="paymentStatus"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p>Loading receipts...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th onClick={() => handleSort("branch")} className="sortable-header">
                Branch {sortBy === "branch" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("customer")} className="sortable-header">
                Customer {sortBy === "customer" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("on_hold")} className="sortable-header">
                On Hold? {sortBy === "on_hold" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("created_at")} className="sortable-header">
                Date {sortBy === "created_at" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("payment_method")} className="sortable-header">
                Payment Method {sortBy === "payment_method" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("sales_person")} className="sortable-header">
                Sales Person {sortBy === "sales_person" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("total_amount")} className="sortable-header">
                Total Amount {sortBy === "total_amount" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("tax_amount")} className="sortable-header">
                Tax {sortBy === "tax_amount" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th onClick={() => handleSort("amount_paid")} className="sortable-header">
                Amount Paid {sortBy === "amount_paid" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th>Amount Remaining</th>
              <th onClick={() => handleSort("payment_status")} className="sortable-header">
                Payment Status {sortBy === "payment_status" && (sortDirection === "asc" ? "▲" : "▼")}
              </th>
              <th>Receipt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReceipts.map((receipt, index) => (
              <tr key={receipt.id}>
                <td>{index + 1}</td>
                <td>{receipt.branch}</td>
                <td>{receipt.customer ? `${receipt.customer.first_name} ${receipt.customer.last_name}` : "N/A"}</td>
                <td>{receipt.on_hold ? `YES` : "NO"}</td>
                <td>{new Date(receipt.created_at).toLocaleDateString()}</td>
                <td>{receipt.payment_method}</td>
                <td>{receipt.sales_person?.user_name || "N/A"}</td>
                <td>{(receipt.total_amount).toFixed(2)}</td>
                <td>{(receipt.tax_amount).toFixed(2)}</td>
                <td>{(receipt.amount_paid).toFixed(2)}</td>
                <td>{(receipt.total_amount - receipt.amount_paid + receipt.tax_amount).toFixed(2)}</td>
                <td>{receipt.payment_status}</td>
                <td>
                  {receipt.line_items?.length > 0 ? (
                    <div className="min-w-[250px]">
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                        onClick={() => toggleRow(receipt.id)}
                      >
                        <span className="font-medium">
                          {receipt.line_items.length} {receipt.line_items.length === 1 ? 'Product' : 'Products'}
                        </span>
                        <span className="text-sm">
                          {expandedRows.has(receipt.id) ? '▼' : '▶'}
                        </span>
                      </button>
                      {expandedRows.has(receipt.id) && (
                        <div className="mt-3 bg-white rounded-md shadow-sm border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost/Unit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {receipt.line_items.map((product, i) => (
                                <tr key={product.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i + 1}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product?.product_name || "No Name"}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.product?.category?.category_name || "N/A"}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.total_price / product.price}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(product.price).toFixed(2) || 'N/A'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.discount.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(product.total_price - product.discount).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr>
                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Bill Total:</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.total_amount.toFixed(2)}</td>

                              </tr>
                              <tr>
                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Tax:</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{receipt.tax_amount.toFixed(2)}</td>
                              </tr>

                              <tr>
                                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">Grand Total:</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(receipt.total_amount + receipt.tax_amount).toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
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
                    onClick={() => handleUpdate(receipt.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(receipt.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReceiptPage;