import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postSalaries, getUsers, getDeductedSalary,getAdvanceSalariesForAUser } from "/src/APIs/UserAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const SalaryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.salary || {};
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("OrbisUser")) || {};
  const [advanceSalaries, setAdvanceSalaries] = useState([])

  // Single state for all form fields
  const [formData, setFormData] = useState({
    staff: existingData?.staff?.id || "",
    date: existingData?.date || new Date().toISOString().split("T")[0],
    salaryAmountCash: existingData?.salary_amount_in_cash || 0,
    salaryAmountBank: existingData?.salary_amount_in_bank || 0,
    baseSalary: 0,
    advance: existingData?.advance || "",
    deduction: existingData?.deduction || 0,
    bonus: existingData?.bonus || 0,
  });

  const [staffOptions, setStaffOptions] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch token and staff options on mount
  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    verifyToken(token)
      .then(() => {
        getUsers().then((response) => {
          setStaffOptions(response);
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Fetch base salary when staff changes
  useEffect(() => {
    if (formData.staff) {
      getUsers(formData.staff)
        .then((userData) => {
          setFormData((prev) => ({
            ...prev,
            baseSalary: userData?.base_salary || 0,
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          setError("Failed to fetch base salary.");
          toast.error("Failed to fetch base salary.");
        });
      
      const deductedSalary = async (staffId) => {
        getDeductedSalary(staffId).then(
          (response)=>(response.json())).then((data) => {
          setFormData((prev) => ({
            ...prev,
            deduction: data.deducted || 0,
          }));
        })
        .catch((err) => {
          console.error("Failed to fetch deducted salary:", err);
        })
      }
      deductedSalary(formData.staff)


      const advanceSalaryFunction = async (staffId)=>{
        getAdvanceSalariesForAUser(staffId).then(async (res)=>{
          
          setAdvanceSalaries(res)
        })
        .catch((err) => {
          toast.error(`Failed to fetch advance Salary ${err}`)
        })
      }
      advanceSalaryFunction(formData.staff)
    }
  }, [formData.staff]);

  // Clear error/success messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [error, success]);

  // Unified handleChange for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form validation
  const validateForm = () => {
    if (!formData.staff) {
      setError("Staff is required.");
      toast.error("Staff is required.");
      return false;
    }
    if (!formData.date) {
      setError("Date is required.");
      toast.error("Date is required.");
      return false;
    }
    if (!formData.salaryAmountCash && !formData.salaryAmountBank) {
      setError("At least one salary amount (cash or bank) is required.");
      toast.error("At least one salary amount (cash or bank) is required.");
      return false;
    }
    return true;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body = {
      company: user.company,
      branch: user.branch,
      warehouse: user.warehouse,
      staff: formData.staff,
      date: formData.date,
      salary_amount_in_cash: Number(formData.salaryAmountCash),
      salary_amount_in_bank: Number(formData.salaryAmountBank),
      advance: formData.advance,
      deduction: Number(formData.deduction),
      bonus: Number(formData.bonus),
    };

    try {
      let response;
      if (mode === "add") {
        response = await postSalaries(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postSalaries(body, existingData.id);
      }
      const res = await response.json()
      if (!response || !response.id) 
        toast.error(`Error: ${res.non_field_errors[0]}`);
      if (response.id || response.ok) {
        setSuccess(mode === "add" ? "Salary added successfully!" : "Salary updated successfully!");
        toast.success(mode === "add" ? "Salary added successfully!" : "Salary updated successfully!");
        setTimeout(() => navigate("/salaries"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process salary. Please check your inputs.");
        toast.error(data.detail || "Failed to process salary. Please check your inputs.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Salary" : "Edit Salary"}</h2>
      <form className="salary-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Staff ID:</label>
          <select
            name="staff"
            value={formData.staff}
            onChange={handleChange}
            className="form-input"
          >
            <option value="">Select Staff</option>
            {staffOptions.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.user_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Base Salary:</label>
          <input
            type="number"
            name="baseSalary"
            value={formData.baseSalary}
            disabled
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Salary Amount (Cash):</label>
          <input
            type="number"
            name="salaryAmountCash"
            value={formData.salaryAmountCash}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Salary Amount (Bank):</label>
          <input
            type="number"
            name="salaryAmountBank"
            value={formData.salaryAmountBank}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Advance Salary:</label>
          <select
            name="advance"
            value={formData.advance}
            onChange={handleChange}
            className="form-input"
          >
            <option defaultChecked value={""}> Select Advance Salary</option>
            {advanceSalaries.length > 0 && advanceSalaries.map((advance) => (
              <option key={advance.id} value={advance.id}>
                {advance.total_amount} { advance.date}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Deduction:</label>
          <input
            type="number"
            name="deduction"
            value={formData.deduction}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Bonus:</label>
          <input
            type="number"
            name="bonus"
            value={formData.bonus}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Salary" : "Update Salary"}
        </button>
      </form>
    </div>
  );
};

SalaryForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

SalaryForm.defaultProps = {
  mode: "add",
};

export default SalaryForm;