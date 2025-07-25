import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postAdvanceSalaries, getUsers } from "/src/APIs/UserAPIs"; // Assuming this API exists
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const AdvanceSalaryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.AdvanceSalary || {};

  const [staff, setStaff] = useState([]);
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [formData, setFormData] = useState({
    company: existingData.company || user.company.id || "",
    branch: existingData.branch || user.branch.id || "",
    staff: existingData.staff?.id || "",
    date: existingData.date || new Date().toISOString().split("T")[0],
    advance_amount_in_cash: existingData.advance_amount_in_cash || 0,
    advance_amount_in_bank: existingData.advance_amount_in_bank || 0,
    adjusted: existingData.adjusted || false,
    recorded_by: existingData.recorded_by || user.id
  })

  const handleChange = (e)=>{
    const {name, value} = e.target
    setFormData((prev) => ({...prev, [name]: value}))
  }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          // Fetch staff options here if not fetched already
          getUsers().then((response) => {
            setStaff(response);
          })
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(()=>{
    setFormData((prev) => ({...prev, total_amount: parseFloat(formData.advance_amount_in_bank)+parseFloat(formData.advance_amount_in_cash)}))
  }, [formData.advance_amount_in_bank, formData.advance_amount_in_cash])

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!formData.staff) {
      setError("Staff is required.");
      toast.error("Staff is required.");
      return false;
    }
    if (!formData.advance_amount_in_bank && !formData.advance_amount_in_cash) {
      setError("AdvanceSalary Amount is required.");
      toast.error("AdvanceSalary Amount is required.");
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postAdvanceSalaries(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postAdvanceSalaries(formData, existingData.id);
      }

      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Advance Salary added successfully!" : "Advance Salary updated successfully!");
        toast.success(mode === "add" ? "Advance Salary added successfully!" : "Advance Salary updated successfully!");
        setTimeout(() => navigate("/advance-salaries"), 1500); // Auto-redirect
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process AdvanceSalary. Please check your inputs.");
        toast.error(data.detail || "Failed to process AdvanceSalary. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Advance Salary" : "Edit Advance Salary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="staff" className="text-[#101023] font-medium">Staff ID</Label>
                <Select value={formData.staff} onValueChange={(value) => setFormData(prev => ({...prev, staff: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id}>
                        {staffMember.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#101023] font-medium">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  name="date"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance_amount_in_cash" className="text-[#101023] font-medium">Advance Salary Amount (cash)</Label>
                <Input
                  type="number"
                  id="advance_amount_in_cash"
                  value={formData.advance_amount_in_cash || 0}
                  name="advance_amount_in_cash"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="advance_amount_in_bank" className="text-[#101023] font-medium">Advance Salary Amount (bank)</Label>
                <Input
                  type="number"
                  id="advance_amount_in_bank"
                  value={formData.advance_amount_in_bank || 0}
                  name="advance_amount_in_bank"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_amount" className="text-[#101023] font-medium">Total Amount</Label>
                <Input
                  name="total_amount"
                  type="number"
                  value={formData.total_amount || 0}
                  disabled
                  className="w-full bg-gray-100"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/advance-salaries')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Advance Salary" : "Update Advance Salary"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

AdvanceSalaryForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AdvanceSalaryForm;
