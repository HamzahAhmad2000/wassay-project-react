// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches,postBanks } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";

const BankForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.company || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company_id: user.is_superuser ? "" : user.company ||  "",
    branch_id: user.is_superuser ? "" : user.branch || "",
    cash: 0,
    bank: 0,
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
          getBranches()
            .then((data) => {
              setBranches(data);
            })
            .catch((error) => {
              toast.error("Failed to load branches. Please refresh the page", error);
            });
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  // const validateForm = () => {
  //   if (!name.trim()) {
  //     toast.error("Bank name is required");
  //     return false;
  //   }
  //   if (!category) {
  //     toast.error("Bank category is required");
  //     return false;
  //   }
  //   if (!companyScale) {
  //     toast.error("Bank scale is required");
  //     return false;
  //   }
  //   return true;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postBanks(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postBanks(formData, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(data.id || 
          (mode === "add" ? "Bank added successfully!" : "Bank updated successfully!"));
        
        // if (mode === "add") {
        //   setName("");
        //   setLogo(null);
        //   setCategory("");
        //   setHqLocation("");
        //   setLatLong("");
        //   setBankScale("");
        // }
        setTimeout(() => navigate("/banks"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the company");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Bank" : "Edit Bank"}</h2>
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
              .find((option) => option.value === formData.company) || null}
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

        <div className="form-group">
          <label>Branch:</label>
          <Select
            value={branches
              .map((branch) => ({
                value: branch.id,
                label: branch.location,
              }))
              .find((option) => option.value === formData.branch) || null}
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
            placeholder="Select Company"
          />

        </div>
            </>)}
        <div className="form-group">
          <label>Cash In Hand:</label>
          <input
            type="number"
            name="cash"
            min={0}
            value={formData.cash}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Amount In Bank:</label>
          <input
            type="number"
            name="bank"
            min={0}
            value={formData.bank}
            onChange={handleChange}
            placeholder="69000"
            className="form-input"
          />
        </div>
        
        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Bank" : "Update Bank"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

BankForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default BankForm;
