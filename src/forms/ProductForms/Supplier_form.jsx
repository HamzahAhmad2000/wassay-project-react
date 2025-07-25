import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postSuppliers } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from "prop-types";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const SupplierForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.supplier || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [name, setName] = useState(existingData?.name || "");
  const [phone_no, setPhoneNo] = useState(existingData?.phone_no || "");
  const [location, setLocation] = useState(existingData?.location || "");
  const [score, setScore] = useState(existingData?.score || "");
  const [companyId, setCompanyId] = useState(existingData?.company || user.company || "");
  const [companies, setCompanies] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).then(()=>{
        getCompanies()
          .then((data) => {
            setCompanies(data);
          })
          .catch((error) => {
            console.error("Failed to load companies:", error);
            toast.error("Failed to load companies:", error);
            setError("Failed to load companies. Please refresh the page.");
          });
      })
        .catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!name) {
      setError("Name is required.");
      return false;
    }

    if (!phone_no) {
      setError("Phone no is required.");
      return false;
    }
    if (!location) {
      setError("Location is required.");
      return false;
    }
    if (!score) {
      setError("Score is required.");
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body = {
      name: name.trim(),
      phone_no: phone_no.trim(),
      location: location.trim(),
      score: parseFloat(score),
    };

    try {
      const response = mode === "add"
        ? await postSuppliers(body)
        : await postSuppliers(body, existingData.id);


      if (!response || !response.id) {
        toast.error("Invalid response from server");
        console.error("Invalid response from server");
        
        throw new Error('Invalid response from server');
      }

      if (response.id) {
        const message = `Supplier ${mode === "add" ? "added" : "updated"} successfully!`;
        setSuccess(message);
        setTimeout(() => navigate("/suppliers"), 1500);
        toast.success(`Supplier ${mode === "add" ? "added" : "updated"} successfully!`);
        setTimeout(() => navigate("/suppliers"), 1500);

      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to process Supplier");
      }
    } catch (err) {
      console.error('Supplier submission error:', err);
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Supplier" : "Edit Supplier"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">
                    Company
                  </Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.length > 0 && companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  placeholder="Azhar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_no" className="text-[#101023] font-medium">
                  Phone No
                </Label>
                <Input
                  id="phone_no"
                  type="tel"
                  value={phone_no}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className="w-full"
                  placeholder="00 92 3123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-[#101023] font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                  placeholder="RWP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="score" className="text-[#101023] font-medium">
                  Score
                </Label>
                <Input
                  id="score"
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full"
                  defaultValue={50}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/suppliers")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Supplier" : "Update Supplier"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

SupplierForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default SupplierForm;
