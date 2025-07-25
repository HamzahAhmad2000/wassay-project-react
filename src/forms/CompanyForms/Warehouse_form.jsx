// WarehouseForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, postWarehouses } from "/src/APIs/CompanyAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select as OriginSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const WarehouseForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.warehouse || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser")); 
  const [company, setCompany] = useState(existingData?.company_id || user.company || "");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [location, setLocation] = useState(existingData?.location || "");
  const [address, setAddress] = useState(existingData?.address || "");
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

  useEffect(() => {
    async function getCompaniesViaApi() {
      try {
        const companies = await getCompanies();
        setCompanyOptions(companies);
      } catch (err) {
        toast.error(err || "Failed to load companies. Please refresh the page");
      }
    }
    getCompaniesViaApi();
  }, []);

  const validateForm = () => {
    if (!company) {
      toast.error("Please select a company");
      return false;
    }
    if (!location) {
      toast.error("Warehouse location is required");
      return false;
    }
    if (!address) {
      toast.error("Warehouse address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const body = {
      company: company,
      address: address,
      location: location,
    };

    try {
      let response;
      if (mode === 'add') {
        response = await postWarehouses(body);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postWarehouses(body, existingData.id);
      }

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 
          (mode === "add" ? "Warehouse added successfully!" : "Warehouse updated successfully!"));
        if (mode === "add") {
          setCompany("");
          setAddress("");
          setLocation("");
        }
        setTimeout(() => navigate("/warehouses"), 1500);
      } else {
        toast.error(data.error || 
          (mode === "add" ? "Failed to add warehouse" : "Failed to update warehouse"));
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
              {mode === "add" ? "Add Warehouse" : "Edit Warehouse"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <OriginSelect value={company} onValueChange={(value) => setCompany(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companyOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </OriginSelect>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#101023] font-medium">Location</Label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="latitude, longitude"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#101023] font-medium">Address</Label>
                <textarea
                  id="address"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/warehouses')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Warehouse" : "Update Warehouse"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

WarehouseForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default WarehouseForm;
