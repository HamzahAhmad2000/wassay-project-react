import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postDiscounts } from "/src/APIs/TaxAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { getCategories } from "/src/APIs/ProductAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const DiscountForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.discount || {};
  const [formData, setFormData] = useState({
    company: existingData?.company || user?.company || "",
    branch: existingData?.branch || user?.branch || "",
    category: existingData?.category || "",
    start_date: existingData?.start_date || "",
    end_date: existingData?.end_date || "",
    discount_percentage: existingData?.discount_percentage || "",
  })
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categoryOptions, setCategoryOption] = useState([]);
  
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
          getCategories().then((res) => {
            setCategoryOption(res);
          })
          if (user.is_superuser)
            getCompanies().then((res) => {
              setCompanies(res);
            })
          if (!user.branch)
            getBranches().then((res) => {
              setBranches(res);
            })
        })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!formData.company) return toast.error("Company is required."), false;
    if (!formData.branch) return toast.error("Branch is required."), false;
    if (!formData.category) return toast.error("Category is required."), false;
    if (!formData.start_date) return toast.error("Start Date is required."), false;
    if (!formData.end_date) return toast.error("End Date is required."), false;
    if (!formData.discount_percentage) return toast.error("Discount Percentage is required."), false;
    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) return toast.error("Discount Percentage must be between 0 and 100."), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    try {
      let response;
      if (mode === 'add') {
        response = await postDiscounts(formData);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postDiscounts(formData, existingData.id);
      }

      if (response.ok) {
        setSuccess(mode === "add" ? "Discount added successfully!" : "Discount updated successfully!");
        toast.success(mode === "add" ? "Discount added successfully!" : "Discount updated successfully!");
        setTimeout(() => navigate("/discounts"), 1500);

      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process the request.");
        toast.error(data.detail || "Failed to process the request.");
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
              {mode === "add" ? "Add Discount" : "Edit Discount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
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

              {user && !user.branch && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#101023] font-medium">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.length > 0 && categoryOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-[#101023] font-medium">Start Date</Label>
                <Input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-[#101023] font-medium">End Date</Label>
                <Input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_percentage" className="text-[#101023] font-medium">Discount Percentage</Label>
                <Input
                  type="number"
                  id="discount_percentage"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/discounts')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Discount" : "Update Discount"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

DiscountForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default DiscountForm;
