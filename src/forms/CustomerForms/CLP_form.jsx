
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postCLP } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { getCustomers } from "/src/APIs/CustomerAPIs";

const CLPForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.customer || {};
  const user =  JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    customer: existingData.customer || "",
    points: existingData.points || "" 
  })

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).then(() => {
        if (user.is_superuser) {
          getCompanies().then((res) => {
            setCompanies(res);
          });
        }
        getCustomers().then(res => (setCustomers(res)))
      }).catch(() => navigate("/login"));
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const handleChange = async(e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const validateForm = () => {
    if (!formData.company) {
      toast.error("Company is required.");
      return false;
    }
    if (!formData.customer) {
      toast.error("Customer is required.");
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
        response = await postCLP(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCLP(formData, existingData.id);
      }

      if (response.ok) {
        toast.success(mode == "add" ? "Customer Loyalty Points added successfully!" : "Customer Loyalty Points updated successfully!");
        setSuccess(mode == "add" ? "Customer Loyalty Points added successfully!" : "Customer Loyalty Points updated successfully!");
        setTimeout(() => navigate("/CLP"), 1500);

      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process request.");
        toast.error(data.detail || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Customer" : "Edit Customer"}</h2>
      <form className="customer-form" onSubmit={handleSubmit}>

        {user && user.is_superuser && (
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <select
              id="company"
              value={formData.company}
              onChange={handleChange}
              required
              name='company'
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        )}
          <div className="form-group">
            <label htmlFor="branch">Customer</label>
            <select
              id="branch"
              value={formData.customer}
              onChange={handleChange}
              required
              name='customer'
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.first_name} {customer.last_name}</option>
              ))}
            </select>
          </div>
        <div className="form-group">
          <label>Points:</label>
          <input
            type="number"
            value={formData.points}
            onChange={handleChange}
            className="form-input"
            name='points'
            // required
          />
        </div>


        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Customer Loyalty Points" : "Update Customer Loyalty Points"}
        </button>
      </form>
    </div>
  );
};

CLPForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CLPForm;
