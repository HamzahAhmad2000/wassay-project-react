import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postOtherSourceOfIncome, getCompanies, getBranchesByCompany, getOtherIncomeCategory } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const OtherSourceOfIncomeForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.bank || {};
  const [formData, setFormData] = useState({
    company: user.company || existingData.company || "",
    branch: user.branch || existingData.branch || "",
    category: existingData.category || "",
    date: existingData.date || new Date().toISOString().split("T")[0],
    recorded_by: existingData.recorded_by || user.id ||  "",
    amount_in_cash: existingData.amount_in_cash || 0, 
    amount_in_bank: existingData.amount_in_bank || 0, 
    description: existingData.description || "",
    image: existingData.image || null, // Store file object instead of string
  });
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([]) 
  const [categories, setCategories] = useState([]) 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    console.log(existingData)
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
        if (user){
          getBranchesByCompany(existingData.company || user.company).then((data)=>{
            setBranches(data)
          }).catch((error)=>{
            console.log(error)
            toast.error("Failed to load Branches. Please Refresh the page")
          })
        }
      }).catch(() => {
        toast.error("Invalid session. Please login again");
        navigate("/login");
      });
      getOtherIncomeCategory().then((data) => {
        setCategories(data)
      }).catch((error) => {
        toast.error("Failed to load Categories. please Refresh the page")
        console.log(error)
      })
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
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("amount_in_cash", formData.amount_in_cash);
      formDataToSend.append("amount_in_bank", formData.amount_in_bank);
      formDataToSend.append("recorded_by", formData.recorded_by);
      formDataToSend.append("description", formData.description);
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      let response;
      if (mode === "add") {
        response = await postOtherSourceOfIncome(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postOtherSourceOfIncome(formDataToSend, existingData.id);
      }

      const data = await response;
      console.log(data)
      if (data.id) {
        toast.success(
          mode === "add"
            ? "Other Source of Income added successfully!"
            : "Other Source of Income updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/other-source-of-incomes"), 1500);
      } else if(data.non_field_errors) {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the other source of income");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Other Source of Income" : "Edit Other Source of Income"}</h2>
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

      {user && (
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
        <label>Category:</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-input"
        >
          <option value="" disabled>
            Select a Category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>
      
        <div className="form-group">
          <label>Amount in Cash:</label>
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
          <label>Amount in Bank:</label>
          <input
            type="number"
            name="amount_in_bank"
            min={0}
            value={formData.amount_in_bank}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>


        <div className="form-group">
          <label>description:</label>
          <textarea // Changed from input to textarea for better UX
            name="description"
            value={formData.description}
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
            required = {!formData.image}
          />

          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Other Source of Income" : "Update Other Source of Income"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

OtherSourceOfIncomeForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default OtherSourceOfIncomeForm;