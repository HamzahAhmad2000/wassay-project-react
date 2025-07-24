import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getUsers } from "/src/APIs/UserAPIs";
import { postNotifications } from "/src/APIs/NotificationAPIs";

const AlertForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.category || {};
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    to : null,
    company: user.company,
    branch: user.branch
  })
  const [users, setUsers] = useState([])
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(); // Fetch root Users
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch Users:", err);
        setError("Unable to load Users. Please try again later.");
      }
    }
    fetchUsers();
  }, []);

  const handleChange = (e)=>{
    const {name, value} = e.target
    setAlert(prev => ({...prev, [name]:value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await postNotifications("issues", alert, mode === "edit" ? existingData.id : null);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Alert added successfully!" : "Alert updated successfully!");
        setTimeout(() => navigate("/categories"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Alert. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Alert" : "Edit Alert"}</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            name="title"
            value={alert.title}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={alert.description}
            onChange={handleChange}
            className="form-input"
          ></textarea>
        </div>

        <div className="form-group">
          <label>To:</label>
          <select
            name="to"
            value={alert.to}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Responsible Person</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.role || ""} - {user.user_name}
              </option>
            ))}
          </select>
        </div>


        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Alert" : "Update Alert"}
        </button>
      </form>
    </div>
  );
};

AlertForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AlertForm;
