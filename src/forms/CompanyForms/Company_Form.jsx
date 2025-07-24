// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postCompanies } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const CompanyForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.company || {};

  const [name, setName] = useState(existingData?.name || "");
  const [logo, setLogo] = useState(existingData?.logo || "");
  const [logoChanged, setLogoChanged] = useState(false);
  const [category, setCategory] = useState(existingData?.category || "");
  const [hqLocation, setHqLocation] = useState(existingData?.HQ_location || "");
  const [latLong, setLatLong] = useState(existingData?.Lat_long || "");
  const [companyScale, setCompanyScale] = useState(existingData?.Company_scale || "");
  
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

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!category) {
      toast.error("Company category is required");
      return false;
    }
    if (!companyScale) {
      toast.error("Company scale is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", name);
    if (logoChanged && logo) formData.append("logo", logo);
    formData.append("category", category);
    formData.append("HQ_location", hqLocation);
    formData.append("Lat_long", latLong);
    formData.append("Company_scale", companyScale);

    try {
      let response;
      if (mode === "add") {
        response = await postCompanies(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCompanies(formData, existingData.id);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 
          (mode === "add" ? "Company added successfully!" : "Company updated successfully!"));
        
        // if (mode === "add") {
        //   setName("");
        //   setLogo(null);
        //   setCategory("");
        //   setHqLocation("");
        //   setLatLong("");
        //   setCompanyScale("");
        // }
        setTimeout(() => navigate("/companies"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the company");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Company" : "Edit Company"}</h2>
      <form onSubmit={handleSubmit} className="company-form">
        <div className="form-group">
          <label>Company Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Logo:</label>
          {logo && (
            <img
              src={logo}
              alt="Company Logo"
              className="company-logo"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setLogo(e.target.files[0])
              setLogoChanged(true)
            }}
            className="form-input"
          />
        </div>
        
          {logo &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(logo)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        <div className="form-group">
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select Category</option>
            <option value="Grocery">Grocery</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Bakery">Bakery</option>
          </select>
        </div>
        <div className="form-group">
          <label>Headquarters Location:</label>
          <textarea
            value={hqLocation}
            onChange={(e) => setHqLocation(e.target.value)}
            rows="3"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Latitude/Longitude:</label>
          <input
            type="text"
            value={latLong}
            onChange={(e) => setLatLong(e.target.value)}
            placeholder="latitude, longitude"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Company Scale (No. of Employees):</label>
          <select
            value={companyScale}
            onChange={(e) => setCompanyScale(e.target.value)}
            required
            className="form-input"
          >
            <option value="">Select Scale</option>
            <option value="0-20">0-20 Employees</option>
            <option value="20-50">20-50 Employees</option>
            <option value="50-above">50 and Above Employees</option>
          </select>
        </div>
        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Company" : "Update Company"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

CompanyForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default CompanyForm;
