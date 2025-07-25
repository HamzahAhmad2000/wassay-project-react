 import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { postShifts } from "/src/APIs/UserAPIs"; // Assuming update API exists
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { toast } from "react-toastify";

// Import Origin UI components
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const ShiftForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.shift || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  const [company, setCompany] = useState(existingData?.company || user.company || "");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [timeIn, setTimeIn] = useState(existingData?.time_in || "");
  const [timeOut, setTimeOut] = useState(existingData?.time_out || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    async function getCompaniesViaApi() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
        setError("Unable to load companies. Please try again later.");
      }
    }
    getCompaniesViaApi();
  }, []);

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
    if (!company) {
      setError("Company is required.");
      return false;
    }
    if (!timeIn) {
      setError("Time In is required.");
      return false;
    }
    if (!timeOut) {
      setError("Time Out is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body = {
      company,
      time_out: timeOut,
      time_in: timeIn,
    };

    try {
      let response;
      if (mode === "add") {
        response = await postShifts(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postShifts(body, existingData.id);
      }

      if (response.status >= 200 && response.status < 300) {
        toast.success(mode === "add" ? "Shift added successfully!" : "Shift updated successfully!"); 
        setSuccess(mode === "add" ? "Shift added successfully!" : "Shift updated successfully!");
        setTimeout(() => navigate("/shifts"), 1500); // Auto-redirect
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Shift. Please check your inputs.");
        toast.error(data.detail || "Failed to process Shift. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-200)] p-6">
      <Card className="max-w-2xl mx-auto bg-[var(--color-primary-200)] border-[var(--color-primary-100)] shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-[var(--color-secondary-900)]">
            {mode === "add" ? "Add Shift" : "Edit Shift"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Auto Selected form the creator */}
            {user && !user.company && (
              <div className="space-y-2">
                <Label htmlFor="company" className="text-[var(--color-secondary-900)] font-medium">
                  Company
                </Label>
                <Select
                  value={company}
                  onValueChange={(value) => setCompany(value)}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {companyOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id.toString()}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="timeIn" className="text-[var(--color-secondary-900)] font-medium">
                Time In
              </Label>
              <Input
                id="timeIn"
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeOut" className="text-[var(--color-secondary-900)] font-medium">
                Time Out
              </Label>
              <Input
                id="timeOut"
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
              />
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                className="bg-[var(--color-tertiary-600)] text-white hover:bg-[var(--color-tertiary-500)] focus:ring-2 focus:ring-[var(--color-tertiary-500)] focus:ring-offset-2 px-8 py-3 text-lg font-medium"
              >
                {mode === "add" ? "Add Shift" : "Update Shift"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

ShiftForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ShiftForm;
