import { useEffect, useState } from "react";
import { getNotifications, deleteNotifications } from "../../APIs/NotificationAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { toast } from "react-toastify";

const WarningPage = () => {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWarnings, setFilteredWarnings] = useState([]);

  useEffect(() => {
    fetchWarningsData();
  }, []);

  const fetchWarningsData = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications("warnings");
      setWarnings(data);
      setFilteredWarnings(data);
    } catch (error) {
      toast.error(`Error fetching warnings: ${error}`);
      console.error("Error fetching warnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = warnings;
    if (searchTerm) {
      filtered = filtered.filter((warning) =>
        Object.keys(warning).some((key) => {
          const value = warning[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredWarnings(filtered);
  }, [searchTerm, warnings]);

  const handleUpdate = (warningId) => {
    const warning = warnings.find((c) => c.id === warningId);
    if (warning) {
      navigate(`/update-warning/${warningId}`, { state: { warning } });
    } else {
      toast.error(`Warning with ID ${warningId} not found.`);
    }
  };

  const handleDelete = async (warningId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this warning?");
    if (confirmDelete) {
      try {
        const response = await deleteNotifications("warnings", warningId);
        if (response.ok) {
          setWarnings(warnings.filter((warning) => warning.id !== warningId));
          toast.success("Warning deleted successfully.");
        } else {
          toast.error(`Failed to delete warning: ${response.status}`);
          console.error("Failed to delete warning:", response.status);
        }
      } catch (error) {
        toast.error(`Error deleting warning: ${error}`);
        console.error("Error deleting warning:", error);
      }
    }
  };

  const warningHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "From", key: "from_name", sortable: true },
    { label: "To", key: "to_name", sortable: true },
    { label: "Description", key: "details", sortable: true },
    { label: "Violation Level", key: "violation_level", sortable: true },
    { label: "Created At", key: "created_at_formatted", sortable: true },
    { label: "Updated At", key: "updated_at_formatted", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const warningData = filteredWarnings.map((warning, index) => ({
    serial_no: index + 1,
    from_name: warning.from_name || "N/A",
    to_name: warning.to_name || "N/A",
    details: warning.details || "N/A",
    violation_level: warning.violation_level || "N/A",
    created_at_formatted: new Date(warning.created_at).toLocaleString(),
    updated_at_formatted: new Date(warning.updated_at).toLocaleString(),
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(warning.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDelete(warning.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="warning-page">
      <h1 className="page-title">Warning Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Warning"}
        onButtonClick={() => {
          navigate(`/add-warning`);
        }}
      />
      {isLoading ? (
        <p>Loading warnings...</p>
      ) : (
        <ReusableTable headers={warningHeaders} data={warningData} />
      )}
    </div>
  );
};

export default WarningPage;