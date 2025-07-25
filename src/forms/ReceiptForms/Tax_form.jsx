import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postTaxes } from "/src/APIs/TaxAPIs";
import { getCategories } from "/src/APIs/ProductAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const TaxForm = ({ mode = "add" }) => {
  
  const { state } = useLocation();
  const existingData = state?.tax || {}
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const [category, setCategory] = useState(existingData?.category || "");
  const [categoryOptions, setCategoryOption] = useState([]);
  const [company, setCompany] = useState(existingData.company || user?.company || "");
  const [tax_name, setLocation] = useState(existingData?.tax_name ||"");
  const [companies, setCompanies] = useState([]);
  const [viaCard, setViaCard] = useState(existingData?.tax_percentage_via_card || "");
  const [viaCash, setViaCash] = useState(existingData?.tax_percentage_via_cash || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate()

  useEffect(()=>{
    // Check if the user is already logged in
    
    
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login"); // Redirect to the main page
    }
    else if (token) {
      // Verify the token
      verifyToken(token)
      .then(()=>{

        if (user.is_superuser)
          getCompanies().then((res) => {
                setCompanies(res);
          })
      }
      )
      .catch(()=>{
        navigate("/login"); // Redirect to the
      })

    }
  }, [navigate])
  
  
  useEffect(() => {
    // Fetch all categories when the component mounts
    async function getCategoriesViaApi() {
      try {
        const categories = await getCategories();
        setCategoryOption(categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setError("Unable to load categories. Please try again later.");
        toast.error("Unable to load categories. Please try again later.");
      }      
    }
    getCategoriesViaApi();

  }, []);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
        // if (success) navigate("/warehouses")
      }, 1000); // Clear messages after 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [success, error, navigate]);

  const validateForm = () => {
    if (!category) {
      setError("Category is required.");
      toast.error("Category is required.");
      return false;
    }
    if (!tax_name) {
      setError("Tax Type is required.");
      toast.error("Tax Type is required."); 
      return false;
    }
    if (!viaCard) {
      setError("Via Card is required.");
      toast.error("Via Card is required.");
      return false;
    } if (!viaCash) {
      setError("Via Cash is required.");
      toast.error("Via Cash is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    const body= {
      "company": company,
      "category": category,
      "tax_percentage_via_card": viaCard,
      "tax_percentage_via_cash": viaCash,
      "tax_name": tax_name,
    }
    try {
      
      
      
      let response;
      if (mode == 'add'){
        response = await postTaxes(body)
      } else if (mode == 'edit' && existingData?.id) {
        
        response = await postTaxes(body, existingData.id)
      }

      if (response.ok) {
        setSuccess(mode=="add"? "Tax added successfully!": "Tax updated successfully");
        toast.success(mode=="add"? "Tax added successfully!": "Tax updated successfully");
        if(mode=="add") {
          // Clear form fields
          // setCategory("");
          // setViaCard("");
          // setLocation("");
        setTimeout(() => navigate("/taxes"), 1500);

        }
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to add Tax. Please check your inputs.");
        toast.error(data.detail || "Failed to add Tax. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Tax" : "Edit Tax"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#101023] font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_name" className="text-[#101023] font-medium">Tax Type</Label>
                <Input
                  type="text"
                  id="tax_name"
                  value={tax_name}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="GST, Income, etc..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viaCard" className="text-[#101023] font-medium">Via Card (%)</Label>
                <Input
                  type="number"
                  id="viaCard"
                  value={viaCard}
                  onChange={(e) => setViaCard(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viaCash" className="text-[#101023] font-medium">Via Cash (%)</Label>
                <Input
                  type="number"
                  id="viaCash"
                  value={viaCash}
                  onChange={(e) => setViaCash(e.target.value)}
                  className="w-full"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/taxes')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Tax" : "Update Tax"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

TaxForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default TaxForm;
