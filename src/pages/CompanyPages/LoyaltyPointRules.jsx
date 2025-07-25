import { useEffect, useState } from "react";
import { deleteLPR, getLPR } from "/src/APIs/CompanyAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReusableTable from "../../components/ReusableTable"; // Import ReusableTable
import { Pencil, Trash2 } from "lucide-react"; // Import Lucide icons
import { Button } from "../../additionalOriginuiComponents/ui/button";

const LPRPage = () => {
  const navigate = useNavigate();
  const [loyaltyPointRules, setLPR] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLPR, setFilteredLPR] = useState([]);

  useEffect(() => {
    fetchLPR();
  }, []);

  const fetchLPR = async () => {
    try {
      const loyaltyPointRulesData = await getLPR();
      setLPR(loyaltyPointRulesData);
      setFilteredLPR(loyaltyPointRulesData);
    } catch (error) {
      toast.error("Failed to load loyaltyPointRules. Please refresh the page", error);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = loyaltyPointRules;
    if (searchTerm) {
      filtered = filtered.filter((LPR) =>
        Object.keys(LPR).some((key) => {
          const value = LPR[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredLPR(filtered);
  }, [searchTerm, loyaltyPointRules]);

  const handleUpdate = (LPRId) => {
    const LPR = loyaltyPointRules.find((c) => c.id === LPRId);
    if (LPR) {
      navigate(`/update-LPR/${LPRId}`, { state: { LPR } });
    } else {
      toast.error(`Company with ID ${LPRId} not found`);
    }
  };

  const handleDelete = async (LPRId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this LPR?");
    if (!confirmDelete) {
      toast.info("Delete action canceled");
      return;
    }

    try {
      const response = await deleteLPR(LPRId);
      const data = await response;

      if (data.success) {
        toast.success(data.message || "LPR deleted successfully!");
        await fetchLPR(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete the LPR. Please try again");
      }
    } catch (err) {
      console.error("Error deleting LPR:", err);
      toast.error("An error occurred while deleting the LPR. Please try again");
    }
  };

  const LPRHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "For 1000 RP you get", key: "for_every_1000_LP_CB", sortable: true },
    { label: "For every 1000 spend you get", key: "for_every_1000_spend_LP", sortable: true },
    { label: "Max Discount", key: "max_discount", sortable: true },
    { label: "Expires After", key: "expire_after", sortable: true },
    { label: "Signup Bonus", key: "sign_up_bonus", sortable: true },
    { label: "Birthday Discount", key: "birthday_discount", sortable: true },
    { label: "Flash Sale Discount", key: "flash_sale_discount", sortable: true },
    { label: "Milestone Gift Amount", key: "milestone_gift_amount", sortable: true },
    { label: "Milestone Purchase Count", key: "milestone_purchase_count", sortable: true },
    { label: "Milestone Spend Amount", key: "milestone_spend_amount", sortable: true },
    { label: "Monthly Purchase Milestone", key: "monthly_purchase_milestone", sortable: true },
    { label: "Monthly Purchase Milestone Points", key: "monthly_purchase_milestone_points", sortable: true },
    { label: "Yearly Purchase Milestone", key: "yearly_purchase_milestone", sortable: true },
    { label: "yearly Purchase Milestone Points", key: "yearly_purchase_milestone_points", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const LPRData = filteredLPR.map((LPR, index) => ({
    serial_no: index + 1,
    company: LPR.company,
    for_every_1000_LP_CB: LPR.for_every_1000_LP_CB || "N/A",
    for_every_1000_spend_LP: LPR.for_every_1000_spend_LP || "N/A",
    max_discount: LPR.max_discount || "N/A",
    expire_after: LPR.expire_after || "N/A",
    sign_up_bonus: LPR.sign_up_bonus || "N/A",
    birthday_discount: LPR.birthday_discount || "N/A",
    flash_sale_discount: LPR.flash_sale_discount || "N/A",
    milestone_gift_amount: LPR.milestone_gift_amount || "N/A",
    milestone_purchase_count: LPR.milestone_purchase_count || "N/A",
    milestone_spend_amount: LPR.milestone_spend_amount || "N/A",
    monthly_purchase_milestone: LPR.monthly_purchase_milestone || "N/A",
    monthly_purchase_milestone_points: LPR.monthly_purchase_milestone_points || "N/A",
    yearly_purchase_milestone: LPR.yearly_purchase_milestone || "N/A",
    yearly_purchase_milestone_points: LPR.yearly_purchase_milestone_points || "N/A",
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => handleUpdate(LPR.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(LPR.id)}
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
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Royalty Point Rules</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Royalty Point Rules"}
        onButtonClick={() => {
          navigate(`/add-LPR`);
        }}
      />
      <ReusableTable headers={LPRHeaders} data={LPRData} />
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

export default LPRPage;