import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches, getWareHouses, postAssets } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const AssetForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.asset || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    company: existingData.company || user?.company || "",
    branch: existingData.branch || user?.branch || "",
    warehouse: existingData.warehouse || user?.warehouse || "",
    picture: null,
    buying_price: existingData.buying_price || "",
    paid_through: existingData.paid_through || "",
    description: existingData.description || "",
    current_price: existingData.current_price || "",
    purchase_year: existingData.purchase_year || "",
    useful_life: existingData.useful_life || "",
    name: existingData.name || "",
    type: existingData.type || "",
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
          if (user?.is_superuser) {
            getCompanies()
              .then((data) => {
                setCompanies(data);
              })
              .catch((error) => {
                toast.error("Failed to load companies. Please refresh the page", error);
              });
          }
          if (user?.is_superuser || !user?.branch) {
            getBranches()
              .then((data) => {
                setBranches(data);
              })
              .catch((error) => {
                toast.error("Failed to load branches. Please refresh the page", error);
              });
          }
          if (user?.is_superuser || !user?.warehouse) {
            getWareHouses()
              .then((data) => {
                setWarehouses(data);
              })
              .catch((error) => {
                toast.error("Failed to load warehouses. Please refresh the page", error);
              });
          }
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, []);


  const validateForm = () => {
    
    if (!formData.buying_price && !formData.useful_life) {
      toast.error("Buying Price and Useful Life must be provided");
      return false;
    }
    if (formData.buying_price < 0 || formData.useful_life < 0) {
      toast.error("Buying Price and Useful Life cannot be negative");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company", formData.company);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("warehouse", formData.warehouse);
      formDataToSend.append("paid_through", formData.paid_through);
      formDataToSend.append("description", formData.description);
      if (formData.picture) {
        formDataToSend.append("picture", formData.picture);
      }
      formDataToSend.append("buying_price", formData.buying_price || 0);
      formDataToSend.append("purchase_year", formData.purchase_year || 0);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);

      let response;
      if (mode === "add") {
        response = await postAssets(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postAssets(formDataToSend, existingData.id);
      }

      const data = await response;
      console.log(data)
      if (data.id) {
        toast.success(
          mode === "add" ? "Asset added successfully!" : "Asset updated successfully!"
        );
        setTimeout(() => navigate("/assets"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the asset");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : "",
    }));
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Asset" : "Edit Asset"}</h2>
      <form onSubmit={handleSubmit} className="company-form" encType="multipart/form-data">
        {user?.is_superuser && (
          <div className="form-group">
            <label>Company:</label>
            <Select
              value={
                companies
                  .map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))
                  .find((option) => option.value === formData.company) || null
              }
              onChange={(selectedOption) => handleSelectChange("company", selectedOption)}
              name="company"
              className="form-input"
              options={companies.map((company) => ({
                value: company.id,
                label: company.name,
              }))}
              placeholder="Select Company"
            />
          </div>
        )}

        {user && !user?.branch && (
          <div className="form-group">
            <label>Branch:</label>
            <Select
              value={
                branches
                  .map((branch) => ({
                    value: branch.id,
                    label: branch.address,
                  }))
                  .find((option) => option.value === formData.branch) || null
              }
              onChange={(selectedOption) => handleSelectChange("branch", selectedOption)}
              name="branch"
              className="form-input"
              options={branches.map((branch) => ({
                value: branch.id,
                label: branch.address,
              }))}
              placeholder="Select Branch"
            />
          </div>
        )}

        {user && !user?.warehouse && (
          <div className="form-group">
            <label>Warehouse:</label>
            <Select
              value={
                warehouses
                  .map((warehouse) => ({
                    value: warehouse.id,
                    label: warehouse.address,
                  }))
                  .find((option) => option.value === formData.warehouse) || null
              }
              onChange={(selectedOption) => handleSelectChange("warehouse", selectedOption)}
              name="warehouse"
              className="form-input"
              options={warehouses.map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.address,
              }))}
              placeholder="Select Branch"
            />
          </div>
        )}

        <div className="form-group">
          <label>Purchase Year:</label>
          <input
            type="number"
            name="purchase_year"
            min={1900}
            max={new Date().getFullYear()}
            value={formData.purchase_year}
            onChange={handleChange}
            placeholder="e.g. 2023"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Buying Price:</label>
          <input
            type="number"
            name="buying_price"
            min={0}
            value={formData.buying_price}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
            step="0.01"
          />
        </div>

         <div className="form-group">
            <label>Paid Through:</label>
            <select
              name="paid_through"
              value={formData.paid_through}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">
                Select Payment Method (Keep this selected if Purchased in the past)
              </option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

        <div className="form-group">
          <label>useful Life (years) :</label>
          <input
            type="number"
            min={0}
            name="useful_life"
            value={formData.useful_life}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Type:</label>
          <select 
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="" disabled>
              Select Type
            </option>
            <option value="Motor">Motor</option>
            <option value="Building">Building</option>
            <option value="Equipment">Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="vehicle">Vehicle</option>
            <option value="Machinery">Machinery</option>
            <option value="Other">Other</option>
          </select>

        </div>

        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Model, Manufacturer, etc."
            className="form-input"
          />
        </div>


        <div className="form-group">
          <label>Picture:</label>
          <input
            type="file"
            name="picture"
            onChange={handleChange}
            accept="image/jpeg,image/png"
            className="form-input"
            required
          />
        </div>

        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Asset" : "Update Asset"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

AssetForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AssetForm;