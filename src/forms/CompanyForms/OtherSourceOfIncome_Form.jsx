import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postOtherSourceOfIncome, getCompanies, getBranchesByCompany, getOtherIncomeCategory } from "/src/APIs/CompanyAPIs";
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

const OtherSourceOfIncomeForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const existingData = state?.bank || {};
  const [formData, setFormData] = useState({
    company: user.company || existingData.company || "",
    branch: user.branch || existingData.branch || "",
    category: existingData.category || "",
    date: existingData.date || new Date().toISOString().split("T")[0],
    recorded_by: existingData.recorded_by || user.id ||  "",
    amount_in_cash: existingData.amount_in_cash || 0, 
    amount_in_bank: existingData.amount_in_bank || 0, 
    description: existingData.description || "",
    image: existingData.image || null, // Store file object instead of string
  });
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([]) 
  const [categories, setCategories] = useState([]) 

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    console.log(existingData)
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
        if (user){
          getBranchesByCompany(existingData.company || user.company).then((data)=>{
            setBranches(data)
          }).catch((error)=>{
            console.log(error)
            toast.error("Failed to load Branches. Please Refresh the page")
          })
        }
      }).catch(() => {
        toast.error("Invalid session. Please login again");
        navigate("/login");
      });
      getOtherIncomeCategory().then((data) => {
        setCategories(data)
      }).catch((error) => {
        toast.error("Failed to load Categories. please Refresh the page")
        console.log(error)
      })
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
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("amount_in_cash", formData.amount_in_cash);
      formDataToSend.append("amount_in_bank", formData.amount_in_bank);
      formDataToSend.append("recorded_by", formData.recorded_by);
      formDataToSend.append("description", formData.description);
      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image); // Append the image file
      }

      let response;
      if (mode === "add") {
        response = await postOtherSourceOfIncome(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postOtherSourceOfIncome(formDataToSend, existingData.id);
      }

      const data = await response;
      console.log(data)
      if (data.id) {
        toast.success(
          mode === "add"
            ? "Other Source of Income added successfully!"
            : "Other Source of Income updated successfully!"
        );
        // Optionally reset form or navigate
        setTimeout(() => navigate("/other-source-of-incomes"), 1500);
      } else if(data.non_field_errors) {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the other source of income");
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
              {mode === "add" ? "Add Other Source of Income" : "Edit Other Source of Income"}
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

              {user && (
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
                <Label htmlFor="category" className="text-[#101023] font-medium">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount_in_cash" className="text-[#101023] font-medium">Amount in Cash</Label>
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
                <Label htmlFor="amount_in_bank" className="text-[#101023] font-medium">Amount in Bank</Label>
                <Input
                  id="amount_in_bank"
                  type="number"
                  min={0}
                  value={formData.amount_in_bank}
                  onChange={(e) => handleChange("amount_in_bank", e.target.value)}
                  placeholder="69000"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
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
                  required={!formData.image}
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
                  onClick={() => navigate('/other-source-of-incomes')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Other Source of Income" : "Update Other Source of Income"}
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

OtherSourceOfIncomeForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default OtherSourceOfIncomeForm;