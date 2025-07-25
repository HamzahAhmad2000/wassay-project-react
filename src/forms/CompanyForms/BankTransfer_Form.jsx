import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postBankTransfers, getBanks, getCompanies, getBranchesByCompany } from "/src/APIs/CompanyAPIs";
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

const BankTransferForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.company || {};
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    company: user.company || existingData.company || "",
    branch: user.branch || existingData.branch || "",
    amount: existingData.amount || 0,
    transferred_by: user.id || existingData.transferred_by || "",
    transfer_source: existingData.transfer_source || "BANK",
    note: existingData.note || "",
    bank: existingData.bank || "",
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

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksData = await getBanks();
        setBanks(banksData);
        if (banksData.length > 0) {
          setFormData((prev) => ({ ...prev, bank: banksData[0].id }));
        }
      } catch (error) {
        toast.error("Failed to load banks. Please refresh the page");
        console.error(error);
      }
    };
    fetchBanks();
  }, []);

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
      formDataToSend.append("amount", formData.amount);
      formDataToSend.append("transferred_by", formData.transferred_by);
      formDataToSend.append("transfer_source", formData.transfer_source);
      formDataToSend.append("note", formData.note);
      formDataToSend.append("bank", formData.bank);
      if (formData.image) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      let response;
      if (mode === "add") {
        response = await postBankTransfers(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postBankTransfers(formDataToSend, existingData.id);
      }

      const data = await response.json();
      if (data.id) {
        toast.success(
          mode === "add"
            ? "Bank Transfer added successfully!"
            : "Bank Transfer updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/bank-transfers"), 1500);
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
              {mode === "add" ? "Add Bank Transfer" : "Edit Bank Transfer"}
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
                <Label htmlFor="amount" className="text-[#101023] font-medium">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer_source" className="text-[#101023] font-medium">Source</Label>
                <Select value={formData.transfer_source} onValueChange={(value) => handleChange("transfer_source", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user && !user.branch &&(
                <div className="space-y-2">
                  <Label htmlFor="bank" className="text-[#101023] font-medium">Bank</Label>
                  <Select value={formData.bank} onValueChange={(value) => handleChange("bank", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.branch.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
                  onClick={() => navigate('/bank-transfers')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Bank Transfer" : "Update Bank Transfer"}
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

BankTransferForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default BankTransferForm;