// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { postContractDocumentCategory } from "/src/APIs/ProductAPIs";


const ContractDocumentCategoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.otherSourceOfIncome || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    branch: existingData.branch || user.branch || "",
    name: existingData.name || "",
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

          getBranches().then((data)=>{
            setBranches(data)
          })
            .catch((error) => {
              toast.error("Failed to load Branches. Please refresh the page", error);
            });
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.branch) {
      toast.error("Category name is required");
      return false;
    } if (!formData.company) {
      toast.error("company is required");
      return false;
    } if (!formData.name) {
      toast.error("name is required");
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
        response = await postContractDocumentCategory(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postContractDocumentCategory(JSON.stringify(formData), existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          (mode === "add" ? "Contract Document added successfully!" : "Contract Document updated successfully!"));
        
        setTimeout(() => navigate("/other-source-of-income-categories"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the Contract Document");
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
      <h2 className="form-heading">{mode === "add" ? "Add Contract Document" : "Edit Contract Document"}</h2>
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
        {user && (
          <>
            <div className="form-group">
              <label>Branch:</label>
              <Select
                value={branches
                  .map((branch) => ({
                    value: branch.id,
                    label: branch.location,
                  }))
                  .find((option) => option.value === formData.branch) || null
                }
                onChange={(selectedOption) => {
                  handleChange({
                    target: {
                      name: "branch",
                      value: selectedOption ? selectedOption.value : null, // Just the ID
                    },
                  });
                }}
                name="branch"
                required
                className="form-input"
                options={branches.map((branch) => ({
                  value: branch.id,
                  label: branch.location,
                }))}
                placeholder="Select Branch"
              />
            </div>
          </>)
        }

        <div className="form-group">
          <label>name:</label>
          <input
            type="text"
            name="name"
            min={0}
            value={formData.name}
            onChange={handleChange}
            placeholder="Legal"
            className="form-input"
          />
        </div>
        
        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Contract Document" : "Update Contract Document"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

ContractDocumentCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default ContractDocumentCategoryForm;
