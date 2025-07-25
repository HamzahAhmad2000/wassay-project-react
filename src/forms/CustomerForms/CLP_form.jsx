
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postCLP } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { getCustomers } from "/src/APIs/CustomerAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const CLPForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.customer || {};
  const user =  JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    customer: existingData.customer || "",
    points: existingData.points || "" 
  })

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).then(() => {
        if (user.is_superuser) {
          getCompanies().then((res) => {
            setCompanies(res);
          });
        }
        getCustomers().then(res => (setCustomers(res)))
      }).catch(() => navigate("/login"));
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const validateForm = () => {
    if (!formData.company) {
      toast.error("Company is required.");
      return false;
    }
    if (!formData.customer) {
      toast.error("Customer is required.");
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
        response = await postCLP(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCLP(formData, existingData.id);
      }

      if (response.ok) {
        toast.success(mode == "add" ? "Customer Loyalty Points added successfully!" : "Customer Loyalty Points updated successfully!");
        setSuccess(mode == "add" ? "Customer Loyalty Points added successfully!" : "Customer Loyalty Points updated successfully!");
        setTimeout(() => navigate("/CLP"), 1500);

      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process request.");
        toast.error(data.detail || "Failed to process request.");
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
              {mode === "add" ? "Add Customer" : "Edit Customer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>

              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-[#101023] font-medium">Customer</Label>
                <Select value={formData.customer} onValueChange={(value) => handleChange("customer", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>{customer.first_name} {customer.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points" className="text-[#101023] font-medium">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => handleChange("points", e.target.value)}
                  className="w-full"
                />
              </div>

              {error && <p className="error-text text-red-500 text-center">{error}</p>}
              {success && <p className="success-text text-green-500 text-center">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/CLP')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Customer Loyalty Points" : "Update Customer Loyalty Points"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

CLPForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CLPForm;
