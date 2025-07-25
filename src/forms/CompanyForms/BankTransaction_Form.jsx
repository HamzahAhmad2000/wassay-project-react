import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postBankTransactions, getCompanies, getBranchesByCompany } from "/src/APIs/CompanyAPIs";
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

const BankTransactionForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.company || {};
  const [formData, setFormData] = useState({
    company: user.company || existingData.company || "",
    branch: user.branch || existingData.branch || "",
    recorded_by: user.id || existingData.transferred_by || "",
    amount_cash: existingData.amount_cash || 0, 
    amount_bank: existingData.amount_bank || 0, 
    note: existingData.note || "",
    image: null, // Store file object instead of string
  });
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([]) 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        if(user && user.is_superuser){
          getCompanies()
          .then((data)=>{
            setCompanies(data)
          })
          .catch((error)=>{
            toast.error("Failed to load companies. Please refresh the page", error)
          })
        }
        if (user && !user.branch){
          getBranchesByCompany(existingData.company || user.company).then((data)=>{
            setBranches(data)
          }).catch((error)=>{
            toast.error("Failed to load Branches. Please Refresh the page", error)
          })
        }
      }).catch(() => {
        toast.error("Invalid session. Please login again");
        navigate("/login");
      });
    }
  }, [navigate]);

  useEffect(()=>{
    if(formData.company){
      getBranchesByCompany(formData.company)
      .then((data)=>{
        if(data.length> 0){
          setBranches(data);
        }
      }).catch((error)=>{
        toast.error("Failed to load Branches. Please Refresh the Page", error)
      })
    }
  }, [formData.company])

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
      image: files[0] || null, // Store the file object
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("company", formData.company);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("amount_cash", formData.amount_cash);
      formDataToSend.append("amount_bank", formData.amount_bank);
      formDataToSend.append("recorded_by", formData.recorded_by);
      formDataToSend.append("notes", formData.note);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      let response;
      if (mode === "add") {
        response = await postBankTransactions(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postBankTransactions(formDataToSend, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(
          mode === "add"
            ? "Bank Transaction added successfully!"
            : "Bank Transaction updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/bank-transactions"), 1500);
      } else if(data.non_field_errors) {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the bank transfer");
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
              {mode === "add" ? "Add Bank Transaction" : "Edit Bank Transaction"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">

              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
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
              )}

              {user && !user.branch && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleChange("branch", value)}>
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
              )}
              <div className="space-y-2">
                <Label htmlFor="amount_cash" className="text-[#101023] font-medium">Amount in Cash</Label>
                <Input
                  id="amount_cash"
                  type="number"
                  min={0}
                  value={formData.amount_cash}
                  onChange={(e) => handleChange("amount_cash", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_bank" className="text-[#101023] font-medium">Amount in Bank</Label>
                <Input
                  id="amount_bank"
                  type="number"
                  min={0}
                  value={formData.amount_bank}
                  onChange={(e) => handleChange("amount_bank", e.target.value)}
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
                  placeholder="Why are you transferring this amount?"
                  required
                  className="w-full"
                  rows="3"
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
                  onClick={() => navigate('/bank-transactions')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Bank Transaction" : "Update Bank Transaction"}
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

BankTransactionForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default BankTransactionForm;