import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postAdvanceSalaries, getUsers } from "/src/APIs/UserAPIs"; // Assuming this API exists
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const AdvanceSalaryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.AdvanceSalary || {};

  const [staff, setStaff] = useState([]);
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [formData, setFormData] = useState({
    company: existingData.company || user.company.id || "",
    branch: existingData.branch || user.branch.id || "",
    staff: existingData.staff?.id || "",
    date: existingData.date || new Date().toISOString().split("T")[0],
    advance_amount_in_cash: existingData.advance_amount_in_cash || 0,
    advance_amount_in_bank: existingData.advance_amount_in_bank || 0,
    adjusted: existingData.adjusted || false,
    recorded_by: existingData.recorded_by || user.id
  })

  const handleChange = (e)=>{
    const {name, value} = e.target
    setFormData((prev) => ({...prev, [name]: value}))
  }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          // Fetch staff options here if not fetched already
          getUsers().then((response) => {
            setStaff(response);
          })
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(()=>{
    setFormData((prev) => ({...prev, total_amount: parseFloat(formData.advance_amount_in_bank)+parseFloat(formData.advance_amount_in_cash)}))
  }, [formData.advance_amount_in_bank, formData.advance_amount_in_cash])

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!formData.staff) {
      setError("Staff is required.");
      toast.error("Staff is required.");
      return false;
    }
    if (!formData.advance_amount_in_bank && !formData.advance_amount_in_cash) {
      setError("AdvanceSalary Amount is required.");
      toast.error("AdvanceSalary Amount is required.");
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postAdvanceSalaries(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postAdvanceSalaries(formData, existingData.id);
      }

      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Advance Salary added successfully!" : "Advance Salary updated successfully!");
        toast.success(mode === "add" ? "Advance Salary added successfully!" : "Advance Salary updated successfully!");
        setTimeout(() => navigate("/advance-salaries"), 1500); // Auto-redirect
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process AdvanceSalary. Please check your inputs.");
        toast.error(data.detail || "Failed to process AdvanceSalary. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add AdvanceSalary" : "Edit AdvanceSalary"}</h2>
      <form className="advanceSalary-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Staff ID:</label>
          <select
            value={formData.staff}
            name="staff"
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Staff</option>
            {staff.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.user_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        

        <div className="form-group">
          <label>Advance Salary Amount (cash):</label>
          <input
            type="number"
            value={formData.advance_amount_in_cash || 0}
            name="advance_amount_in_cash"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Advance Salary Amount (bank):</label>
          <input
            type="number"
            value={formData.advance_amount_in_bank || 0}
            name="advance_amount_in_bank"
            onChange={handleChange}
            className="form-input"
          />
        </div>

        
        <div className="form-group">
          <label>Total Amount:</label>
          <input
            name="total_amount"
            type="number"
            value={formData.total_amount || 0}
            disabled
            className="form-input"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Advance Salary" : "Update Advance Salary"}
        </button>
      </form>
    </div>
  );
};

AdvanceSalaryForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AdvanceSalaryForm;
