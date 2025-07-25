import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postSalaries, getUsers, getDeductedSalary,getAdvanceSalariesForAUser } from "/src/APIs/UserAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

// Import Origin UI components
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[var(--color-primary-200)] p-6">
      <Card className="max-w-3xl mx-auto bg-[var(--color-primary-200)] border-[var(--color-primary-100)] shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-[var(--color-secondary-900)]">
            {mode === "add" ? "Add Salary" : "Edit Salary"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="staff" className="text-[var(--color-secondary-900)] font-medium">
                  Staff ID
                </Label>
                <Select
                  value={formData.staff}
                  onValueChange={(value) => setFormData({ ...formData, staff: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {staffOptions.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id.toString()}>
                        {staff.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[var(--color-secondary-900)] font-medium">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseSalary" className="text-[var(--color-secondary-900)] font-medium">
                  Base Salary
                </Label>
                <Input
                  id="baseSalary"
                  type="number"
                  name="baseSalary"
                  value={formData.baseSalary}
                  disabled
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryAmountCash" className="text-[var(--color-secondary-900)] font-medium">
                  Salary Amount (Cash)
                </Label>
                <Input
                  id="salaryAmountCash"
                  type="number"
                  name="salaryAmountCash"
                  value={formData.salaryAmountCash}
                  onChange={handleChange}
                  min="0"
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryAmountBank" className="text-[var(--color-secondary-900)] font-medium">
                  Salary Amount (Bank)
                </Label>
                <Input
                  id="salaryAmountBank"
                  type="number"
                  name="salaryAmountBank"
                  value={formData.salaryAmountBank}
                  onChange={handleChange}
                  min="0"
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance" className="text-[var(--color-secondary-900)] font-medium">
                  Advance Salary
                </Label>
                <Select
                  value={formData.advance}
                  onValueChange={(value) => setFormData({ ...formData, advance: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select Advance Salary" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {advanceSalaries.length > 0 && advanceSalaries.map((advance) => (
                      <SelectItem key={advance.id} value={advance.id.toString()}>
                        {advance.total_amount} { advance.date}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deduction" className="text-[var(--color-secondary-900)] font-medium">
                  Deduction
                </Label>
                <Input
                  id="deduction"
                  type="number"
                  name="deduction"
                  value={formData.deduction}
                  onChange={handleChange}
                  min="0"
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus" className="text-[var(--color-secondary-900)] font-medium">
                  Bonus
                </Label>
                <Input
                  id="bonus"
                  type="number"
                  name="bonus"
                  value={formData.bonus}
                  onChange={handleChange}
                  min="0"
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                className="bg-[var(--color-tertiary-600)] text-white hover:bg-[var(--color-tertiary-500)] focus:ring-2 focus:ring-[var(--color-tertiary-500)] focus:ring-offset-2 px-8 py-3 text-lg font-medium"
              >
                {mode === "add" ? "Add Salary" : "Update Salary"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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