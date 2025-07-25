import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, getBranchesByCompany } from "/src/APIs/CompanyAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postProfit } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

const ProfitLogForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.company || {};
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    company_id: existingData.company_id || user.company || "",
    branch_id: existingData.branch_id || user.branch || "",
    taken_by_id: existingData.taken_by || user.id,
    amount_in_cash: existingData.amount_in_cash || 0,
    amount_from_bank: existingData.amount_from_bank || 0,
    note: existingData.note || "",
    image: null, // Store file object instead of string
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          if (user && user.is_superuser) {
            getCompanies()
              .then((data) => {
                setCompanies(data);
              })
              .catch((error) => {
                toast.error("Failed to load companies. Please refresh the page", error);
              });
          }
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  useEffect(() => {
    getBranchesByCompany(formData.company_id)
      .then((data) => {
        setBranches(data);
      })
      .catch((error) => {
        toast.error("Failed to load branches. Please refresh the page", error);
      });
  }, [formData.company_id]);

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
      image: files[0] || null, // Store the first file or null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("company_id", formData.company_id);
      formDataToSend.append("branch_id", formData.branch_id);
      formDataToSend.append("taken_by_id", formData.taken_by_id);
      formDataToSend.append("amount_in_cash", formData.amount_in_cash);
      formDataToSend.append("amount_from_bank", formData.amount_from_bank);
      formDataToSend.append("note", formData.note);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the file
      }

      let response;
      if (mode === "add") {
        response = await postProfit(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postProfit(formDataToSend, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(
          mode === "add" ? "Log added successfully!" : "Log updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/profit-logs"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the log");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Log" : "Edit Log"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {user && user.is_superuser && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_id" className="text-[#101023] font-medium">Company</Label>
                    <Select value={formData.company_id} onValueChange={(value) => handleChange("company_id", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Company" />
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
                    <Label htmlFor="branch_id" className="text-[#101023] font-medium">Branch</Label>
                    <Select value={formData.branch_id} onValueChange={(value) => handleChange("branch_id", value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Branch" />
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
                <Label htmlFor="amount_in_cash" className="text-[#101023] font-medium">Profit Taken As Cash</Label>
                <Input
                  id="amount_in_cash"
                  type="number"
                  min={0}
                  value={formData.amount_in_cash}
                  onChange={(e) => handleChange("amount_in_cash", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_from_bank" className="text-[#101023] font-medium">Profit Taken From Bank Account</Label>
                <Input
                  id="amount_from_bank"
                  type="number"
                  min={0}
                  value={formData.amount_from_bank}
                  onChange={(e) => handleChange("amount_from_bank", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="text-[#101023] font-medium">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  rows="3"
                  required
                  className="w-full"
                  placeholder="Enter note"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-[#101023] font-medium">Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full"
                  required
                />

                {formData.image &&
                  // Display the image preview if an image is selected
                  <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                }
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profit-logs')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Log" : "Update Log"}
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

ProfitLogForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default ProfitLogForm;