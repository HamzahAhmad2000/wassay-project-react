 import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { postShifts } from "/src/APIs/UserAPIs"; // Assuming update API exists
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { toast } from "react-toastify";

const ShiftForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.shift || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  const [company, setCompany] = useState(existingData?.company || user.company || "");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [timeIn, setTimeIn] = useState(existingData?.time_in || "");
  const [timeOut, setTimeOut] = useState(existingData?.time_out || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    async function getCompaniesViaApi() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setError("Unable to load companies. Please try again later.");
      }
    }
    getCompaniesViaApi();
  }, []);

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
    if (!company) {
      setError("Company is required.");
      return false;
    }
    if (!timeIn) {
      setError("Time In is required.");
      return false;
    }
    if (!timeOut) {
      setError("Time Out is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body = {
      company,
      time_out: timeOut,
      time_in: timeIn,
    };

    try {
      let response;
      if (mode === "add") {
        response = await postShifts(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postShifts(body, existingData.id);
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(mode === "add" ? "Shift added successfully!" : "Shift updated successfully!"); 
        setSuccess(mode === "add" ? "Shift added successfully!" : "Shift updated successfully!");
        setTimeout(() => navigate("/shifts"), 1500); // Auto-redirect
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Shift. Please check your inputs.");
        toast.error(data.detail || "Failed to process Shift. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Shift" : "Edit Shift"}</h2>
      <form className="company-form" onSubmit={handleSubmit}>
        {/* Auto Selected form the creator */}
        {user && !user.company && (
          <div className="form-group">
            <label>Company:</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="form-input"
              >
              <option value="" disabled>
                Select a Company
              </option>
              {companyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          )}

        <div className="form-group">
          <label>Time In:</label>
          <input
            type="time"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Time Out:</label>
          <input
            type="time"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            className="form-input"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Shift" : "Update Shift"}
        </button>
      </form>
    </div>
  );
};

ShiftForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ShiftForm;
