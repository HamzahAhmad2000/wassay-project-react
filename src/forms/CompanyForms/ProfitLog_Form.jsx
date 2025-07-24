import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, getBranchesByCompany } from "/src/APIs/CompanyAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postProfit } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const ProfitLogForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.company || {};
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company_id: existingData.company_id || user.company || "",
    branch_id: existingData.branch_id || user.branch || "",
    taken_by_id: existingData.taken_by || user.id,
    amount_in_cash: existingData.amount_in_cash || 0,
    amount_from_bank: existingData.amount_from_bank || 0,
    note: existingData.note || "",
    image: null, // Store file object instead of string
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          if (user && user.is_superuser) {
            getCompanies()
              .then((data) => {
                setCompanies(data);
              })
              .catch((error) => {
                toast.error("Failed to load companies. Please refresh the page", error);
              });
          }
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  useEffect(() => {
    getBranchesByCompany(formData.company_id)
      .then((data) => {
        setBranches(data);
      })
      .catch((error) => {
        toast.error("Failed to load branches. Please refresh the page", error);
      });
  }, [formData.company_id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      // Store the file object for image input
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null, // Store the first file or null
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
      formDataToSend.append("company_id", formData.company_id);
      formDataToSend.append("branch_id", formData.branch_id);
      formDataToSend.append("taken_by_id", formData.taken_by_id);
      formDataToSend.append("amount_in_cash", formData.amount_in_cash);
      formDataToSend.append("amount_from_bank", formData.amount_from_bank);
      formDataToSend.append("note", formData.note);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the file
      }

      let response;
      if (mode === "add") {
        response = await postProfit(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postProfit(formDataToSend, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(
          mode === "add" ? "Log added successfully!" : "Log updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/profit-logs"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the log");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Log" : "Edit Log"}</h2>
      <form onSubmit={handleSubmit} className="company-form" encType="multipart/form-data">
        {user && user.is_superuser && (
          <>
            <div className="form-group">
              <label>Company:</label>
              <select
                value={formData.company_id}
                onChange={handleChange}
                name="company_id"
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

            <div className="form-group">
              <label>Branch:</label>
              <select
                value={formData.branch_id}
                onChange={handleChange}
                name="branch_id"
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
          </>
        )}

        <div className="form-group">
          <label>Profit Taken As Cash:</label>
          <input
            type="number"
            name="amount_in_cash"
            min={0}
            value={formData.amount_in_cash}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Profit Taken From Bank Account:</label>
          <input
            type="number"
            min={0}
            name="amount_from_bank"
            value={formData.amount_from_bank}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Note:</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="3"
            required
            className="form-input"
            placeholder="Enter note"
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
          {mode === "add" ? "Add Log" : "Update Log"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

ProfitLogForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default ProfitLogForm;