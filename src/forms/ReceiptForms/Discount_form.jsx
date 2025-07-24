import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postDiscounts } from "/src/APIs/TaxAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { getCategories } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";

const DiscountForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.discount || {};
  const [formData, setFormData] = useState({
    company: existingData?.company || user?.company || "",
    branch: existingData?.branch || user?.branch || "",
    category: existingData?.category || "",
    start_date: existingData?.start_date || "",
    end_date: existingData?.end_date || "",
    discount_percentage: existingData?.discount_percentage || "",
  })
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categoryOptions, setCategoryOption] = useState([]);
  
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
          getCategories().then((res) => {
            setCategoryOption(res);
          })
          if (user.is_superuser)
            getCompanies().then((res) => {
              setCompanies(res);
            })
          if (!user.branch)
            getBranches().then((res) => {
              setBranches(res);
            })
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!formData.company) return toast.error("Company is required."), false;
    if (!formData.branch) return toast.error("Branch is required."), false;
    if (!formData.category) return toast.error("Category is required."), false;
    if (!formData.start_date) return toast.error("Start Date is required."), false;
    if (!formData.end_date) return toast.error("End Date is required."), false;
    if (!formData.discount_percentage) return toast.error("Discount Percentage is required."), false;
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) return toast.error("Discount Percentage must be between 0 and 100."), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    try {
      let response;
      if (mode === 'add') {
        response = await postDiscounts(formData);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postDiscounts(formData, existingData.id);
      }

      if (response.ok) {
        setSuccess(mode === "add" ? "Discount added successfully!" : "Discount updated successfully!");
        toast.success(mode === "add" ? "Discount added successfully!" : "Discount updated successfully!");
        setTimeout(() => navigate("/discounts"), 1500);

      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process the request.");
        toast.error(data.detail || "Failed to process the request.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Discount" : "Edit Discount"}</h2>
      <form className="giftcard-form" onSubmit={handleSubmit}>
        
        {user && user.is_superuser && (
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <select
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        )}

        {user && !user.branch && (
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            >
            <option value="">Select Category</option>
            {categoryOptions.length > 0 && categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.category_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="start_date">Start Date</label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        
        <div className="form-group">
          <label htmlFor="start_date">End Date</label>
          <input
            type="date"
            id="start_date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="discount_percentage">Discount Percentage</label>
          <input
            type="number"
            id="discount_percentage"
            value={formData.discount_percentage}
            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
            required
            min="0"
            max="100"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Discount" : "Update Discount"}
        </button>
      </form>
    </div>
  );
};

DiscountForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default DiscountForm;
