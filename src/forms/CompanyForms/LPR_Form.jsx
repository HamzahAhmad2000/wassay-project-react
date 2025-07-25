import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCompanies, postLPR } from "/src/APIs/CompanyAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const LPRForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.LPR || {};
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "", 
    for_every_1000_LP_CB: existingData.for_every_1000_LP_CB || 0,
    for_every_1000_spend_LP: existingData.for_every_1000_spend_LP || 0,
    max_discount: existingData.max_discount || 0,
    expire_after: existingData.expire_after || null,
    sign_up_bonus: existingData.sign_up_bonus || 0,
    birthday_discount: existingData.birthday_discount || 0,
    flash_sale_discount: existingData.flash_sale_discount || 0,
    milestone_purchase_count: existingData.milestone_purchase_count || 10,
    milestone_spend_amount: existingData.milestone_spend_amount || 500.0,
    milestone_gift_amount: existingData.milestone_gift_amount || 10.0,
    monthly_purchase_milestone: existingData.monthly_purchase_milestone || 0,
    yearly_purchase_milestone: existingData.yearly_purchase_milestone || 0,
    monthly_purchase_milestone_points: existingData.monthly_purchase_milestone_points || 0,
    yearly_purchase_milestone_points: existingData.yearly_purchase_milestone_points || 0,
  })
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        if (user && user.is_superuser)
          getCompanies().then(res => (setCompanies(res)))
      })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.company) {
      toast.error("Company is required");
      return false;
    }
    if (!formData.for_every_1000_LP_CB) {
      toast.error("RP to CB Ratio is required");
      return false;
    }
    if (!formData.for_every_1000_spend_LP) {
      toast.error("Money Spend to RP Ratio is required");
      return false;
    }
    if (!formData.max_discount) {
      toast.error("Max Discount is required");
      return false;
    }
    return true;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postLPR(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postLPR(JSON.stringify(formData), existingData.id);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 
          (mode === "add" ? "Company added successfully!" : "Company updated successfully!"));
        setTimeout(() => navigate("/LPRs"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the LPR");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Loyalty Point Rules" : "Edit Loyalty Point Rules"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.length > 0 && companies.map((company)=> (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="for_every_1000_spend_LP" className="text-[#101023] font-medium">Spending Rs. 1000 gets you</Label>
                <Input
                  id="for_every_1000_spend_LP"
                  value={formData.for_every_1000_spend_LP}
                  onChange={(e) => handleChange("for_every_1000_spend_LP", e.target.value)}
                  placeholder="100"
                  type="number"
                  min="0"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="for_every_1000_LP_CB" className="text-[#101023] font-medium">Redeeming 1000 LP Gives you</Label>
                <Input
                  id="for_every_1000_LP_CB"
                  type="number"
                  value={formData.for_every_1000_LP_CB}
                  onChange={(e) => handleChange("for_every_1000_LP_CB", e.target.value)}
                  placeholder="100"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount" className="text-[#101023] font-medium">Max Discount Allowed</Label>
                <Input 
                  id="max_discount"
                  value={formData.max_discount}
                  onChange={(e) => handleChange("max_discount", e.target.value)}
                  required
                  type="number"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expire_after" className="text-[#101023] font-medium">Expires After</Label>
                <Input 
                  id="expire_after"
                  value={formData.expire_after}
                  onChange={(e) => handleChange("expire_after", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sign_up_bonus" className="text-[#101023] font-medium">Signup Bonus</Label>
                <Input 
                  id="sign_up_bonus"
                  value={formData.sign_up_bonus}
                  onChange={(e) => handleChange("sign_up_bonus", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday_discount" className="text-[#101023] font-medium">Birthday Discount</Label>
                <Input 
                  id="birthday_discount"
                  value={formData.birthday_discount}
                  onChange={(e) => handleChange("birthday_discount", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flash_sale_discount" className="text-[#101023] font-medium">Flash Sale Discount</Label>
                <Input 
                  id="flash_sale_discount"
                  value={formData.flash_sale_discount}
                  onChange={(e) => handleChange("flash_sale_discount", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone_purchase_count" className="text-[#101023] font-medium">Milestone Purchase Count</Label>
                <Input 
                  id="milestone_purchase_count"
                  value={formData.milestone_purchase_count}
                  onChange={(e) => handleChange("milestone_purchase_count", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone_spend_amount" className="text-[#101023] font-medium">Milestone Spend Amount</Label>
                <Input 
                  id="milestone_spend_amount"
                  value={formData.milestone_spend_amount}
                  onChange={(e) => handleChange("milestone_spend_amount", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="500.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone_gift_amount" className="text-[#101023] font-medium">Milestone Gift Amount</Label>
                <Input 
                  id="milestone_gift_amount"
                  value={formData.milestone_gift_amount}
                  onChange={(e) => handleChange("milestone_gift_amount", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="10.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_purchase_milestone" className="text-[#101023] font-medium">Monthly Purchase Milestone</Label>
                <Input 
                  id="monthly_purchase_milestone"
                  value={formData.monthly_purchase_milestone}
                  onChange={(e) => handleChange("monthly_purchase_milestone", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly_purchase_milestone" className="text-[#101023] font-medium">Yearly Purchase Milestone</Label>
                <Input 
                  id="yearly_purchase_milestone"
                  value={formData.yearly_purchase_milestone}
                  onChange={(e) => handleChange("yearly_purchase_milestone", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_purchase_milestone_points" className="text-[#101023] font-medium">Monthly Purchase Milestone Points</Label>
                <Input 
                  id="monthly_purchase_milestone_points"
                  value={formData.monthly_purchase_milestone_points}
                  onChange={(e) => handleChange("monthly_purchase_milestone_points", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly_purchase_milestone_points" className="text-[#101023] font-medium">Yearly Purchase Milestone Points</Label>
                <Input 
                  id="yearly_purchase_milestone_points"
                  value={formData.yearly_purchase_milestone_points}
                  onChange={(e) => handleChange("yearly_purchase_milestone_points", e.target.value)}
                  type="number"
                  className="w-full"
                  min="0"
                  defaultValue="0"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/LPRs')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Loyalty Point Rules" : "Update Loyalty Point Rules"}
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

LPRForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default LPRForm;