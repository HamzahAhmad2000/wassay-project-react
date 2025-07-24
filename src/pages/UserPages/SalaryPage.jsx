import { useCallback } from "react";
import { getSalaries, deleteSalaries } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { toast } from "react-toastify";

const SalaryPage = () => {
  const navigate = useNavigate();

  // Fetch salaries using the custom hook
  const fetchSalariesData = useCallback(async () => {
    const response = await getSalaries();
    return response;
  }, []);

  const { data: salaries, isLoading, searchTerm, setSearchTerm, setData: setSalaries } = useFetchAndFilter(
    fetchSalariesData,
    'salaries'
    // Add a filter function here if needed, e.g., filter by staff name
    // (salary) => salary.staff?.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = (salaryId) => {
    const salary = salaries.find((c) => c.id === salaryId);
    if (salary) {
      navigate(`/update-salary/${salaryId}`, { state: { salary } });
    } else {
      toast.error(`Salary with ID ${salaryId} not found.`);
    }
  };

  const handleDeleteSalary = (salaryId) => {
    handleDelete(salaryId, deleteSalaries, setSalaries, 'salary', () => {
      toast.success("Salary deleted successfully.");
    });
  };

  const salaryHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Employee", key: "employee_name", sortable: true, render: (salary) => salary.staff?.user_name || "N/A" },
    { label: "Base Salary", key: "salary_amount", sortable: true, render: (salary) => parseFloat(salary.staff.base_salary) || "0" },
    { label: "Salary Paid in Cash", key: "salary_amount_in_cash", sortable: true, render: (salary) => parseFloat(salary.salary_amount_in_bank) || "0" },
    { label: "Salary Paid in Bank", key: "salary_amount_in_bank", sortable: true, render: (salary) => parseFloat(salary.salary_amount_in_bank) || "0" },
    { label: "Advance", key: "advance.total_amount", sortable: true, render: (salary) => salary.advance?.total_amount || "0" },
    // { label: "Commission", key: "commission", sortable: true, render: (salary) => salary.commission?.id || null },
    { label: "Bonus", key: "bonus", sortable: true, render: (salary) => salary.bonus || "0" },
    { label: "Deduction", key: "deduction", sortable: true, render: (salary) => salary.deduction || "0" },
    { label: "Net Salary", key: "net_salary", sortable: true, render: (salary) => salary.net_salary || "0" },
    { label: "Actions", key: "actions" },
  ];

  const salaryData = salaries.map((salary, index) => ({
    serial_no: index + 1,
    ...salary, // Spread salary properties
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(salary.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDeleteSalary(salary.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="salary-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Salary Details</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Optional Search Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search salaries..."
          // buttonText="" // Hide button if only using Link
          // onButtonClick={() => {}}
        />
        <Link to="/add-salary">
          <button className="action-button add-button ml-4">Add Salary</button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading salaries...</p>
      ) : salaries.length === 0 ? (
        <p className="text-gray-500">No salaries found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={salaryHeaders} data={salaryData} />
        </div>
      )}
    </div>
  );
};

export default SalaryPage;