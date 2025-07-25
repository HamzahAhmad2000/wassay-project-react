import { useEffect, useState } from "react";
import { getBanks, /*deleteBanks*/ } from "../../APIs/CompanyAPIs"; // Adjust the import path and include deleteBanks if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BankPage = () => {
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBanksData();
  }, []);

  const fetchBanksData = async () => {
    setLoading(true);
    try {
      const banksData = await getBanks();
      setBanks(banksData);
      setFilteredBanks(banksData);
    } catch (error) {
      toast.error("Failed to load banks. Please refresh the page", error);
      setError("Failed to load banks.");
      console.error("Error fetching banks:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (bankId) => {
  //   if (window.confirm("Are you sure you want to delete this bank?")) {
  //     try {
  //       const response = await deleteBanks(bankId); // Assuming you have a deleteBanks API call
  //       if (response.ok) {
  //         setBanks(banks.filter((bank) => bank.id !== bankId));
  //         toast.success("Bank deleted successfully.");
  //       } else {
  //         const errorData = await response.json();
  //         toast.error(`Failed to delete bank: ${errorData.error || "An error occurred"}`);
  //       }
  //     } catch (error) {
  //       toast.error("Error deleting bank:", error);
  //       console.error("Error deleting bank:", error);
  //     }
  //   }
  // };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = banks;
    if (searchTerm) {
      filtered = filtered.filter((bank) =>
        Object.keys(bank).some((key) => {
          const value = bank[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredBanks(filtered);
  }, [searchTerm, banks]);

  const bankHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "Branch", key: "branch", sortable: true },
    { label: "Cash", key: "cash", sortable: true },
    { label: "Bank", key: "bank_name", sortable: true }, // Assuming your API returns bank name under 'bank' or adjust accordingly
    // { label: "Actions", key: "actions", sortable: false },
  ];

  const bankData = filteredBanks.map((bank, index) => ({
    serial_no: index + 1,
    company: bank.company.name || "N/A",
    branch: bank.branch.location || "Location not Available",
    cash: bank.cash || "N/A",
    bank_name: bank.bank || "N/A", // Adjust key if needed
    // actions: (
    //   <div className="flex space-x-2">
    //     <button
    //       onClick={() => navigate(`/banks/edit/${bank.id}`)} // Adjust route as needed
    //       className="inline-flex items-center px-2 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white focus:outline-none text-sm"
    //     >
    //       <Pencil className="h-4 w-4 mr-1" />
    //       Update
    //     </button>
    //     <button
    //       onClick={() => handleDelete(bank.id)}
    //       className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
    //     >
    //       <Trash2 className="h-4 w-4 mr-1" />
    //       Delete
    //     </button>
    //   </div>
    // ),
  }));

  if (loading) return <div className="text-center mt-4">Loading banks...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Bank Details</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Bank"}
        onButtonClick={() => {
          navigate(`/add-bank`);
        }}
      />
      <ReusableTable headers={bankHeaders} data={bankData} />
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
    </div>
  );
};

export default BankPage;