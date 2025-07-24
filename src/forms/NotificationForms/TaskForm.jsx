import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getUsers } from "/src/APIs/UserAPIs";
import { postNotifications } from "/src/APIs/NotificationAPIs";
import { toast } from "react-toastify";

const TaskForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.task || {};
  const [task, setTasks] = useState({
    _from: user.id,
    _to : null,
    details: "",
    company: user.company,
    branch: user.branch || '',
    warehouse: user.warehouse || '',
    priority_level: 1,
    date: ""
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
    setTasks(prev => ({...prev, [name]:value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await postNotifications("tasks", task, mode === "edit" ? existingData.id : null);
      
      if (response.id) {
        setSuccess(mode === "add" ? "Task added successfully!" : "Task updated successfully!");
        toast.success(mode === "add" ? "Task added successfully!" : "Task updated successfully!");
        
        setTimeout(() => navigate("/tasks"), 1500);
      } else {
        const data = await response;
        setError(data.details || "Failed to process Task. Please check your inputs.");
      }
    } catch (err) {
      toast.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Task" : "Edit Task"}</h2>
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>To:</label>
          <select
            name="_to"
            value={task._to}
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
        
        <div className="form-group">
          <label>Details:</label>
          <textarea
            name="details"
            value={task.details}
            onChange={handleChange}
            className="form-input"
          ></textarea>
        </div>

        
        
        <div className="form-group">
          <label>
            Priority Level: <strong>{task.priority_level}</strong>
          </label>
          <input
            type="range"
            name="priority_level"
            min={1}
            max={10}
            value={task.priority_level}
            onChange={handleChange}
            style={{
              background: `linear-gradient(to right, green, red ${task.priority_level * 10}%)`
            }}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            Due Date:
          </label>
          <input
            type="date"
            name="date"
            value={task.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>


        


        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Task" : "Update Task"}
        </button>
      </form>
    </div>
  );
};

TaskForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default TaskForm;
