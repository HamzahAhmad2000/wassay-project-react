import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust path as needed
import { postCustomerLedgerPayments, getCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const CustomerRepayment = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.customer || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser")) || {};
  const navigate = useNavigate();

  // Initialize form data
  const [formData, setFormData] = useState({
    company: user.company || "",
    branch: user.branch || "",
    customer: existingData.id || "",
    recorded_by: user.id || "",
    amount_in_cash: existingData.amount_in_cash || 0,
    amount_in_bank: existingData.amount_in_bank || 0,
    repayment_date: existingData.repayment_date
      ? new Date(existingData.repayment_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: existingData.notes || "",
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(true);


  // Token verification and customer fetch
  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token || !user.id) {
      toast.error("Please log in to continue.");
      navigate("/login");
      return;
    }

    verifyToken(token)
      .then(() => {
        // Fetch customers
        setIsFetchingCustomers(true);
        getCustomers()
          .then((res) => {
            if (Array.isArray(res) && res.length > 0) {
              setCustomers(res);
            } else {
              setCustomers([]);
              toast.warn("No customers available.");
            }
          })
          .catch((err) => {
            toast.error("Failed to fetch customers: " + err.message);
          })
          .finally(() => {
            setIsFetchingCustomers(false);
          });
      })
      .catch(() => {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      });
  }, [navigate, user.id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.customer) {
      toast.error("Customer is required.");
      return false;
    }
    if (formData.amount_in_cash < 0 || formData.amount_in_bank < 0) {
      toast.error("Amounts cannot be negative.");
      return false;
    }
    if (parseFloat(formData.amount_in_cash) === 0 && parseFloat(formData.amount_in_bank) === 0) {
      toast.error("At least one of Amount in Cash or Amount in Bank must be greater than 0.");
      return false;
    }
    if (!formData.repayment_date) {
      toast.error("Repayment date is required.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const body = {
        ...formData,
        amount_in_cash: parseFloat(formData.amount_in_cash) || 0,
        amount_in_bank: parseFloat(formData.amount_in_bank) || 0,
      };

      let response;
      if (mode === "add") {
        response = await postCustomerLedgerPayments(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCustomerLedgerPayments(body, existingData.id);
      } else {
        throw new Error("Invalid mode or missing payment ID for edit.");
      }

      if (response.ok) {
        toast.success(
          mode === "add"
            ? "Customer payment added successfully!"
            : "Customer payment updated successfully!",
      
        );
        setTimeout(() => navigate("/customer-payments"), 2000);
      } else {
        const data = await response.json();
        toast.error(data.non_field_errors || "Failed to process payment request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="form-heading text-2xl font-bold mb-6 text-center">
        {mode === "add" ? "Add Customer Payment" : "Edit Customer Payment"}
      </h2>
      {isFetchingCustomers && <p className="text-center text-gray-500">Loading customers...</p>}
      {!isFetchingCustomers && customers.length === 0 && (
        <p className="text-center text-yellow-500">No customers available.</p>
      )}
      <form className="customer-form space-y-4" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            className="form-input form-input"
            required
            disabled={isFetchingCustomers}
          >
            <option value="" disabled>
              Select a Customer
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Amount in Cash <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount_in_cash"
            value={formData.amount_in_cash}
            onChange={handleChange}
            className="form-input form-input"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Amount in Bank <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount_in_bank"
            value={formData.amount_in_bank}
            onChange={handleChange}
            className="form-input form-input"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">
            Repayment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="repayment_date"
            value={formData.repayment_date}
            onChange={handleChange}
            className="form-input form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input form-input"
            rows="4"
          />
        </div>

        <button
          type="submit"
          className={`submit-button w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            loading || isFetchingCustomers ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading || isFetchingCustomers}
        >
          {loading ? "Processing..." : mode === "add" ? "Add Payment" : "Update Payment"}
        </button>
      </form>
    </div>
  );
};

CustomerRepayment.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerRepayment;