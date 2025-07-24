import { useEffect, useState } from "react";
import { getBranches, deleteBranches } from "../../APIs/CompanyAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BranchPage = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBranches, setFilteredBranches] = useState([]);

  useEffect(() => {
    fetchBranchesData();
  }, []);

  const fetchBranchesData = async () => {
    setIsLoading(true);
    try {
      const data = await getBranches();
      setBranches(data);
      setFilteredBranches(data);
    } catch (error) {
      toast.error("Failed to load branches. Please refresh the page.", error);
      console.error("Error fetching branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = branches;
    if (searchTerm) {
      filtered = filtered.filter((branch) =>
        Object.keys(branch).some((key) => {
          const value = branch[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleUpdate = (branchId) => {
    const branch = branches.find((c) => c.id === branchId);
    if (branch) {
      navigate(`/update-branch/${branchId}`, { state: { branch } });
    } else {
      console.error(`Branch with ID ${branchId} not found.`);
      toast.error(`Branch with ID ${branchId} not found.`);
    }
  };

  const handleDelete = async (branchId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this branch?");
    if (confirmDelete) {
      try {
        const response = await deleteBranches(branchId);
        const data = await response.json();
        if (response.ok) {
          setBranches(branches.filter((branch) => branch.id !== branchId));
          toast.success("Branch deleted successfully.");
        } else {
          console.error("Failed to delete branch:", data.error || "Error deleting branch");
          toast.error(`Failed to delete branch: ${data.error || "Error deleting branch"}`);
        }
      } catch (error) {
        toast.error("Error deleting branch:", error);
        console.error("Error deleting branch:", error);
      }
    }
  };

  const branchHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "Warehouse", key: "default_warehouse", sortable: true },
    { label: "Location", key: "location", sortable: true },
    { label: "Languages", key: "languages_formatted", sortable: false },
    { label: "Currencies", key: "currencies_formatted", sortable: false },
    { label: "Return & Exchange Policy", key: "return_and_exchange_policy", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const branchData = filteredBranches.map((branch, index) => ({
    serial_no: index + 1,
    company: branch.company || "N/A", // Adjust based on your API response structure
    default_warehouse: branch.default_warehouse || "N/A", // Adjust based on your API response structure
    location: branch.location || "N/A",
    languages_formatted: branch.languages
      ? branch.languages.map((lang) => `${lang.name} (${lang.code})`).join(", ")
      : "N/A",
    currencies_formatted: branch.currencies
      ? branch.currencies.map((curr) => `${curr.name} (${curr.code})`).join(", ")
      : "N/A",
    return_and_exchange_policy: branch.return_and_exchange_policy || "N/A",
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleUpdate(branch.id)}
          className="inline-flex items-center px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          onClick={() => handleDelete(branch.id)}
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="branch-page">
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
      <h1 className="page-title">Branch Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Branch"}
        onButtonClick={() => {
          navigate(`/add-branch`);
        }}
      />
      {isLoading ? (
        <p>Loading branches...</p>
      ) : (
        <ReusableTable headers={branchHeaders} data={branchData} />
      )}
    </div>
  );
};

export default BranchPage;