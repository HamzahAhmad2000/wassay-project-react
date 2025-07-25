// BranchForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, getLanguages, getCurrencies, getWareHouses, postBranches, postBanks } from "/src/APIs/CompanyAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select as OriginSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const BranchForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.branch || {};
  const user= JSON.parse(localStorage.getItem("OrbisUser"));

  const [companyOptions, setCompanyOptions] = useState([]);
  const [company, setCompany] = useState(existingData?.company_id || user.company || "");
  const [default_warehouse, setWarehouse] = useState(existingData?.default_warehouse_id || "");
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [location, setLocation] = useState(existingData?.location || "");
  const [returnPolicy, setReturnPolicy] = useState(existingData?.return_and_exchange_policy || "");
  const [address, setAddress] = useState(existingData?.address || "");
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const navigate = useNavigate();

  const [bank, setBank] = useState({
    company_id: user.is_superuser ? "" : user.company ||  "",
    branch_id: user.is_superuser ? "" : user.branch || "",
    cash: 0,
    bank: 0,
  });

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
    if (existingData?.languages?.length) {
      setSelectedLanguages(existingData.languages.map((lang) => ({
        value: lang.id,
        label: `${lang.name} (${lang.code})`,
      })));
    }
    if (existingData?.currencies?.length) {
      setSelectedCurrencies(existingData.currencies.map((currency) => ({
        value: currency.id,
        label: `${currency.name} (${currency.code})`,
      })));
    }
  }, [existingData.currencies, existingData.languages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, warehouses, langs, currs] = await Promise.all([
          getCompanies(),
          getWareHouses(),
          getLanguages(),
          getCurrencies()
        ]);
        
        setCompanyOptions(companies);
        setWarehouseOptions(warehouses);
        setLanguages(langs.map(item => ({
          value: item.id,
          label: `${item.name} (${item.code})`
        })));
        setCurrencies(currs.map(item => ({
          value: item.id,
          label: `${item.name} (${item.code})`
        })));
      } catch (err) {
        toast.error(err || "Failed to load required data. Please refresh the page");
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    if (!company) {
      toast.error("Please select a company");
      return false;
    }
    if (!location) {
      toast.error("Branch location is required");
      return false;
    }
    if (!returnPolicy) {
      toast.error("Return policy is required");
      return false;
    }
    if (!address) {
      toast.error("Branch address is required");
      return false;
    }
    if (selectedLanguages.length === 0) {
      toast.error("Please select at least one language");
      return false;
    }
    if (selectedCurrencies.length === 0) {
      toast.error("Please select at least one currency");
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
      default_warehouse: default_warehouse || null,
      return_and_exchange_policy: returnPolicy,
      location: location,
      languages: selectedLanguages.map(option => option.value),
      currencies: selectedCurrencies.map(option => option.value),
    };

    try {
      let response;
      if (mode === 'add') {
        response = await postBranches(body);
      } else if (mode === 'edit' && existingData?.id) {
        response = await postBranches(body, existingData.id);
      }

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 
          (mode === "add" ? "Branch added successfully!" : "Branch updated successfully!"));

          const bankData = {
            company_id: data.data.company,
            branch_id: data.data.id,
            cash: bank.cash || 0,
            bank: bank.bank || 0,
          }
        const bankResponse = await postBanks(JSON.stringify(bankData))

        if (bankResponse.ok) {
          const bankDataResponse = await bankResponse.json();
          toast.success(bankDataResponse.message || "Bank details saved successfully!");
        } else {
          const bankErrorData = await bankResponse.json();
          toast.error(bankErrorData.error || "Failed to save bank details");
        }

        setTimeout(() => navigate("/branches"), 1500);
      } else {
        toast.error(data.error || 
          (mode === "add" ? "Failed to add branch" : "Failed to update branch"));
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
              {mode === "add" ? "Add Branch" : "Edit Branch"}
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
                <Label htmlFor="warehouse" className="text-[#101023] font-medium">Warehouse</Label>
                <OriginSelect value={default_warehouse} onValueChange={(value) => setWarehouse(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Warehouse or keep empty to auto generate one" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouseOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.address}</SelectItem>
                    ))}
                  </SelectContent>
                </OriginSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy" className="text-[#101023] font-medium">Return & Exchange Policy</Label>
                <textarea
                  id="returnPolicy"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                  placeholder="Enter return policy"
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="languages" className="text-[#101023] font-medium">Select Languages</Label>
                <Select
                  id="languages"
                  options={languages}
                  isMulti
                  onChange={setSelectedLanguages}
                  value={selectedLanguages}
                  className="w-full"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencies" className="text-[#101023] font-medium">Select Currencies</Label>
                <Select
                  id="currencies"
                  options={currencies}
                  isMulti
                  onChange={setSelectedCurrencies}
                  value={selectedCurrencies}
                  className="w-full"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAmount" className="text-[#101023] font-medium">Amount in Bank</Label>
                <Input
                  type="number"
                  id="bankAmount"
                  min={0}
                  value={bank.bank}
                  onChange={(e) => setBank((prev) => ({ ...prev, bank: e.target.value }))}
                  placeholder="Enter amount in bank"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashAmount" className="text-[#101023] font-medium">Cash in Hand</Label>
                <Input
                  type="number"
                  id="cashAmount"
                  min={0}
                  value={bank.cash}
                  onChange={(e) => setBank((prev) => ({ ...prev, cash: e.target.value }))}
                  placeholder="Enter Cash in hand"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/branches')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Branch" : "Update Branch"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

BranchForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default BranchForm;
