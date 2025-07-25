import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompanies, getBranches, getWareHouses, postAssets } from "/src/APIs/CompanyAPIs";
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

const AssetForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.asset || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    company: existingData.company || user?.company || "",
    branch: existingData.branch || user?.branch || "",
    warehouse: existingData.warehouse || user?.warehouse || "",
    picture: null,
    buying_price: existingData.buying_price || "",
    paid_through: existingData.paid_through || "",
    description: existingData.description || "",
    current_price: existingData.current_price || "",
    purchase_year: existingData.purchase_year || "",
    useful_life: existingData.useful_life || "",
    name: existingData.name || "",
    type: existingData.type || "",
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
          if (user?.is_superuser || !user?.warehouse) {
            getWareHouses()
              .then((data) => {
                setWarehouses(data);
              })
              .catch((error) => {
                toast.error("Failed to load warehouses. Please refresh the page", error);
              });
          }
        })
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, []);


  const validateForm = () => {
    
    if (!formData.buying_price && !formData.useful_life) {
      toast.error("Buying Price and Useful Life must be provided");
      return false;
    }
    if (formData.buying_price < 0 || formData.useful_life < 0) {
      toast.error("Buying Price and Useful Life cannot be negative");
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
      formDataToSend.append("warehouse", formData.warehouse);
      formDataToSend.append("paid_through", formData.paid_through);
      formDataToSend.append("description", formData.description);
      if (formData.picture) {
        formDataToSend.append("picture", formData.picture);
      }
      formDataToSend.append("buying_price", formData.buying_price || 0);
      formDataToSend.append("purchase_year", formData.purchase_year || 0);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);

      let response;
      if (mode === "add") {
        response = await postAssets(formDataToSend);
      } else if (mode === "edit" && existingData?.id) {
        response = await postAssets(formDataToSend, existingData.id);
      }

      const data = await response;
      console.log(data)
      if (data.id) {
        toast.success(
          mode === "add" ? "Asset added successfully!" : "Asset updated successfully!"
        );
        setTimeout(() => navigate("/assets"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the asset");
      }
    } catch (err) {
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
      picture: files ? files[0] : null,
    }));
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Asset" : "Edit Asset"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
              {user?.is_superuser && (
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
              )}

              {user && !user?.branch && (
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
              )}

              {user && !user?.warehouse && (
                <div className="space-y-2">
                  <Label htmlFor="warehouse" className="text-[#101023] font-medium">Warehouse</Label>
                  <Select value={formData.warehouse} onValueChange={(value) => handleChange("warehouse", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="purchase_year" className="text-[#101023] font-medium">Purchase Year</Label>
                <Input
                  id="purchase_year"
                  type="number"
                  min={1900}
                  max={new Date().getFullYear()}
                  value={formData.purchase_year}
                  onChange={(e) => handleChange("purchase_year", e.target.value)}
                  placeholder="e.g. 2023"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buying_price" className="text-[#101023] font-medium">Buying Price</Label>
                <Input
                  id="buying_price"
                  type="number"
                  min={0}
                  value={formData.buying_price}
                  onChange={(e) => handleChange("buying_price", e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_through" className="text-[#101023] font-medium">Paid Through</Label>
                <Select value={formData.paid_through} onValueChange={(value) => handleChange("paid_through", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Payment Method (Keep this selected if Purchased in the past)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="useful_life" className="text-[#101023] font-medium">Useful Life (years)</Label>
                <Input
                  id="useful_life"
                  type="number"
                  min={0}
                  value={formData.useful_life}
                  onChange={(e) => handleChange("useful_life", e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#101023] font-medium">Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Motor">Motor</SelectItem>
                    <SelectItem value="Building">Building</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="Machinery">Machinery</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Model, Manufacturer, etc."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="picture" className="text-[#101023] font-medium">Picture</Label>
                <Input
                  id="picture"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/assets')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Asset" : "Update Asset"}
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

AssetForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AssetForm;