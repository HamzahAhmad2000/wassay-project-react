import { useEffect, useState } from "react";
import { getContractDocumentCategory, deleteContractDocumentCategory } from "../../APIs/ProductAPIs"; // Adjust the import path and include deleteContractDocumentCategory if available
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
// import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Pencil, Trash2 } from "lucide-react";

const ContractDocumentCategoryPage = () => {
  const navigate = useNavigate();
  const [contractDocumentCategories, setContractDocumentCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContractDocumentCategories, setFilteredContractDocumentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContractDocumentCategoriesData();
  }, []);

  const fetchContractDocumentCategoriesData = async () => {
    setLoading(true);
    try {
      const contractDocumentCategoriesData = await getContractDocumentCategory();
      console.log(contractDocumentData)
      setContractDocumentCategories(contractDocumentCategoriesData);
      setFilteredContractDocumentCategories(contractDocumentCategoriesData);
    } catch (error) {
      toast.error("Failed to load contractDocumentCategories. Please refresh the page", error);
      setError("Failed to load contractDocumentCategories.");
      console.error("Error fetching contractDocumentCategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contractDocumentId) => {
    if (window.confirm("Are you sure you want to delete this Other Source Of Income?")) {
      try {
        const response = await deleteContractDocumentCategory(contractDocumentId); // Assuming you have a deleteContractDocumentCategory API call
        console.log(response)
        setContractDocumentCategories(contractDocumentCategories.filter((contractDocument) => contractDocument.id !== contractDocumentId));
        toast.success("ContractDocumentCategories deleted successfully.");
        if (!response.ok) {
          const errorData = await response.json();
          toast.error(`Failed to delete contractDocument: ${errorData.error || "An error occurred"}`);
        }
      } catch (error) {
        toast.error("Error deleting contractDocument:", error);
        console.error("Error deleting contractDocument:", error);
      }
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = contractDocumentCategories;
    if (searchTerm) {
      filtered = filtered.filter((contractDocument) =>
        Object.keys(contractDocument).some((key) => {
          const value = contractDocument[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredContractDocumentCategories(filtered);
  }, [searchTerm, contractDocumentCategories]);

  const contractDocumentHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company_name", sortable: true },
    { label: "Branch", key: "branch_location", sortable: true },
    { label: "Name", key: "name", sortable: true }, // Assuming your API returns contractDocument name under 'contractDocument' or adjust accordingly
    { label: "Actions", key: "actions", sortable: false },
  ];

  const contractDocumentData = filteredContractDocumentCategories.map((contractDocument, index) => ({
    serial_no: index + 1,
    company_name: `${contractDocument.company_name}` || "N/A",
    branch_location: `${contractDocument.branch_location}` || "N/A",
    name: contractDocument.name || "N/A", // Adjust key if needed
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/update-other-source-of-income-category`, { state: { contractDocument } } )} // Adjust route as needed
          className="inline-flex items-center px-2 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          onClick={() => handleDelete(contractDocument.id)}
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  if (loading) return <div className="text-center mt-4">Loading contractDocumentCategories...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="contractDocument-page">
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
      <h1 className="page-title">ContractDocumentCategories Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add ContractDocumentCategories"}
        onButtonClick={() => {
          navigate(`/add-other-source-of-income-category`);
        }}
      />
      <ReusableTable headers={contractDocumentHeaders} data={contractDocumentData} />
    </div>
  );
};

export default ContractDocumentCategoryPage;