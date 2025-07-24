import { useCallback } from "react";
import { getAttendance, deleteAttendance } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { formatDate, formatTime } from "../../utils/dateUtils"; // Assuming you have date/time utility functions
import { toast } from "react-toastify";

const AttendancePage = () => {
  const navigate = useNavigate();

  // Fetch attendance using the custom hook
  const fetchAttendanceData = useCallback(async () => {
    const response = await getAttendance();
    return response;
  }, []);

  const { data: attendances, isLoading, searchTerm, setSearchTerm, setData: setAttendance } = useFetchAndFilter(
    fetchAttendanceData,
    'attendances',
    // Optional filter function (e.g., filter by employee name)
    (attendance) => attendance.staff?.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = (attendanceId) => {
    const attendance = attendances.find((c) => c.id === attendanceId);
    if (attendance) {
      navigate(`/update-attendance/${attendanceId}`, { state: { attendance } });
    } else {
      toast.error(`Attendance with ID ${attendanceId} not found.`);
    }
  };

  const handleDeleteAttendance = (attendanceId) => {
    handleDelete(attendanceId, deleteAttendance, setAttendance, 'attendance', () => {
      toast.success("Attendance record deleted successfully.");
    });
  };

  const attendanceHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Employee", key: "employee_name", sortable: true, render: (att) => att.staff?.user_name || "N/A" },
    { label: "Date", key: "date", sortable: true, render: (att) => formatDate(att.date) || "N/A" },
    { label: "Status", key: "status", sortable: true },
    
  // --- CORRECTED Time-In ---
  {
    label: "Time-In (Approx)",
    key: "created_at",
    sortable: true,
    render: (att) => {
      const formatted = formatTime(att.created_at); // Get formatted time
      // Combine formatted time and raw time_in if available
      return (formatted && formatted !== "N/A" && att.time_in)
             ? `${formatted} (${att.time_in})` // Use template literal
             : formatted || "N/A"; // Otherwise, just show formatted time or N/A
    }
  },
  // --- CORRECTED Time-Out ---
  {
    label: "Time-Out (Approx)",
    key: "updated_at",
    sortable: true,
    render: (att) => {
      const formatted = formatTime(att.updated_at); // Get formatted time
      // Combine formatted time and raw time_out if available
      return (formatted && formatted !== "N/A" && att.time_out)
             ? `${formatted} (${att.time_out})` // Use template literal
             : formatted || "N/A"; // Otherwise, just show formatted time or N/A
    }
  },

  
    // { label: "Actions", key: "actions" },
  ];

  const attendanceData = attendances.map((attendance, index) => ({
    serial_no: index + 1,
    ...attendance, // Spread attendance properties
    // actions: (
    //   <div>
    //     <button
    //       className="action-button update-button mr-2"
    //       onClick={() => handleUpdate(attendance.id)}
    //     >
    //       Update
    //     </button>
    //     <button
    //       className="action-button delete-button"
    //       onClick={() => handleDeleteAttendance(attendance.id)}
    //     >
    //       Delete
    //     </button>
    //   </div>
    // ),
  }));

  return (
    <div className="attendance-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Attendance Details</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Optional Search Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search attendance..."
          // Hide the button part if not needed
          // buttonText=""
          // onButtonClick={() => {}}
        />
        {/* The "Add Attendance" button was commented out in the original, kept it that way */}
        {/* <Link to="/add-attendance">
             <button className="action-button add-button ml-4">Add Attendance</button>
           </Link> */}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading attendance records...</p>
      ) : attendances.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={attendanceHeaders} data={attendanceData} />
        </div>
      )}
    </div>
  );
};

export default AttendancePage;