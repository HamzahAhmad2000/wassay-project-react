import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust path as needed
import { postCustomerLedgerPayments, getCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

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
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Customer Payment" : "Edit Customer Payment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isFetchingCustomers && <p className="text-center text-gray-500">Loading customers...</p>}
            {!isFetchingCustomers && customers.length === 0 && (
              <p className="text-center text-yellow-500">No customers available.</p>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-[#101023] font-medium">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.customer} 
                  onValueChange={(value) => handleChange("customer", value)}
                  disabled={isFetchingCustomers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_in_cash" className="text-[#101023] font-medium">
                  Amount in Cash <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount_in_cash"
                  type="number"
                  value={formData.amount_in_cash}
                  onChange={(e) => handleChange("amount_in_cash", e.target.value)}
                  className="w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_in_bank" className="text-[#101023] font-medium">
                  Amount in Bank <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount_in_bank"
                  type="number"
                  value={formData.amount_in_bank}
                  onChange={(e) => handleChange("amount_in_bank", e.target.value)}
                  className="w-full"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repayment_date" className="text-[#101023] font-medium">
                  Repayment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="repayment_date"
                  type="date"
                  value={formData.repayment_date}
                  onChange={(e) => handleChange("repayment_date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#101023] font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  className="w-full"
                  rows="4"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customer-payments')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isFetchingCustomers}
                  className={`bg-[#423e7f] text-white hover:bg-[#201b50] ${
                    loading || isFetchingCustomers ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Processing..." : mode === "add" ? "Add Payment" : "Update Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

CustomerRepayment.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerRepayment;