import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postGiftCards, postBulkGiftCards } from "/src/APIs/TaxAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const GiftCardForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.giftCard || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [company, setCompany] = useState(existingData?.company || user?.company || "");
  const [companies, setCompanies] = useState([]);


  const [type, setType] = useState(existingData?.type || "");
  const [percentage, setPercentage] = useState(existingData?.percentage || "");
  const [amount, setAmount] = useState(existingData?.amount || "");
  const [uniqueCode, setUniqueCode] = useState(existingData?.unique_code || "");
  const [expiryDate, setExpiryDate] = useState(existingData?.expiry_date || "");
  const [count, setCount] = useState(0)
  
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
          if (user.is_superuser)
            getCompanies().then((res) => {
              setCompanies(res);
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
    if (!type) return toast.error("Card Type is required."), false;
    if (!percentage) return toast.error("Discount Percentage is required."), false;
    if (!company) return toast.error("Company is required."), false;
    if (!amount) return toast.error("Card Value is required."), false;
    // if (!uniqueCode) return toast.error("Unique Code is required."), false;
    if (!expiryDate) return toast.error("Expiry Date is required."), false;
    if (new Date(expiryDate) < new Date()) return toast.error("Expiry Date must be in the future."), false;
    if (percentage < 0 || percentage > 100) return toast.error("Discount Percentage must be between 0 and 100."), false;
    if (amount <= 0) return toast.error("Card Value must be greater than 0."), false;
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateForm()) return;

    const body = { type, company, percentage, amount, unique_code: uniqueCode, expiry_date: expiryDate, count: parseInt(count) };
    try {
      let response;
      if (mode === 'add') {
        if (count <= 0)
          response = await postGiftCards(body);
        else
          response = await postBulkGiftCards(body);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postGiftCards(body, existingData.id);
      }

      if (response.id) {
        setSuccess(mode === "add" ? "Gift Card added successfully!" : "Gift Card updated successfully!");
        toast.success(mode === "add" ? "Gift Card added successfully!" : "Gift Card updated successfully!");
        setTimeout(() => navigate("/gift-cards"), 1500);

      } else {
        const data = await response;
        Object.keys(data).forEach((key) => {
          if (Array.isArray(data[key])) {
            data[key].forEach((error) => {
              console.error(`${key}: ${error}`);
              toast.info(`${key}: ${error}`);
            }
            );
          } else {
            console.error(`${key}: ${data[key]}`);
            toast.error(`${key}: ${data[key]}`);
          }
        });
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
              {mode === "add" ? "Add Gift Card" : "Edit Gift Card"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.length > 0 && companies.map((companyOption) => (
                        <SelectItem key={companyOption.id} value={companyOption.id}>{companyOption.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#101023] font-medium">Card Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Card Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Anniversary">Anniversary</SelectItem>
                    <SelectItem value="Birthday">Birthday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-[#101023] font-medium">Discount Percentage</Label>
                <Input
                  type="number"
                  id="percentage"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[#101023] font-medium">Card Value</Label>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueCode" className="text-[#101023] font-medium">Unique Code</Label>
                <Input
                  type="text"
                  id="uniqueCode"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-[#101023] font-medium">Expiry Date</Label>
                <Input
                  type="date"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="count" className="text-[#101023] font-medium">Count</Label>
                <Input
                  type="number"
                  id="count"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/gift-cards')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Gift Card" : "Update Gift Card"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

GiftCardForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default GiftCardForm;
