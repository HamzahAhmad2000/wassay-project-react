// CompanyForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { useNavigate, useLocation } from "react-router-dom";
import { postCompanies } from "/src/APIs/CompanyAPIs";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select as OriginSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const CompanyForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.company || {};

  const [name, setName] = useState(existingData?.name || "");
  const [logo, setLogo] = useState(existingData?.logo || "");
  const [logoChanged, setLogoChanged] = useState(false);
  const [category, setCategory] = useState(existingData?.category || "");
  const [hqLocation, setHqLocation] = useState(existingData?.HQ_location || "");
  const [latLong, setLatLong] = useState(existingData?.Lat_long || "");
  const [companyScale, setCompanyScale] = useState(existingData?.Company_scale || "");
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/login");
    } else {
      verifyToken(token)
        .catch(() => {
          toast.error("Invalid session. Please login again");
          navigate("/login");
        });
    }
  }, [navigate]);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!category) {
      toast.error("Company category is required");
      return false;
    }
    if (!companyScale) {
      toast.error("Company scale is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("name", name);
    if (logoChanged && logo) formData.append("logo", logo);
    formData.append("category", category);
    formData.append("HQ_location", hqLocation);
    formData.append("Lat_long", latLong);
    formData.append("Company_scale", companyScale);

    try {
      let response;
      if (mode === "add") {
        response = await postCompanies(formData);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCompanies(formData, existingData.id);
      }

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 
          (mode === "add" ? "Company added successfully!" : "Company updated successfully!"));
        
        setTimeout(() => navigate("/companies"), 1500);
      } else {
        toast.error(data.error || "An error occurred while saving the company");
      }
    } catch (err) {
      toast.error("Network error occurred. Please check your connection and try again");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Company" : "Edit Company"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">Company Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-[#101023] font-medium">Logo</Label>
                {logo && (
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="max-w-[200px] mb-2 rounded-md"
                  />
                )}
                <Input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={(e) => {
                    setLogo(e.target.files[0])
                    setLogoChanged(true)
                  }}
                  className="w-full"
                />
                {logo && (
                  <img 
                    src={getImagePreviewSrc(logo)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md" 
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#101023] font-medium">Category</Label>
                <OriginSelect value={category} onValueChange={(value) => setCategory(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grocery">Grocery</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Restaurant">Restaurant</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                  </SelectContent>
                </OriginSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hqLocation" className="text-[#101023] font-medium">Headquarters Location</Label>
                <textarea
                  id="hqLocation"
                  value={hqLocation}
                  onChange={(e) => setHqLocation(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latLong" className="text-[#101023] font-medium">Latitude/Longitude</Label>
                <Input
                  type="text"
                  id="latLong"
                  value={latLong}
                  onChange={(e) => setLatLong(e.target.value)}
                  placeholder="latitude, longitude"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyScale" className="text-[#101023] font-medium">Company Scale (No. of Employees)</Label>
                <OriginSelect value={companyScale} onValueChange={(value) => setCompanyScale(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-20">0-20 Employees</SelectItem>
                    <SelectItem value="20-50">20-50 Employees</SelectItem>
                    <SelectItem value="50-above">50 and Above Employees</SelectItem>
                  </SelectContent>
                </OriginSelect>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/companies')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Company" : "Update Company"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

CompanyForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default CompanyForm;
