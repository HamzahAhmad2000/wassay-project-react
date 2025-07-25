import { useEffect, useState } from "react";
import { getExpenses, deleteExpenses } from "../../APIs/CompanyAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable";
import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageModal from "/src/components/ImageModal";
import { Button } from "../../additionalOriginuiComponents/ui/button";

const ExpensePage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image


  useEffect(() => {
    fetchExpensesData();
  }, []);

  const fetchExpensesData = async () => {
    setLoading(true);
    try {
      const expensesData = await getExpenses();
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
    } catch (error) {
      toast.error("Failed to load expenses. Please refresh the page");
      setError("Failed to load expenses.");
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpenses(expenseId);
        setExpenses(expenses.filter((expense) => expense.id !== expenseId));
        setFilteredExpenses(filteredExpenses.filter((expense) => expense.id !== expenseId));
        toast.success("Expense deleted successfully.");
      } catch (error) {
        toast.error(`Failed to delete expense: ${error.message || "An error occurred"}`);
        console.error("Error deleting expense:", error);
      }
    }
  };

  useEffect(() => {
    let filtered = expenses;
    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        Object.values(expense).some((value) => {
          if (value && typeof value === "object") {
            return Object.values(value).some(
              (v) =>
                v &&
                v.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredExpenses(filtered);
  }, [searchTerm, expenses]);

  const expenseHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company_name", sortable: true },
    { label: "Branch", key: "branch_address", sortable: true },
    { label: "Category", key: "category", sortable: true },
    { label: "Amount (Cash)", key: "amount_cash", sortable: true },
    { label: "Amount (Bank)", key: "amount_bank", sortable: true },
    { label: "Bill Image", key: "bill_image", sortable: false }, // New column
    { label: "Additional Data", key: "data_in_json", sortable: false },
    { label: "Note", key: "note", sortable: true },
    { label: "Created By", key: "created_by", sortable: true },
    { label: "Created At", key: "created_at", sortable: true },
    { label: "Updated At", key: "updated_at", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const expenseData = filteredExpenses.map((expense, index) => ({
    serial_no: index + 1,
    company_name: expense.company_name || "N/A",
    branch_address: expense.branch_address || "N/A",
    category: expense.category || "N/A",
    amount_cash: expense.amount_cash !== null ? `$${expense.amount_cash.toFixed(2)}` : "N/A",
    amount_bank: expense.amount_bank !== null ? `$${expense.amount_bank.toFixed(2)}` : "N/A",
    bill_image: expense.bill_image ? (
      <img
        src={`${expense.bill_image}`}
        alt="Bill"
        className="h-12 w-12 object-cover rounded cursor-pointer"
        onClick={() => setSelectedImage(`${expense.bill_image}`)}
      />
    ) : (
      "N/A"
    ),
    data_in_json: expense.data_in_json ? (
      <ul className="list-disc pl-4 text-sm text-gray-700">
        {Object.entries(expense.data_in_json).map(([key, value], idx) => (
          <li key={idx} className="flex gap-2">
            <span className="font-semibold text-blue-600">{key}:</span>
            <span>{value.toString()}</span>
          </li>
        ))}
      </ul>
    ) : (
      "N/A"
    ),
    note: expense.note || "N/A",
    created_by: expense.created_by || "N/A",
    created_at: expense.created_at
      ? new Date(expense.created_at).toLocaleString()
      : "N/A",
    updated_at: expense.updated_at
      ? new Date(expense.updated_at).toLocaleString()
      : "N/A",
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => navigate(`/update-expense`, { state: { expense } })}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(expense.id)}
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

  if (loading) return <div className="text-center mt-4">Loading expenses...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Expense Details</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Expense"}
        onButtonClick={() => {
          navigate(`/add-expense`);
        }}
      />
      <ReusableTable headers={expenseHeaders} data={expenseData} />
      
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        altText="Enlarged Bill" // You can make this dynamic if needed
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

export default ExpensePage;