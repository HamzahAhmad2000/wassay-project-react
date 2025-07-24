import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getUsers } from "/src/APIs/UserAPIs";
import { postNotifications } from "/src/APIs/NotificationAPIs";
import { toast } from "react-toastify";

const WarningForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.category || {};
  const [warning, setWarning] = useState({
    _from: user.id,
    details: "",
    _to : null,
    company: user.company,
    branch: user.branch || '',
    warehouse: user.warehouse || '',
    violation_level: 1
  })
  const [users, setUsers] = useState([])
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (error && error !="")
    toast.error(error)
  }, [error])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(); // Fetch root Users
        setUsers(data);
      } catch (err) {
        console.error("Failed _to fetch Users:", err);
        setError("Unable _to load Users. Please try again later.");
      }
    }
    fetchUsers();
  }, []);

  const handleChange = (e)=>{
    const {name, value} = e.target
    setWarning(prev => ({...prev, [name]:value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await postNotifications("warnings", warning, mode === "edit" ? existingData.id : null);
      
      if (response.id) {
        setSuccess(mode === "add" ? "Warning added successfully!" : "Warning updated successfully!");
        toast.success(mode === "add" ? "Warning added successfully!" : "Warning updated successfully!");
        
        setTimeout(() => navigate("/warnings"), 1500);
      } else {
        const data = await response;
        setError(data.details || "Failed to process Warning. Please check your inputs.");
      }
    } catch (err) {
      toast.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Warning" : "Edit Warning"}</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>To:</label>
          <select
            name="_to"
            value={warning._to}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Responsible Person</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                 {user.user_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Details:</label>
          <textarea
            name="details"
            value={warning.details}
            onChange={handleChange}
            className="form-input"
          ></textarea>
        </div>

        
        <div className="form-group">
          <label>
            Violation Level: <strong>{warning.violation_level}</strong>
          </label>
          <input
            type="range"
            name="violation_level"
            min={1}
            max={10}
            value={warning.violation_level}
            onChange={handleChange}
            style={{
              background: `linear-gradient(to right, green, red ${warning.violation_level * 10}%)`
            }}
            className="form-input"
          />
        </div>


        


        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Warning" : "Update Warning"}
        </button>
      </form>
    </div>
  );
};

WarningForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default WarningForm;
