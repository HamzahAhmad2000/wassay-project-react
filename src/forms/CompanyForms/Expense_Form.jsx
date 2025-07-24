import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches, postExpenses } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const ExpenseForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.expense || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company: existingData.company || user?.company || "",
    branch: existingData.branch || user?.branch || "",
    bill_image: null,
    data_in_json: existingData.data_in_json || {}, // Object for key-value pairs
    date: existingData.date || new Date().toISOString().split("T")[0],
    amount_cash: existingData.amount_cash || "",
    amount_bank: existingData.amount_bank || "",
    category: existingData.category || "",
    note: existingData.note || "",
    method: existingData.method || "CASH",
  });
  // State for key-value pairs UI
  const [keyValuePairs, setKeyValuePairs] = useState(
    Object.entries(formData.data_in_json).map(([key, value]) => ({ key, value: String(value) })) || []
  );
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
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate, user]);

  // Update data_in_json when keyValuePairs changes
  useEffect(() => {
    const newDataInJson = keyValuePairs.reduce((acc, pair) => {
      if (pair.key.trim()) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {});
    setFormData((prev) => ({
      ...prev,
      data_in_json: newDataInJson,
    }));
  }, [keyValuePairs]);

  const validateForm = () => {
    if (!formData.date) {
      toast.error("Date is required");
      return false;
    }
    if (!formData.amount_cash && !formData.amount_bank) {
      toast.error("At least one of Amount Cash or Amount Bank must be provided");
      return false;
    }
    if (formData.amount_cash < 0 || formData.amount_bank < 0) {
      toast.error("Amounts cannot be negative");
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
      if (formData.bill_image) {
        formDataToSend.append("bill_image", formData.bill_image);
      }
      formDataToSend.append("data_in_json", JSON.stringify(formData.data_in_json));
      formDataToSend.append("date", formData.date);
      formDataToSend.append("amount_cash", formData.amount_cash || 0);
      formDataToSend.append("amount_bank", formData.amount_bank || 0);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("note", formData.note);
      formDataToSend.append("method", formData.method);

      let response;
      if (mode === "add") {
        response = await postExpenses(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postExpenses(formDataToSend, existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          mode === "add" ? "Expense added successfully!" : "Expense updated successfully!"
        );
        setTimeout(() => navigate("/expenses"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the expense");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
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

  // Handle key-value pair changes
  const handleKeyValueChange = (index, field, value) => {
    setKeyValuePairs((prev) => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], [field]: value };
      return newPairs;
    });
  };

  // Add a new key-value pair
  const addKeyValuePair = () => {
    setKeyValuePairs((prev) => [...prev, { key: "", value: "" }]);
  };

  // Remove a key-value pair
  const removeKeyValuePair = (index) => {
    setKeyValuePairs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Expense" : "Edit Expense"}</h2>
      <form onSubmit={handleSubmit} className="company-form" encType="multipart/form-data">
        {user?.is_superuser && (
          <>
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
          </>
        )}

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Amount (Cash):</label>
          <input
            type="number"
            name="amount_cash"
            min={0}
            value={formData.amount_cash}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Amount (Bank):</label>
          <input
            type="number"
            min={0}
            name="amount_bank"
            value={formData.amount_bank}
            onChange={handleChange}
            placeholder="0.00"
            className="form-input"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Utilities"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Note:</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Additional notes"
            className="form-input"
          />
        </div>


        <div className="form-group">
          <label>Bill Image:</label>
          <input
            type="file"
            name="bill_image"
            onChange={handleChange}
            accept="image/jpeg,image/png"
            className="form-input"
            required
            
          />

          
          {formData.bill_image &&
            // Display the bill_image preview if an bill_image is selected
            <img src={getImagePreviewSrc(formData.bill_image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Additional Data (Key-Value Pairs):</label>
          <div className="flex flex-col gap-3">
            {keyValuePairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g., vendor)"
                  value={pair.key}
                  onChange={(e) => handleKeyValueChange(index, "key", e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., ABC Corp)"
                  value={pair.value}
                  onChange={(e) => handleKeyValueChange(index, "value", e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="rounded-md bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={() => removeKeyValuePair(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="self-start rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={addKeyValuePair}
            >
              Add Key-Value Pair
            </button>
          </div>
        </div>

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Expense" : "Update Expense"}
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

ExpenseForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ExpenseForm;