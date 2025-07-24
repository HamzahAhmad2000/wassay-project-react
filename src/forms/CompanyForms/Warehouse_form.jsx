// WarehouseForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, postWarehouses } from "/src/APIs/CompanyAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WarehouseForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.warehouse || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser")); 
  const [company, setCompany] = useState(existingData?.company_id || user.company || "");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [location, setLocation] = useState(existingData?.location || "");
  const [address, setAddress] = useState(existingData?.address || "");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  useEffect(() => {
    async function getCompaniesViaApi() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies);
      } catch (err) {
        toast.error(err || "Failed to load companies. Please refresh the page");
      }
    }
    getCompaniesViaApi();
  }, []);

  const validateForm = () => {
    if (!company) {
      toast.error("Please select a company");
      return false;
    }
    if (!location) {
      toast.error("Warehouse location is required");
      return false;
    }
    if (!address) {
      toast.error("Warehouse address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const body = {
      company: company,
      address: address,
      location: location,
    };

    try {
      let response;
      if (mode === 'add') {
        response = await postWarehouses(body);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postWarehouses(body, existingData.id);
      }

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 
          (mode === "add" ? "Warehouse added successfully!" : "Warehouse updated successfully!"));
        if (mode === "add") {
          setCompany("");
          setAddress("");
          setLocation("");
        }
        setTimeout(() => navigate("/warehouses"), 1500);
      } else {
        toast.error(data.error || 
          (mode === "add" ? "Failed to add warehouse" : "Failed to update warehouse"));
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
  <h2 className="form-heading">{mode === "add" ? "Add Warehouse" : "Edit Warehouse"}</h2>
  <form className="company-form" onSubmit={handleSubmit}>
    {user && user.is_superuser && (

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
      <label>Location:</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="latitude, longitude"
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label>Address:</label>
      <textarea
        rows="3"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="form-input"
      />
    </div>


    <button type="submit" className="submit-button">
      {mode === "add" ? "Add Warehouse" : "Update Warehouse"}
    </button>
  </form>
</div>

  );
};

WarehouseForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default WarehouseForm;
