import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postBankTransactions, getCompanies, getBranchesByCompany } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const BankTransactionForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.company || {};
  const [formData, setFormData] = useState({
    company: user.company || existingData.company || "",
    branch: user.branch || existingData.branch || "",
    recorded_by: user.id || existingData.transferred_by || "",
    amount_cash: existingData.amount_cash || 0, 
    amount_bank: existingData.amount_bank || 0, 
    note: existingData.note || "",
    image: null, // Store file object instead of string
  });
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([]) 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        if(user && user.is_superuser){
          getCompanies()
          .then((data)=>{
            setCompanies(data)
          })
          .catch((error)=>{
            toast.error("Failed to load companies. Please refresh the page", error)
          })
        }
        if (user && !user.branch){
          getBranchesByCompany(existingData.company || user.company).then((data)=>{
            setBranches(data)
          }).catch((error)=>{
            toast.error("Failed to load Branches. Please Refresh the page", error)
          })
        }
      }).catch(() => {
        toast.error("Invalid session. Please login again");
        navigate("/login");
      });
    }
  }, [navigate]);

  useEffect(()=>{
    if(formData.company){
      getBranchesByCompany(formData.company)
      .then((data)=>{
        if(data.length> 0){
          setBranches(data);
        }
      }).catch((error)=>{
        toast.error("Failed to load Branches. Please Refresh the Page", error)
      })
    }
  }, [formData.company])

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files[0] || null, // Store the file object
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("company", formData.company);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("amount_cash", formData.amount_cash);
      formDataToSend.append("amount_bank", formData.amount_bank);
      formDataToSend.append("recorded_by", formData.recorded_by);
      formDataToSend.append("notes", formData.note);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      let response;
      if (mode === "add") {
        response = await postBankTransactions(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postBankTransactions(formDataToSend, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(
          mode === "add"
            ? "Bank Transaction added successfully!"
            : "Bank Transaction updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/bank-transactions"), 1500);
      } else if(data.non_field_errors) {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the bank transfer");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Bank Transaction" : "Edit Bank Transaction"}</h2>
      <form onSubmit={handleSubmit} className="company-form" encType="multipart/form-data">

      {user && user.is_superuser && (
        <div className="form-group">
          <label>Company:</label>
          <select
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="form-input"
          >
            <option value="" disabled>
              Select a Company
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {user && !user.branch && (
        <div className="form-group">
          <label>Branch:</label>
          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="form-input"
          >
            <option value="" disabled>
              Select a Branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.location}
              </option>
            ))}
          </select>
        </div>
      )}
        <div className="form-group">
          <label>Amount in Cash:</label>
          <input
            type="number"
            name="amount_cash"
            min={0}
            value={formData.amount_cash}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Amount in Bank:</label>
          <input
            type="number"
            name="amount_bank"
            min={0}
            value={formData.amount_bank}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>


        <div className="form-group">
          <label>Note:</label>
          <textarea // Changed from input to textarea for better UX
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Why are you transferring this amount?"
            required
            className="form-input"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className="form-input"
            required
          />

          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Bank Transaction" : "Update Bank Transaction"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

BankTransactionForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default BankTransactionForm;