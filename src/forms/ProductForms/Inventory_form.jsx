import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { postInventory } from "/src/APIs/ProductAPIs";

const InventoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.inventory || {};

  const [formData, setFormData] = useState({
    product_id: existingData?.product_id || "",
    product_name: existingData?.product_name || "",
    manufacturing_date: existingData?.manufacturing_date || "",
    expiry_date: existingData?.expiry_date || "",
    warehouse: existingData?.warehouse || "",
    branch: existingData?.branch || "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const body = {
      manufacturing_date: formData.manufacturing_date,
      expiry_date: formData.expiry_date,
      warehouse: formData.warehouse,
      branch: formData.branch,
    };
    try {

      console.table(body);
      const response = await postInventory(body, mode === "edit" ? existingData.id : undefined);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Inventory added successfully!" : "Inventory updated successfully!");
        setTimeout(() => navigate("/inventory"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Inventory. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Inventory" : "Edit Inventory"}</h2>
      <form className="category-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            value={`${formData.product_name} - ID(${formData.product_id})`}
            className="form-input"
            disabled
          />
        </div>

        <div className="form-group">
          <label>Manufacturing Date:</label>
          <input
            value={formData.manufacturing_date}
            onChange={(e) => {setFormData({ ...formData, manufacturing_date: e.target.value })}}
            className="form-input"
            type="date"
          />
        </div>

        <div className="form-group">
          <label>Expiry Date:</label>
          <input
            value={formData.expiry_date}
            onChange={(e) => {setFormData({ ...formData, expiry_date: e.target.value })}}
            className="form-input"
            type="date"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Inventory" : "Update Inventory"}
        </button>
      </form>
    </div>
  );
};

InventoryForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default InventoryForm;
