import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postGiftCards, postBulkGiftCards } from "/src/APIs/TaxAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";

const GiftCardForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.giftCard || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [company, setCompany] = useState(existingData?.company || user?.company || "");
  const [companies, setCompanies] = useState([]);


  const [type, setType] = useState(existingData?.type || "");
  const [percentage, setPercentage] = useState(existingData?.percentage || "");
  const [amount, setAmount] = useState(existingData?.amount || "");
  const [uniqueCode, setUniqueCode] = useState(existingData?.unique_code || "");
  const [expiryDate, setExpiryDate] = useState(existingData?.expiry_date || "");
  const [count, setCount] = useState(0)
  
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
          if (user.is_superuser)
            getCompanies().then((res) => {
              setCompanies(res);
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
    if (!type) return toast.error("Card Type is required."), false;
    if (!percentage) return toast.error("Discount Percentage is required."), false;
    if (!company) return toast.error("Company is required."), false;
    if (!amount) return toast.error("Card Value is required."), false;
    // if (!uniqueCode) return toast.error("Unique Code is required."), false;
    if (!expiryDate) return toast.error("Expiry Date is required."), false;
    if (new Date(expiryDate) < new Date()) return toast.error("Expiry Date must be in the future."), false;
    if (percentage < 0 || percentage > 100) return toast.error("Discount Percentage must be between 0 and 100."), false;
    if (amount <= 0) return toast.error("Card Value must be greater than 0."), false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    const body = { type, company, percentage, amount, unique_code: uniqueCode, expiry_date: expiryDate, count: parseInt(count) };
    try {
      let response;
      if (mode === 'add') {
        if (count <= 0)
          response = await postGiftCards(body);
        else
          response = await postBulkGiftCards(body);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postGiftCards(body, existingData.id);
      }

      if (response.id) {
        setSuccess(mode === "add" ? "Gift Card added successfully!" : "Gift Card updated successfully!");
        toast.success(mode === "add" ? "Gift Card added successfully!" : "Gift Card updated successfully!");
        setTimeout(() => navigate("/gift-cards"), 1500);

      } else {
        const data = await response;
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            data[key].forEach((error) => {
              console.error(`${key}: ${error}`);
              toast.info(`${key}: ${error}`);
            }
            );
          } else {
            console.error(`${key}: ${data[key]}`);
            toast.error(`${key}: ${data[key]}`);
          }
        });
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
      <h2 className="form-heading">{mode === "add" ? "Add Gift Card" : "Edit Gift Card"}</h2>
      <form className="giftcard-form" onSubmit={handleSubmit}>
        {user && user.is_superuser && (
          <div className="form-group">
            <label>Company:</label>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="form-input" required>
              <option value="">Select Company</option>
              {companies.length > 0 && companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label>Card Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="form-input" required>
            <option value="">Select Card Type</option>
            <option value="General">General</option>
            <option value="Anniversary">Anniversary</option>
            <option value="Birthday">Birthday</option>
          </select>
        </div>
        <div className="form-group">
          <label>Discount Percentage:</label>
          <input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} className="form-input" required />
        </div>
        <div className="form-group">
          <label>Card Value:</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-input" required />
        </div>
        <div className="form-group">
          <label>Unique Code:</label>
          <input type="text" value={uniqueCode} onChange={(e) => setUniqueCode(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Expiry Date:</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="form-input" required />
        </div>
        <div className="form-group">
          <label>Count:</label>
          <input type="number" value={count} onChange={(e) => setCount(e.target.value)} className="form-input" />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Gift Card" : "Update Gift Card"}
        </button>
      </form>
    </div>
  );
};

GiftCardForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default GiftCardForm;
