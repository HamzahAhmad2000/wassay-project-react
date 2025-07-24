import { useEffect, useState } from "react";
import { getCLP } from "../../APIs/CustomerAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CLPPage = () => {
  const navigate = useNavigate();
  const [CLP, setCLP] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCLP, setFilteredCLP] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchCustomerCLPData();
  }, []);

  const fetchCustomerCLPData = async () => {
    setIsLoading(true);
    try {
      const data = await getCLP();
      setCLP(data);
      setFilteredCLP(data);
    } catch (error) {
      console.error("Error fetching CLP:", error);
      toast.error("Failed to load CLP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = CLP;
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


    setFilteredCLP(filtered);
  }, [searchTerm, CLP]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedCLP = [...filteredCLP].sort((a, b) => {
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

  // const paymentMethods = [...new Set(CLP.map((p) => p.payment_method))];

  const paymentHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    {
      label: "Customer",
      key: "customer",
      sortable: true,
      onSort: () => handleSort("customer"),
    },
    {
      label: "Points",
      key: "points",
      sortable: true,
      onSort: () => handleSort("points"),
    },
  ];

  const paymentData = sortedCLP.map((payment, index) => ({
    serial_no: index + 1,
    customer: `${payment.customer_name}`,
    points: payment.points,
  }));
  return (
    <div className="customer-CLP-page">
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
      <h1 className="page-title">Customer CLP</h1>
      <div className="filters-container">
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          buttonText={"Add Payment"}
          onButtonClick={() => {
            navigate(`/add-CLP`); // You'll need to create this route
          }}
        />
      </div>

      {isLoading ? (
        <p>Loading CLP...</p>
      ) : (
        <ReusableTable headers={paymentHeaders} data={paymentData} />
      )}
    </div>
  );
};

export default CLPPage;