// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches,postBanks } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const BankForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.company || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company_id: user.is_superuser ? "" : user.company ||  "",
    branch_id: user.is_superuser ? "" : user.branch || "",
    cash: 0,
    bank: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(() => 
        {
          getCompanies()
            .then((data) => {
              setCompanies(data);
            })
            .catch((error) => {
              toast.error("Failed to load companies. Please refresh the page", error);
            });
          getBranches()
            .then((data) => {
              setBranches(data);
            })
            .catch((error) => {
              toast.error("Failed to load branches. Please refresh the page", error);
            });
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (mode === "add") {
        response = await postBanks(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postBanks(formData, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(data.id || 
          (mode === "add" ? "Bank added successfully!" : "Bank updated successfully!"));
        setTimeout(() => navigate("/banks"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the company");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Bank" : "Edit Bank"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {user && user.is_superuser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                    <Select value={formData.company_id} onValueChange={(value) => handleChange("company_id", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                    <Select value={formData.branch_id} onValueChange={(value) => handleChange("branch_id", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="cash" className="text-[#101023] font-medium">Cash In Hand</Label>
                <Input
                  id="cash"
                  type="number"
                  min={0}
                  value={formData.cash}
                  onChange={(e) => handleChange("cash", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank" className="text-[#101023] font-medium">Amount In Bank</Label>
                <Input
                  id="bank"
                  type="number"
                  min={0}
                  value={formData.bank}
                  onChange={(e) => handleChange("bank", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/banks')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Bank" : "Update Bank"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

BankForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default BankForm;
