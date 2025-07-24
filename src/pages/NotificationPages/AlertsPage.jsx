import { useEffect, useState } from "react";
import { getNotifications } from "../../APIs/NotificationAPIs"; // Adjust the import path
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { toast } from "react-toastify";
import { postNotifications } from "../../APIs/NotificationAPIs"; // Adjust the import path

const AlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const fetchAlertsData = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications("issues");
      setAlerts(data);
      setFilteredAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to load alerts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = alerts;
    if (searchTerm) {
      filtered = filtered.filter((alert) =>
        Object.keys(alert).some((key) => {
          const value = alert[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredAlerts(filtered);
  }, [searchTerm, alerts]);

  const handleAlertUpdate = async (alertId, updateType) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (!alert) {
      toast.error(`Alert with ID ${alertId} not found.`);
      return;
    }

    const updatedAlert = { ...alert };

    if (updateType === "Seen") {
      updatedAlert.status = "Seen";
    } else if (updateType === "Resolved") {
      updatedAlert.resolved = true;
    }

    try {
      const response = await postNotifications("issues", updatedAlert, alertId);

      if (response.id) {
        toast.success(`Alert: ${alert.title} marked as ${updateType}`);

        // ✅ Update frontend state
        const updatedAlerts = alerts.map((a) =>
          (a.id == alertId ? { ...response } : a)
        );

        setAlerts(updatedAlerts); // make sure setAlerts is defined via useState
      }
    } catch (error) {
      toast.error(`Failed to update alert: ${error.message}`);
    }
  };

  const alertHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Title", key: "title", sortable: true },
    { label: "Description", key: "description", sortable: true },
    { label: "To", key: "to", sortable: true },
    { label: "Status", key: "status", sortable: true },
    { label: "Resolved", key: "resolved_formatted", sortable: true },
    { label: "Created At", key: "created_at_formatted", sortable: true },
    { label: "Updated At", key: "updated_at_formatted", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const alertData = filteredAlerts.map((alert, index) => ({
    serial_no: index + 1,
    title: alert.title || "N/A",
    description: alert.description || "N/A",
    to: alert.to || "N/A",
    status: alert.status || "N/A",
    resolved_formatted: alert.resolved ? "YES" : "NO",
    created_at_formatted: new Date(alert.created_at).toLocaleString(),
    updated_at_formatted: new Date(alert.updated_at).toLocaleString(),
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleAlertUpdate(alert.id, "Seen")}
        >
          Mark as Seen
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleAlertUpdate(alert.id, "Resolved")}
        >
          Mark as Resolved
        </button>
      </div>
    ),
  }));

  return (
    <div className="alert-page">
      <h1 className="page-title">Alert Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Alert"}
        // onButtonClick={() => {
        //   navigate(`/add-alert`);
        // }}
      />
      {isLoading ? (
        <p>Loading alerts...</p>
      ) : (
        <ReusableTable headers={alertHeaders} data={alertData} />
      )}
    </div>
  );
};

export default AlertPage;