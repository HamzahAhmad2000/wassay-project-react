// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, postOtherIncomeCategory } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";


const OtherIncomeCategoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.otherSourceOfIncome || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    company: user.company || "",
    category_name: existingData.category_name || "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(() => 
        {
          getCompanies()
            .then((data) => {
              setCompanies(data);
            })
            .catch((error) => {
              toast.error("Failed to load companies. Please refresh the page", error);
            });
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.category_name) {
      toast.error("Category name is required");
      return false;
    } if (!formData.company) {
      toast.error("company is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postOtherIncomeCategory(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postOtherIncomeCategory(JSON.stringify(formData), existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          (mode === "add" ? "Other Source of Income Category added successfully!" : "Other Source of Income Category updated successfully!"));
        
        setTimeout(() => navigate("/other-source-of-income-categories"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the Other Source of Income Category");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(name, value)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Other Source of Income Category" : "Edit Other Source of Income Category"}</h2>
      <form onSubmit={handleSubmit} className="company-form">
        {user && user.is_superuser && (
          <>
            <div className="form-group">
              <label>Company:</label>
              <Select
                value={companies
                  .map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))
                  .find((option) => option.value === formData.company) || null
                }
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "company",
                      value: selectedOption ? selectedOption.value : null, // Just the ID
                    },
                  });
                }}
                name="company"
                required
                className="form-input"
                options={companies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                placeholder="Select Company"
              />
            </div>
          </>)
        }

        <div className="form-group">
          <label>Other Source of Income Category:</label>
          <input
            type="text"
            name="category_name"
            min={0}
            value={formData.category_name}
            onChange={handleChange}
            placeholder="Rent"
            className="form-input"
          />
        </div>
        
        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Other Source of Income Category" : "Update Other Source of Income Category"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

OtherIncomeCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default OtherIncomeCategoryForm;
