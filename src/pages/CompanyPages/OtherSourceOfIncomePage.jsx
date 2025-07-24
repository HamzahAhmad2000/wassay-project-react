import { useEffect, useState } from "react";
import { getOtherSourceOfIncomes, deleteOtherSourceOfIncome } from "../../APIs/CompanyAPIs"; // Adjust the import path and include deleteOtherSourceOfIncomes if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ImageModal from "/src/components/ImageModal";
import {formatDate} from "/src/utils/dateUtils"; // Adjust the import path as needed
import { Pencil, Trash2 } from "lucide-react";

const OtherSourceOfIncomePage = () => {
  const navigate = useNavigate();
  const [otherSourceOfIncomes, setOtherSourceOfIncomes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOtherSourceOfIncomes, setFilteredOtherSourceOfIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchOtherSourceOfIncomesData();
  }, []);

  const fetchOtherSourceOfIncomesData = async () => {
    setLoading(true);
    try {
      const otherSourceOfIncomesData = await getOtherSourceOfIncomes();
      setOtherSourceOfIncomes(otherSourceOfIncomesData);
      setFilteredOtherSourceOfIncomes(otherSourceOfIncomesData);
    } catch (error) {
      toast.error("Failed to load otherSourceOfIncomes. Please refresh the page", error);
      setError("Failed to load otherSourceOfIncomes.");
      console.error("Error fetching otherSourceOfIncomes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bankId) => {
    if (window.confirm("Are you sure you want to delete this Other Source of Income?")) {
      try {
        const response = await deleteOtherSourceOfIncome(bankId); // Assuming you have a deleteOtherSourceOfIncomes API call
        if (response.ok) {
          setOtherSourceOfIncomes(otherSourceOfIncomes.filter((bank) => bank.id !== bankId));
          toast.success("Other Source of Income deleted successfully.");
        } else {
          const errorData = await response.json();
          toast.error(`Failed to delete Other Source of Income: ${errorData.error || "An error occurred"}`);
        }
      } catch (error) {
        toast.error("Error deleting Other Source of Income:", error);
        console.error("Error deleting Other Source of Income:", error);
      }
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = otherSourceOfIncomes;
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
    setFilteredOtherSourceOfIncomes(filtered);
  }, [searchTerm, otherSourceOfIncomes]);

  const bankHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company_name", sortable: true },
    { label: "Branch", key: "branch_location", sortable: true },
    { label: "Category", key: "category_name", sortable: true },
    { label: "Amount in Cash", key: "amount_in_cash", sortable: true },
    { label: "Amount in Bank", key: "amount_in_bank", sortable: true },
    { label: "Date", key: "date", sortable: true },
    { label: "Description", key: "description", sortable: false },
    { label: "Recorded By", key: "recorded_by_user_name", sortable: true },
    { label: "Image", key: "image", sortable: false },
    { label: "Date/time", key: "created_at", sortable: true }, // Assuming your API returns bank name under 'bank' or adjust accordingly
    { label: "Actions", key: "actions", sortable: false },
  ];

  const bankData = filteredOtherSourceOfIncomes.map((bank, index) => ({
    serial_no: index + 1,
    company_name: bank.company_name || "N/A",
    branch_location: bank.branch_location || "N/A",
    category_name: bank.category_name || "N/A",
    amount_in_cash: bank.amount_in_cash || "N/A",
    amount_in_bank: bank.amount_in_bank || "N/A",
    date: bank.date || "N/A",
    description: bank.description || "N/A", 
    recorded_by_user_name: bank.recorded_by_user_name || "N/A",
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
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => (navigate(`/update-other-source-of-income`, { state: {bank}}))} // Adjust route as needed
          className="inline-flex items-center px-2 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          onClick={() => handleDelete(bank.id)}
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  if (loading) return <div className="text-center mt-4">Loading otherSourceOfIncomes...</div>;
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
      <h1 className="page-title">OtherSourceOfIncome Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add OtherSourceOfIncome"}
        onButtonClick={() => {
          navigate(`/add-other-source-of-income`);
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

export default OtherSourceOfIncomePage;