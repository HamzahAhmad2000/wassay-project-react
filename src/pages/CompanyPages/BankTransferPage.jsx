import { useEffect, useState } from "react";
import { getBankTransfers, /*deleteBankTransfers*/ } from "../../APIs/CompanyAPIs"; // Adjust the import path and include deleteBankTransfers if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageModal from "/src/components/ImageModal";

const BankTransferPage = () => {
  const navigate = useNavigate();
  const [bankTransfers, setBankTransfers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBankTransfers, setFilteredBankTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchBankTransfersData();
  }, []);

  const fetchBankTransfersData = async () => {
    setLoading(true);
    try {
      const bankTransfersData = await getBankTransfers();
      setBankTransfers(bankTransfersData);
      setFilteredBankTransfers(bankTransfersData);
    } catch (error) {
      toast.error("Failed to load bankTransfers. Please refresh the page", error);
      setError("Failed to load bankTransfers.");
      console.error("Error fetching bankTransfers:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (bankId) => {
  //   if (window.confirm("Are you sure you want to delete this bank?")) {
  //     try {
  //       const response = await deleteBankTransfers(bankId); // Assuming you have a deleteBankTransfers API call
  //       if (response.ok) {
  //         setBankTransfers(bankTransfers.filter((bank) => bank.id !== bankId));
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
    let filtered = bankTransfers;
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
    setFilteredBankTransfers(filtered);
  }, [searchTerm, bankTransfers]);

  const bankHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Transferred By", key: "transferred_by_name", sortable: true },
    { label: "Transferred From", key: "transfer_source", sortable: true },
    { label: "Amount", key: "amount", sortable: true },
    { label: "Note", key: "note", sortable: false },
    { label: "Image", key: "image", sortable: false },
    { label: "Date/time", key: "created_at", sortable: true }, // Assuming your API returns bank name under 'bank' or adjust accordingly
    // { label: "Actions", key: "actions", sortable: false },
  ];

  const bankData = filteredBankTransfers.map((bank, index) => ({
    serial_no: index + 1,
    transferred_by_name: bank.transferred_by_name || "N/A",
    transfer_source: bank.transfer_source || "Location not Available",
    amount: bank.amount || "N/A",
    note: bank.note || "N/A", 
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
    created_at: bank.created_at || "N/A", // Adjust key if needed
    // actions: (
    //   <div className="flex space-x-2">
    //     <button
    //       onClick={() => navigate(`/bankTransfers/edit/${bank.id}`)} // Adjust route as needed
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

  if (loading) return <div className="text-center mt-4">Loading bankTransfers...</div>;
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
          navigate(`/add-bank-transfer`);
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

export default BankTransferPage;