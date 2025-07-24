import { useCallback } from "react";
import { getShifts, deleteShifts } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { toast } from "react-toastify";

const ShiftPage = () => {
  const navigate = useNavigate();

  // Fetch shifts using the custom hook
  const fetchShiftsData = useCallback(async () => {
    const response = await getShifts();
    return response;
  }, []);

  const { data: shifts, isLoading, searchTerm, setSearchTerm, setData: setShifts } = useFetchAndFilter(
    fetchShiftsData,
    'shifts'
  );

  const handleUpdate = (shiftId) => {
    const shift = shifts.find((c) => c.id === shiftId);
    if (shift) {
      navigate(`/update-shift/${shiftId}`, { state: { shift } });
    } else {
      toast.error(`Shift with ID ${shiftId} not found.`);
    }
  };

  const handleDeleteShift = (shiftId) => {
    handleDelete(shiftId, deleteShifts, setShifts, 'shift', () => {
      toast.success("Shift deleted successfully.");
    });
  };

  const shiftHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true }, // Assuming 'company' holds the name/ID
    { label: "Time In", key: "time_in", sortable: true },
    { label: "Time Out", key: "time_out", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const shiftData = shifts.map((shift, index) => ({
    serial_no: index + 1,
    ...shift, // Spread shift properties
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(shift.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDeleteShift(shift.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="shift-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Shift Details</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Optional Search Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search shifts..."
          // buttonText="" // Hide button if only using Link
          // onButtonClick={() => {}}
        />
        <Link to="/add-shift">
          <button className="action-button add-button ml-4">Add Shift</button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading shifts...</p>
      ) : shifts.length === 0 ? (
        <p className="text-gray-500">No shifts found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={shiftHeaders} data={shiftData} />
        </div>
      )}
    </div>
  );
};

export default ShiftPage;