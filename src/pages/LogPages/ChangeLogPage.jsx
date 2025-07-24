import { useEffect, useState } from "react";
import { getChangeLogs } from "/src/APIs/LogsAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";

const ChangeLogPage = () => {
  const navigate = useNavigate();
  const [changeLogs, setChangeLogs] = useState([]); // All changeLogs
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [filteredChangeLogs, setFilteredChangeLogs] = useState([]); // Filtered changeLogs

  useEffect(() => {
    getChangeLogs()
      .then((changeLogs) => {
        setChangeLogs(changeLogs);
        setFilteredChangeLogs(changeLogs); // Initially, all changeLogs are shown
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching changeLogs:", error);
        alert("Failed to load changeLogs. Please try again.");
        setIsLoading(false);
      });
  }, []);

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = changeLogs;
    if (searchTerm) {
      filtered = filtered.filter((changeLog) =>
        Object.keys(changeLog).some((key) => {
          const value = changeLog[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    
    setFilteredChangeLogs(filtered);
  }, [searchTerm, changeLogs]);

  const handleUpdate = (changeLogId) => {
    const changeLog = changeLogs.find((c) => c.id === changeLogId);
    if (changeLog) {
      navigate(`/update-changeLog/${changeLogId}`, { state: { changeLog } });
    } else {
      console.error(`Change Log with ID ${changeLogId} not found.`);
    }
  };

  return (
    <div className="changeLog-page">
      <h1 className="page-title">Change Log Details</h1>

      {/* Search & Filter Section */}
      <div className="filter-section mb-4 flex items-center justify-between px-4">
        {/* Search Input (Centered) */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="Search changeLogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Add Change Log Button (Right Aligned) */}
        <Link to="/add-changeLog">
          <button className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
            Add Change Log
          </button>
        </Link>
      </div>

      {isLoading ? (
        <p>Loading changeLogs...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Model</th>
              <th>ID</th>
              <th>Action</th>
              <th>user</th>
              <th>Current State</th>
              <th>Previous State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChangeLogs.map((changeLog, index) => (
              <tr key={changeLog.id}>
                <td>{index + 1}</td>
                <td>{changeLog.model_name}</td>
                <td>{changeLog.object_id}</td>
                <td>{changeLog.action}</td>
                <td>{changeLog.user || "unknown"}</td>
                <td>{JSON.stringify(changeLog.current_state)}</td>
                <td>{JSON.stringify(changeLog.previous_state)}</td>
                <td>
                  <button className="action-button update-button" onClick={() => handleUpdate(changeLog.id)}>
                    See Changes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChangeLogPage;
