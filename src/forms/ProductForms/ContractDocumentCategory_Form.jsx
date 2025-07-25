// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches } from "/src/APIs/CompanyAPIs";
import "/src/styles/FormStyles.css";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { postContractDocumentCategory } from "/src/APIs/ProductAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";

const ContractDocumentCategoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.otherSourceOfIncome || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    branch: existingData.branch || user.branch || "",
    name: existingData.name || "",
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

          getBranches().then((data)=>{
            setBranches(data)
          })
            .catch((error) => {
              toast.error("Failed to load Branches. Please refresh the page", error);
            });
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!formData.branch) {
      toast.error("Category name is required");
      return false;
    } if (!formData.company) {
      toast.error("company is required");
      return false;
    } if (!formData.name) {
      toast.error("name is required");
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
        response = await postContractDocumentCategory(JSON.stringify(formData));
      } else if (mode === "edit" && existingData?.id) {
        response = await postContractDocumentCategory(JSON.stringify(formData), existingData.id);
      }

      const data = await response;
      if (data.id) {
        toast.success(
          (mode === "add" ? "Contract Document added successfully!" : "Contract Document updated successfully!"));
        
        setTimeout(() => navigate("/other-source-of-income-categories"), 1500);
      } else {
        toast.error(data.non_field_errors[0] || "An error occurred while saving the Contract Document");
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
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Contract Document" : "Edit Contract Document"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">
                    Company:
                  </Label>
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
                          value: selectedOption ? selectedOption.value : null,
                        },
                      });
                    }}
                    name="company"
                    required
                    className="w-full"
                    options={companies.map((company) => ({
                      value: company.id,
                      label: company.name,
                    }))}
                    placeholder="Select Company"
                  />
                </div>
              )}
              {user && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">
                    Branch:
                  </Label>
                  <Select
                    value={branches
                      .map((branch) => ({
                        value: branch.id,
                        label: branch.location,
                      }))
                      .find((option) => option.value === formData.branch) || null
                    }
                    onChange={(selectedOption) => {
                      handleChange({
                        target: {
                          name: "branch",
                          value: selectedOption ? selectedOption.value : null,
                        },
                      });
                    }}
                    name="branch"
                    required
                    className="w-full"
                    options={branches.map((branch) => ({
                      value: branch.id,
                      label: branch.location,
                    }))}
                    placeholder="Select Branch"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">
                  Name:
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  min={0}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Legal"
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/contract-document-categories")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Contract Document" : "Update Contract Document"}
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

ContractDocumentCategoryForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default ContractDocumentCategoryForm;
