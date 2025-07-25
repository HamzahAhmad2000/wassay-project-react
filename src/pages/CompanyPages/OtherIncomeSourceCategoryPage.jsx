import { useEffect, useState } from "react";
import { getOtherIncomeCategory, deleteOtherIncomeCategory } from "../../APIs/CompanyAPIs"; // Adjust the import path and include deleteOtherIncomeCategory if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../../additionalOriginuiComponents/ui/button";

const OtherIncomeSourceCategoryPage = () => {
  const navigate = useNavigate();
  const [otherSourceOfIncomes, setOtherSourceOfIncome] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOtherSourceOfIncome, setFilteredOtherSourceOfIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOtherSourceOfIncomeData();
  }, []);

  const fetchOtherSourceOfIncomeData = async () => {
    setLoading(true);
    try {
      const otherSourceOfIncomesData = await getOtherIncomeCategory();
      console.log(otherSourceOfIncomeData)
      setOtherSourceOfIncome(otherSourceOfIncomesData);
      setFilteredOtherSourceOfIncome(otherSourceOfIncomesData);
    } catch (error) {
      toast.error("Failed to load otherSourceOfIncomes. Please refresh the page", error);
      setError("Failed to load otherSourceOfIncomes.");
      console.error("Error fetching otherSourceOfIncomes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (otherSourceOfIncomeId) => {
    if (window.confirm("Are you sure you want to delete this Other Source Of Income?")) {
      try {
        const response = await deleteOtherIncomeCategory(otherSourceOfIncomeId); // Assuming you have a deleteOtherIncomeCategory API call
        console.log(response)
        setOtherSourceOfIncome(otherSourceOfIncomes.filter((otherSourceOfIncome) => otherSourceOfIncome.id !== otherSourceOfIncomeId));
        toast.success("OtherSourceOfIncome deleted successfully.");
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(`Failed to delete otherSourceOfIncome: ${errorData.error || "An error occurred"}`);
        }
      } catch (error) {
        toast.error("Error deleting otherSourceOfIncome:", error);
        console.error("Error deleting otherSourceOfIncome:", error);
      }
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = otherSourceOfIncomes;
    if (searchTerm) {
      filtered = filtered.filter((otherSourceOfIncome) =>
        Object.keys(otherSourceOfIncome).some((key) => {
          const value = otherSourceOfIncome[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredOtherSourceOfIncome(filtered);
  }, [searchTerm, otherSourceOfIncomes]);

  const otherSourceOfIncomeHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company_name", sortable: true },
    { label: "Category", key: "category_name", sortable: true }, // Assuming your API returns otherSourceOfIncome name under 'otherSourceOfIncome' or adjust accordingly
    { label: "Actions", key: "actions", sortable: false },
  ];

  const otherSourceOfIncomeData = filteredOtherSourceOfIncome.map((otherSourceOfIncome, index) => ({
    serial_no: index + 1,
    company_name: `${otherSourceOfIncome.company_name}` || "N/A",
    category_name: otherSourceOfIncome.category_name || "N/A", // Adjust key if needed
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => navigate(`/update-other-source-of-income-category`, { state: { otherSourceOfIncome } } )} // Adjust route as needed
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(otherSourceOfIncome.id)}
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    ),
  }));

  if (loading) return <div className="text-center mt-4">Loading otherSourceOfIncomes...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">OtherSourceOfIncome Details</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add OtherSourceOfIncome"}
        onButtonClick={() => {
          navigate(`/add-other-source-of-income-category`);
        }}
      />
      <ReusableTable headers={otherSourceOfIncomeHeaders} data={otherSourceOfIncomeData} />
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

export default OtherIncomeSourceCategoryPage;