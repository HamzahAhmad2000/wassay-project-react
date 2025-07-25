// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, postOtherIncomeCategory } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";

const OtherIncomeCategoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.otherSourceOfIncome || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [formData, setFormData] = useState({
    company: user.company || "",
    category_name: existingData.category_name || "",
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
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.category_name) {
      toast.error("Category name is required");
      return false;
    } if (!formData.company) {
      toast.error("company is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      let response;
      if (mode === "add") {
        response = await postOtherIncomeCategory(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postOtherIncomeCategory(JSON.stringify(formData), existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          (mode === "add" ? "Other Source of Income Category added successfully!" : "Other Source of Income Category updated successfully!"));
        
        setTimeout(() => navigate("/other-source-of-income-categories"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the Other Source of Income Category");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(name, value)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Other Source of Income Category" : "Edit Other Source of Income Category"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company:</Label>
                  <Select
                    value={companies
                      .map((company) => ({
                        value: company.id,
                        label: company.name,
                      }))
                      .find((option) => option.value === formData.company) || null
                    }
                    onChange={(selectedOption) => {
                      handleChange({
                        target: {
                          name: "company",
                          value: selectedOption ? selectedOption.value : null, // Just the ID
                        },
                      });
                    }}
                    name="company"
                    className="w-full"
                    options={companies.map((company) => ({
                      value: company.id,
                      label: company.name,
                    }))}
                    placeholder="Select Company"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category_name" className="text-[#101023] font-medium">
                  Other Source of Income Category:
                </Label>
                <Input
                  id="category_name"
                  type="text"
                  name="category_name"
                  min={0}
                  value={formData.category_name}
                  onChange={handleChange}
                  placeholder="Rent"
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/other-source-of-income-categories")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Other Source of Income Category" : "Update Other Source of Income Category"}
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

OtherIncomeCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default OtherIncomeCategoryForm;
