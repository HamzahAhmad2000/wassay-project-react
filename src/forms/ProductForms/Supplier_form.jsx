import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postSuppliers } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";

const SupplierForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.supplier || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [name, setName] = useState(existingData?.name || "");
  const [phone_no, setPhoneNo] = useState(existingData?.phone_no || "");
  const [location, setLocation] = useState(existingData?.location || "");
  const [score, setScore] = useState(existingData?.score || "");
  const [companyId, setCompanyId] = useState(existingData?.company || user.company || "");
  const [companies, setCompanies] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        getCompanies()
          .then((data) => {
            setCompanies(data);
          })
          .catch((error) => {
            console.error("Failed to load companies:", error);
            toast.error("Failed to load companies:", error);
            setError("Failed to load companies. Please refresh the page.");
          });
      })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

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
    if (!name) {
      setError("Name is required.");
      return false;
    }

    if (!phone_no) {
      setError("Phone no is required.");
      return false;
    }
    if (!location) {
      setError("Location is required.");
      return false;
    }
    if (!score) {
      setError("Score is required.");
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
      name: name.trim(),
      phone_no: phone_no.trim(),
      location: location.trim(),
      score: parseFloat(score),
    };

    try {
      const response = mode === "add"
        ? await postSuppliers(body)
        : await postSuppliers(body, existingData.id);


      if (!response || !response.id) {
        toast.error("Invalid response from server");
        console.error("Invalid response from server");
        
        throw new Error('Invalid response from server');
      }

      if (response.id) {
        const message = `Supplier ${mode === "add" ? "added" : "updated"} successfully!`;
        setSuccess(message);
        setTimeout(() => navigate("/suppliers"), 1500);
        toast.success(`Supplier ${mode === "add" ? "added" : "updated"} successfully!`);
        setTimeout(() => navigate("/suppliers"), 1500);

      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to process Supplier");
      }
    } catch (err) {
      console.error('Supplier submission error:', err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Supplier" : "Edit Supplier"}</h2>
      <form className="company-form" onSubmit={handleSubmit}>

        {user && user.is_superuser && (
          <div className='form-group'>
            <lable>Company: </lable>
            <select
              className="form-input"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">Select Company</option>
                {companies.length > 0 && companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
          </div>
        )}
      
        <div className="form-group">
          <label>Name:</label>
          <input

            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Azhar"
          />

        </div>

        <div className="form-group">
          <label>Phone No:</label>

          <input
            type="tel"
            value={phone_no}
            onChange={(e) => setPhoneNo(e.target.value)}
            className="form-input"
            placeholder="00 92 3123456789"
          />


        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
            placeholder="RWP"
          />
        </div>

        <div className="form-group">
          <label>Score:</label>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="form-input"
            defaultValue={50}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Supplier" : "Update Supplier"}
        </button>
      </form>
    </div>
  );
};

SupplierForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default SupplierForm;
