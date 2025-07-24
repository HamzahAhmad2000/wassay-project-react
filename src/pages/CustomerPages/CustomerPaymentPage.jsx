import { useEffect, useState } from "react";
import { getCustomerPayments } from "../../APIs/CustomerAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerPaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchCustomerPaymentsData();
  }, []);

  const fetchCustomerPaymentsData = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomerPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = payments;
    if (searchTerm) {
      filtered = filtered.filter((payment) => {
        return Object.keys(payment).some((key) => {
          const value = payment[key];

          // If the value is an object, search within its properties
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some((nestedValue) =>
              nestedValue &&
              nestedValue.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          // Otherwise, perform a simple string search
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      });
    }

    if (paymentMethodFilter) {
      filtered = filtered.filter(
        (payment) => payment.payment_method === paymentMethodFilter
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, payments, paymentMethodFilter]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (sortBy === null) return 0;

    let valueA, valueB;

    if (sortBy === "customer") {
      valueA = `${a.customer_detail?.first_name} ${a.customer_detail?.last_name}`.toLowerCase();
      valueB = `${b.customer_detail?.first_name} ${b.customer_detail?.last_name}`.toLowerCase();
    } else if (sortBy === "recorded_by") {
      valueA = a.recorded_by_detail?.user_name?.toLowerCase() || "";
      valueB = b.recorded_by_detail?.user_name?.toLowerCase() || "";
    } else {
      valueA = a[sortBy];
      valueB = b[sortBy];
    }

    if (typeof valueA === 'string') {
      valueA = valueA.toLowerCase();
      valueB = (valueB || '').toString().toLowerCase();
    } else if (valueA instanceof Date) {
      valueA = valueA.getTime();
      valueB = (valueB instanceof Date ? valueB.getTime() : -Infinity);
    } else {
      valueA = valueA || -Infinity;
      valueB = valueB || -Infinity;
    }

    if (sortDirection === "asc") {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  const paymentMethods = [...new Set(payments.map((p) => p.payment_method))];

  const paymentHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    {
      label: "Customer",
      key: "customer",
      sortable: true,
      onSort: () => handleSort("customer"),
    },
    {
      label: "Payment Date",
      key: "repayment_date",
      sortable: true,
      onSort: () => handleSort("repayment_date"),
      format: (date) => new Date(date).toLocaleDateString(),
    },
    {
      label: "Amount in Cash",
      key: "amount_in_cash",
      sortable: true,
      onSort: () => handleSort("amount_in_cash"),
      format: (amount) => amount?.toFixed(2) || "0.00",
    },
    {
      label: "Amount in Bank",
      key: "amount_in_bank",
      sortable: true,
      onSort: () => handleSort("amount_in_bank"),
      format: (amount) => amount?.toFixed(2) || "0.00",
    },
    {
      label: "Payment Method",
      key: "payment_method",
      sortable: true,
      onSort: () => handleSort("payment_method"),
    },
    {
      label: "Recorded By",
      key: "recorded_by",
      sortable: true,
      onSort: () => handleSort("recorded_by"),
      format: (recordedBy) => recordedBy?.user_name || recordedBy,
    },
    { label: "Notes", key: "notes" },
    {
      label: "Created At",
      key: "created_at",
      sortable: true,
      onSort: () => handleSort("created_at"),
      format: (date) => new Date(date).toLocaleString(),
    },
    {
      label: "Updated At",
      key: "updated_at",
      sortable: true,
      onSort: () => handleSort("updated_at"),
      format: (date) => new Date(date).toLocaleString(),
    },
  ];

  const paymentData = sortedPayments.map((payment, index) => ({
    serial_no: index + 1,
    customer: `${payment.customer_detail?.first_name} ${payment.customer_detail?.last_name}`,
    repayment_date: payment.repayment_date,
    amount_in_cash: payment.amount_in_cash,
    amount_in_bank: payment.amount_in_bank,
    payment_method: payment.payment_method,
    recorded_by: payment.recorded_by_detail.user_name,
    notes: payment.notes || "",
    created_at: payment.created_at,
    updated_at: payment.updated_at,
  }));
  return (
    <div className="customer-payments-page">
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
      <h1 className="page-title">Customer Payments</h1>
      <div className="filters-container">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          buttonText={"Add Payment"}
          onButtonClick={() => {
            navigate(`/add-customer-payment`); // You'll need to create this route
          }}
        />
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
      </div>

      {isLoading ? (
        <p>Loading payments...</p>
      ) : (
        <ReusableTable headers={paymentHeaders} data={paymentData} />
      )}
    </div>
  );
};

export default CustomerPaymentsPage;