import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCompanies, postLPR } from "/src/APIs/CompanyAPIs";

const LPRForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.LPR || {};
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "", 
    for_every_1000_LP_CB: existingData.for_every_1000_LP_CB || 0,
    for_every_1000_spend_LP: existingData.for_every_1000_spend_LP || 0,
    max_discount: existingData.max_discount || 0,
    expire_after: existingData.expire_after || null,
    sign_up_bonus: existingData.sign_up_bonus || 0,
    birthday_discount: existingData.birthday_discount || 0,
    flash_sale_discount: existingData.flash_sale_discount || 0,
    milestone_purchase_count: existingData.milestone_purchase_count || 10,
    milestone_spend_amount: existingData.milestone_spend_amount || 500.0,
    milestone_gift_amount: existingData.milestone_gift_amount || 10.0,
    monthly_purchase_milestone: existingData.monthly_purchase_milestone || 0,
    yearly_purchase_milestone: existingData.yearly_purchase_milestone || 0,
    monthly_purchase_milestone_points: existingData.monthly_purchase_milestone_points || 0,
    yearly_purchase_milestone_points: existingData.yearly_purchase_milestone_points || 0,
  })
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        if (user && user.is_superuser)
          getCompanies().then(res => (setCompanies(res)))
      })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.company) {
      toast.error("Company is required");
      return false;
    }
    if (!formData.for_every_1000_LP_CB) {
      toast.error("RP to CB Ratio is required");
      return false;
    }
    if (!formData.for_every_1000_spend_LP) {
      toast.error("Money Spend to RP Ratio is required");
      return false;
    }
    if (!formData.max_discount) {
      toast.error("Max Discount is required");
      return false;
    }
    return true;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postLPR(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postLPR(JSON.stringify(formData), existingData.id);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 
          (mode === "add" ? "Company added successfully!" : "Company updated successfully!"));
        setTimeout(() => navigate("/LPRs"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the LPR");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Loyalty Point Rules" : "Edit Loyalty Point Rules"}</h2>
      <form onSubmit={handleSubmit} className="LPR-form">
        {user && user.is_superuser && (
          <div className="form-group">
            <label>Company:</label>
            <select
              type="text"
              value={formData.company}
              onChange={handleChange}
              name="company"
              required
              className="form-input"
            >
              <option value={""}>Select a Company</option>
              {companies.length > 0 && companies.map((company)=> (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label>Spending Rs. 1000 gets you :</label>
          <input
            value={formData.for_every_1000_spend_LP}
            onChange={handleChange}
            name={'for_every_1000_spend_LP'}
            className="form-input"
            placeholder="100"
            type="number"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Redeeming 1000 LP Gives you:</label>
          <input
            type="number"
            value={formData.for_every_1000_LP_CB}
            onChange={handleChange}
            name="for_every_1000_LP_CB"
            placeholder="100"
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Max Discount Allowed:</label>
          <input 
            value={formData.max_discount}
            onChange={handleChange}
            required
            type="number"
            name='max_discount'
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Expires After:</label>
          <input 
            value={formData.expire_after}
            onChange={handleChange}
            type="number"
            name='expire_after'
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Signup Bonus:</label>
          <input 
            value={formData.sign_up_bonus}
            onChange={handleChange}
            type="number"
            name='sign_up_bonus'
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Birthday Discount:</label>
          <input 
            value={formData.birthday_discount}
            onChange={handleChange}
            type="number"
            name='birthday_discount'
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Flash Sale Discount:</label>
          <input 
            value={formData.flash_sale_discount}
            onChange={handleChange}
            type="number"
            name='flash_sale_discount'
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Milestone Purchase Count:</label>
          <input 
            value={formData.milestone_purchase_count}
            onChange={handleChange}
            type="number"
            name='milestone_purchase_count'
            className="form-input"
            min="0"
            defaultValue="10"
          />
        </div>
        <div className="form-group">
          <label>Milestone Spend Amount:</label>
          <input 
            value={formData.milestone_spend_amount}
            onChange={handleChange}
            type="number"
            name='milestone_spend_amount'
            className="form-input"
            min="0"
            defaultValue="500.0"
          />
        </div>
        <div className="form-group">
          <label>Milestone Gift Amount:</label>
          <input 
            value={formData.milestone_gift_amount}
            onChange={handleChange}
            type="number"
            name='milestone_gift_amount'
            className="form-input"
            min="0"
            defaultValue="10.0"
          />
        </div>
        <div className="form-group">
          <label>Monthly Purchase Milestone:</label>
          <input 
            value={formData.monthly_purchase_milestone}
            onChange={handleChange}
            type="number"
            name='monthly_purchase_milestone'
            className="form-input"
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="form-group">
          <label>Yearly Purchase Milestone:</label>
          <input 
            value={formData.yearly_purchase_milestone}
            onChange={handleChange}
            type="number"
            name='yearly_purchase_milestone'
            className="form-input"
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="form-group">
          <label>Monthly Purchase Milestone Points:</label>
          <input 
            value={formData.monthly_purchase_milestone_points}
            onChange={handleChange}
            type="number"
            name='monthly_purchase_milestone_points'
            className="form-input"
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="form-group">
          <label>Yearly Purchase Milestone Points:</label>
          <input 
            value={formData.yearly_purchase_milestone_points}
            onChange={handleChange}
            type="number"
            name='yearly_purchase_milestone_points'
            className="form-input"
            min="0"
            defaultValue="0"
          />
        </div>

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Loyalty Point Rules" : "Update Loyalty Point Rules"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

LPRForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default LPRForm;