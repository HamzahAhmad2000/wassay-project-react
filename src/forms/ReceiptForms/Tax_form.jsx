import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postTaxes } from "/src/APIs/TaxAPIs";
import { getCategories } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";

const TaxForm = ({ mode = "add" }) => {
  
  const { state } = useLocation();
  const existingData = state?.tax || {}
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [category, setCategory] = useState(existingData?.category || "");
  const [categoryOptions, setCategoryOption] = useState([]);
  const [company, setCompany] = useState(existingData.company || user?.company || "");
  const [tax_name, setLocation] = useState(existingData?.tax_name ||"");
  const [companies, setCompanies] = useState([]);
  const [viaCard, setViaCard] = useState(existingData?.tax_percentage_via_card || "");
  const [viaCash, setViaCash] = useState(existingData?.tax_percentage_via_cash || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate()

  useEffect(()=>{
    // Check if the user is already logged in
    
    
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login"); // Redirect to the main page
    }
    else if (token) {
      // Verify the token
      verifyToken(token)
      .then(()=>{

        if (user.is_superuser)
          getCompanies().then((res) => {
                setCompanies(res);
          })
      }
      )
      .catch(()=>{
        navigate("/login"); // Redirect to the
      })

    }
  }, [navigate])
  
  
  useEffect(() => {
    // Fetch all categories when the component mounts
    async function getCategoriesViaApi() {
      try {
        const categories = await getCategories();
        setCategoryOption(categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories. Please try again later.");
        toast.error("Unable to load categories. Please try again later.");
      }      
    }
    getCategoriesViaApi();

  }, []);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
        // if (success) navigate("/warehouses")
      }, 1000); // Clear messages after 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [success, error, navigate]);

  const validateForm = () => {
    if (!category) {
      setError("Category is required.");
      toast.error("Category is required.");
      return false;
    }
    if (!tax_name) {
      setError("Tax Type is required.");
      toast.error("Tax Type is required."); 
      return false;
    }
    if (!viaCard) {
      setError("Via Card is required.");
      toast.error("Via Card is required.");
      return false;
    } if (!viaCash) {
      setError("Via Cash is required.");
      toast.error("Via Cash is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body= {
      "company": company,
      "category": category,
      "tax_percentage_via_card": viaCard,
      "tax_percentage_via_cash": viaCash,
      "tax_name": tax_name,
    }
    try {
      
      
      
      let response;
      if (mode == 'add'){
        response = await postTaxes(body)
      } else if (mode == 'edit' && existingData?.id) {
        
        response = await postTaxes(body, existingData.id)
      }

      if (response.ok) {
        setSuccess(mode=="add"? "Tax added successfully!": "Tax updated successfully");
        toast.success(mode=="add"? "Tax added successfully!": "Tax updated successfully");
        if(mode=="add") {
          // Clear form fields
          // setCategory("");
          // setViaCard("");
          // setLocation("");
        setTimeout(() => navigate("/taxes"), 1500);

        }
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to add Tax. Please check your inputs.");
        toast.error(data.detail || "Failed to add Tax. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
  <h2 className="form-heading">{mode === "add" ? "Add Tax" : "Edit Tax"}</h2>
  <form className="category-form" onSubmit={handleSubmit}>

    {user && user.is_superuser && (
      <div className="form-group">
        <label>Company:</label>
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="form-input"
          >
          <option value="" disabled>
            Select a Company
          </option>
          {companies.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="form-group">
      <label>Category:</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className="form-input"
      >
        <option value="" disabled>
          Select a Category
        </option>
        {categoryOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.category_name}
          </option>
        ))}
      </select>
    </div>


    <div className="form-group">
      <label>Tax Type:</label>
      <input
        type="text"
        value={tax_name}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="GST, Income, etc..."
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label>Via Card(%):</label>
      <input
        rows="3"
        type="number"
        value={viaCard}
        onChange={(e) => setViaCard(e.target.value)}
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label>Via Cash(%):</label>
      <input
        rows="3"
        type="number"
        value={viaCash}
        onChange={(e) => setViaCash(e.target.value)}
        className="form-input"
      />
    </div>


    {error && <p className="error-text">{error}</p>}
    {success && <p className="success-text">{success}</p>}

    <button type="submit" className="submit-button">
      {mode === "add" ? "Add Tax" : "Update Tax"}
    </button>
  </form>
</div>

  );
};

TaxForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default TaxForm;
