import { useEffect, useState } from "react";
import { deleteProfit, getProfit } from "/src/APIs/CompanyAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReusableTable from "../../components/ReusableTable"; // Import ReusableTable
import { Pencil, Trash2 } from "lucide-react"; // Import Lucide icons
import ImageModal from "/src/components/ImageModal";
import { Button } from "../../additionalOriginuiComponents/ui/button";

const ProfitPage = () => {
  const navigate = useNavigate();
  const [Profits, setProfits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProfits, setFilteredProfits] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null)
  useEffect(() => {
    fetchProfits();
  }, []);

  const fetchProfits = async () => {
    try {
      const ProfitsData = await getProfit();
      setProfits(ProfitsData);
      setFilteredProfits(ProfitsData);
    } catch (error) {
      toast.error("Failed to load Profits. Please refresh the page", error);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = Profits;
    if (searchTerm) {
      filtered = filtered.filter((profit) =>
        Object.keys(profit).some((key) => {
          const value = profit[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredProfits(filtered);
  }, [searchTerm, Profits]);

  const handleUpdate = (profitId) => {
    const profit = Profits.find((c) => c.id === profitId);
    if (profit) {
      navigate(`/update-profit/${profitId}`, { state: { profit } });
    } else {
      toast.error(`profit with ID ${profitId} not found`);
    }
  };

  const handleDelete = async (profitId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this profit?");
    if (!confirmDelete) {
      toast.info("Delete action canceled");
      return;
    }

    try {
      const response = await deleteProfit(profitId);
      const data = await response;

      if (data.success) {
        toast.success(data.message || "profit deleted successfully!");
        await fetchProfits(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete the profit. Please try again");
      }
    } catch (err) {
      console.error("Error deleting profit:", err);
      toast.error("An error occurred while deleting the profit. Please try again");
    }
  };

  const profitHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "Branch", key: "branch", sortable: false }, // Custom rendering
    { label: "Taken By", key: "taken_by", sortable: true },
    { label: "Cash", key: "amount_in_cash", sortable: true },
    { label: "Bank", key: "amount_from_bank", sortable: true },
    { label: "Note", key: "note", sortable: false },
    { label: "Image", key: "image", sortable: false },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const profitData = filteredProfits.map((profit, index) => ({
    serial_no: index + 1,
    company: profit.company.name || "N/A",
    branch: profit.branch.location || "N/A",
    taken_by: profit.taken_by.user_name || "N/A",
    amount_in_cash: profit.amount_in_cash || 0.0,
    amount_from_bank: profit.amount_from_bank || 0.0,
    note: profit.note || "N/A",
    image: profit.image ? (
      <img
        src={`${profit.image}`}
        alt="Bill"
        className="h-12 w-12 object-cover rounded cursor-pointer"
        onClick={() => setSelectedImage(`${profit.image}`)}
      />
    ) : (
      "N/A"
    ),
    
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => handleUpdate(profit.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(profit.id)}
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

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">profit Details</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Take Profit Out"}
        onButtonClick={() => {
          navigate(`/add-profit-log`);
        }}
      />
      <ReusableTable headers={profitHeaders} data={profitData} />
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        altText='profitLog image'
        onClose={() => setSelectedImage(null)}
      />
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

export default ProfitPage;