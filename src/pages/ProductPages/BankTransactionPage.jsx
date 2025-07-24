import { useEffect, useState } from "react";
import { getBankTransactions, /*deleteBankTransactions*/ } from "../../APIs/CompanyAPIs"; // Adjust the import path and include deleteBankTransactions if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageModal from "/src/components/ImageModal";
import {formatDate} from "/src/utils/dateUtils"; // Adjust the import path as needed

const BankTransactionPage = () => {
  const navigate = useNavigate();
  const [bankTransactions, setBankTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBankTransactions, setFilteredBankTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchBankTransactionsData();
  }, []);

  const fetchBankTransactionsData = async () => {
    setLoading(true);
    try {
      const bankTransactionsData = await getBankTransactions();
      setBankTransactions(bankTransactionsData);
      setFilteredBankTransactions(bankTransactionsData);
    } catch (error) {
      toast.error("Failed to load bankTransactions. Please refresh the page", error);
      setError("Failed to load bankTransactions.");
      console.error("Error fetching bankTransactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (bankId) => {
  //   if (window.confirm("Are you sure you want to delete this bank?")) {
  //     try {
  //       const response = await deleteBankTransactions(bankId); // Assuming you have a deleteBankTransactions API call
  //       if (response.ok) {
  //         setBankTransactions(bankTransactions.filter((bank) => bank.id !== bankId));
  //         toast.success("BankTransfer deleted successfully.");
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
    let filtered = bankTransactions;
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
    setFilteredBankTransactions(filtered);
  }, [searchTerm, bankTransactions]);

  const bankHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Recorded By", key: "recorded_by_name", sortable: true },
    { label: "Amount in Cash", key: "amount_cash", sortable: true },
    { label: "Amount in Bank", key: "amount_bank", sortable: true },
    { label: "Note", key: "notes", sortable: false },
    { label: "Image", key: "image", sortable: false },
    { label: "Date/time", key: "created_at", sortable: true }, // Assuming your API returns bank name under 'bank' or adjust accordingly
    // { label: "Actions", key: "actions", sortable: false },
  ];

  const bankData = filteredBankTransactions.map((bank, index) => ({
    serial_no: index + 1,
    recorded_by_name: bank.recorded_by_name || "N/A",
    amount_cash: bank.amount_cash || "N/A",
    amount_bank: bank.amount_bank || "N/A",
    notes: bank.notes || "N/A", 
    image: bank.image ? (
      <img
        src={`${bank.image}`}
        alt="Receipt"
        className="h-12 w-12 object-cover rounded cursor-pointer"
        onClick={() => setSelectedImage(`${bank.image}`)}
      />
    ) : (
      "N/A"
    ),
    created_at: formatDate(bank.created_at) || "N/A", // Adjust key if needed
    // actions: (
    //   <div className="flex space-x-2">
    //     <button
    //       onClick={() => navigate(`/bankTransactions/edit/${bank.id}`)} // Adjust route as needed
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

  if (loading) return <div className="text-center mt-4">Loading bankTransactions...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="bank-page">
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
      <h1 className="page-title">BankTransfer Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add BankTransfer"}
        onButtonClick={() => {
          navigate(`/add-bank-transaction`);
        }}
      />
      <ReusableTable headers={bankHeaders} data={bankData} />
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        altText='profitLog image'
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default BankTransactionPage;