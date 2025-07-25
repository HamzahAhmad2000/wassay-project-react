import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches, postExpenses } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

const ExpenseForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.expense || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company: existingData.company || user?.company || "",
    branch: existingData.branch || user?.branch || "",
    bill_image: null,
    data_in_json: existingData.data_in_json || {}, // Object for key-value pairs
    date: existingData.date || new Date().toISOString().split("T")[0],
    amount_cash: existingData.amount_cash || "",
    amount_bank: existingData.amount_bank || "",
    category: existingData.category || "",
    note: existingData.note || "",
    method: existingData.method || "CASH",
  });
  // State for key-value pairs UI
  const [keyValuePairs, setKeyValuePairs] = useState(
    Object.entries(formData.data_in_json).map(([key, value]) => ({ key, value: String(value) })) || []
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          if (user?.is_superuser) {
            getCompanies()
              .then((data) => {
                setCompanies(data);
              })
              .catch((error) => {
                toast.error("Failed to load companies. Please refresh the page", error);
              });
          }
          if (user?.is_superuser || !user?.branch) {
            getBranches()
              .then((data) => {
                setBranches(data);
              })
              .catch((error) => {
                toast.error("Failed to load branches. Please refresh the page", error);
              });
          }
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate, user]);

  // Update data_in_json when keyValuePairs changes
  useEffect(() => {
    const newDataInJson = keyValuePairs.reduce((acc, pair) => {
      if (pair.key.trim()) {
        acc[pair.key] = pair.value;
      }
      return acc;
    }, {});
    setFormData((prev) => ({
      ...prev,
      data_in_json: newDataInJson,
    }));
  }, [keyValuePairs]);

  const validateForm = () => {
    if (!formData.date) {
      toast.error("Date is required");
      return false;
    }
    if (!formData.amount_cash && !formData.amount_bank) {
      toast.error("At least one of Amount Cash or Amount Bank must be provided");
      return false;
    }
    if (formData.amount_cash < 0 || formData.amount_bank < 0) {
      toast.error("Amounts cannot be negative");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company", formData.company);
      formDataToSend.append("branch", formData.branch);
      if (formData.bill_image) {
        formDataToSend.append("bill_image", formData.bill_image);
      }
      formDataToSend.append("data_in_json", JSON.stringify(formData.data_in_json));
      formDataToSend.append("date", formData.date);
      formDataToSend.append("amount_cash", formData.amount_cash || 0);
      formDataToSend.append("amount_bank", formData.amount_bank || 0);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("note", formData.note);
      formDataToSend.append("method", formData.method);

      let response;
      if (mode === "add") {
        response = await postExpenses(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postExpenses(formDataToSend, existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          mode === "add" ? "Expense added successfully!" : "Expense updated successfully!"
        );
        setTimeout(() => navigate("/expenses"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the expense");
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

  const handleFileChange = (e) => {
    const files = e.target.files;
    setFormData((prev) => ({
      ...prev,
      bill_image: files ? files[0] : null,
    }));
  };

  // Handle key-value pair changes
  const handleKeyValueChange = (index, field, value) => {
    setKeyValuePairs((prev) => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], [field]: value };
      return newPairs;
    });
  };

  // Add a new key-value pair
  const addKeyValuePair = () => {
    setKeyValuePairs((prev) => [...prev, { key: "", value: "" }]);
  };

  // Remove a key-value pair
  const removeKeyValuePair = (index) => {
    setKeyValuePairs((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Expense" : "Edit Expense"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {user?.is_superuser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                    <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
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
                    <Select value={formData.branch} onValueChange={(value) => handleChange("branch", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#101023] font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_cash" className="text-[#101023] font-medium">Amount (Cash)</Label>
                <Input
                  id="amount_cash"
                  type="number"
                  min={0}
                  value={formData.amount_cash}
                  onChange={(e) => handleChange("amount_cash", e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_bank" className="text-[#101023] font-medium">Amount (Bank)</Label>
                <Input
                  id="amount_bank"
                  type="number"
                  min={0}
                  value={formData.amount_bank}
                  onChange={(e) => handleChange("amount_bank", e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#101023] font-medium">Category</Label>
                <Input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="e.g., Utilities"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-[#101023] font-medium">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="Additional notes"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill_image" className="text-[#101023] font-medium">Bill Image</Label>
                <Input
                  id="bill_image"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="w-full"
                  required
                />

                {formData.bill_image &&
                  // Display the bill_image preview if an bill_image is selected
                  <img src={getImagePreviewSrc(formData.bill_image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                }
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-[#101023]">Additional Data (Key-Value Pairs):</Label>
                <div className="flex flex-col gap-3">
                  {keyValuePairs.map((pair, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Key (e.g., vendor)"
                        value={pair.key}
                        onChange={(e) => handleKeyValueChange(index, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        placeholder="Value (e.g., ABC Corp)"
                        value={pair.value}
                        onChange={(e) => handleKeyValueChange(index, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeKeyValuePair(index)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyValuePair}
                    className="self-start border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                  >
                    Add Key-Value Pair
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/expenses')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Expense" : "Update Expense"}
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

ExpenseForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default ExpenseForm;