import { useCallback } from "react";
import { getAdvanceSalaries, deleteAdvanceSalaries } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { toast } from "react-toastify";

const AdvanceSalaryPage = () => {
  const navigate = useNavigate();

  // Fetch advanceSalaries using the custom hook
  const fetchAdvanceSalariesData = useCallback(async () => {
    const response = await getAdvanceSalaries();
    return response;
  }, []);

  const { data: advanceSalaries, isLoading, searchTerm, setSearchTerm, setData: setAdvanceSalaries } = useFetchAndFilter(
    fetchAdvanceSalariesData,
    'advanceSalaries'
    // Add a filter function here if needed, e.g., filter by staff name
    // (AdvanceSalary) => AdvanceSalary.staff?.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = (AdvanceSalaryId) => {
    const AdvanceSalary = advanceSalaries.find((c) => c.id === AdvanceSalaryId);
    if (AdvanceSalary) {
      navigate(`/update-Advance-salary`, { state: { AdvanceSalary } });
    } else {
      toast.error(`AdvanceSalary with ID ${AdvanceSalaryId} not found.`);
    }
  };

  const handleDeleteAdvanceSalary = (AdvanceSalaryId) => {
    handleDelete(AdvanceSalaryId, deleteAdvanceSalaries, setAdvanceSalaries, 'AdvanceSalary', () => {
      toast.success("AdvanceSalary deleted successfully.");
    });
  };

  const AdvanceSalaryHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Employee", key: "employee_name", sortable: true, render: (AdvanceSalary) => AdvanceSalary.staff?.user_name || "N/A" },
    { label: "Advance Salary Paid", key: "total_amount", sortable: true, render: (AdvanceSalary) => parseFloat(AdvanceSalary.total_amount) || "0" },
    { label: "Advance Salary Paid in Cash", key: "advance_amount_in_cash", sortable: true, render: (AdvanceSalary) => parseFloat(AdvanceSalary.advance_amount_in_cash) || "0" },
    { label: "AdvanceSalary Paid in Bank", key: "advance_amount_in_bank", sortable: true, render: (AdvanceSalary) => parseFloat(AdvanceSalary.advance_amount_in_bank) || "0" },
    { label: "Adjusted", key: "adjusted", sortable: true, render: (AdvanceSalary) => AdvanceSalary.adjusted ? "YES" : "NO" },
    // { label: "Commission", key: "commission", sortable: true, render: (AdvanceSalary) => AdvanceSalary.commission?.id || null },
    { label: "Date", key: "date", sortable: true, render: (AdvanceSalary) => AdvanceSalary.date || "N/A" },
    // { label: "Deduction", key: "deduction", sortable: true, render: (AdvanceSalary) => AdvanceSalary.deduction || "0" },
    // { label: "Net AdvanceSalary", key: "net_AdvanceSalary", sortable: true, render: (AdvanceSalary) => AdvanceSalary.net_AdvanceSalary || "0" },
    { label: "Actions", key: "actions" },
  ];

  const AdvanceSalaryData = advanceSalaries.map((AdvanceSalary, index) => ({
    serial_no: index + 1,
    ...AdvanceSalary, // Spread AdvanceSalary properties
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(AdvanceSalary.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDeleteAdvanceSalary(AdvanceSalary.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="AdvanceSalary-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Advance Salary Details</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Optional Search Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search advanceSalaries..."
          // buttonText="" // Hide button if only using Link
          // onButtonClick={() => {}}
        />
        <Link to="/add-Advance-salary">
          <button className="action-button add-button ml-4">Add Advance Salary</button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading advance Salaries...</p>
      ) : advanceSalaries.length === 0 ? (
        <p className="text-gray-500">No advance Salaries found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={AdvanceSalaryHeaders} data={AdvanceSalaryData} />
        </div>
      )}
    </div>
  );
};

export default AdvanceSalaryPage;