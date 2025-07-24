// BranchForm.jsx
import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies, getLanguages, getCurrencies, getWareHouses, postBranches } from "/src/APIs/CompanyAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { postBanks } from "/src/APIs/CompanyAPIs";

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



        // if (mode === "add") {
        //   setCompany("");
        //   setWarehouse("");
        //   setAddress("");
        //   setReturnPolicy("");
        //   setLocation("");
        //   setSelectedLanguages([]);
        //   setSelectedCurrencies([]);
        // }
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
    <div className="form-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
  <h2 className="form-heading">{mode === "add" ? "Add Branch" : "Edit Branch"}</h2>
  <form className="company-form" onSubmit={handleSubmit}>
      {user && user.is_superuser && (
        <div className="form-group">
          <label>Company:</label>
          <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          className="form-input"
          >
            <option value="" disabled>
              Select a Company
            </option>
            {companyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      )}

    <div className="form-group">
      <label>Warehouse:</label>
      <select
        value={default_warehouse}
        onChange={(e) => setWarehouse(e.target.value)}
        className="form-input"
      >
        <option value={""}>
          Select a Warehouse or keep empty to auto generate one
        </option>
        {warehouseOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.address}
          </option>
        ))}
      </select>
    </div>

    <div className="form-group">
      <label>Return & Exchange Policy</label>
      <textarea
        value={returnPolicy}
        onChange={(e) => setReturnPolicy(e.target.value)}
        rows="3"
        className="form-input"
        placeholder="Enter return policy"
      />
    </div>

    <div className="form-group">
      <label>Location:</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="latitude, longitude"
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label>Address:</label>
      <textarea
        rows="3"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label htmlFor="multi-select">Select Languages:</label>
      <Select
        id="multi-select"
        options={languages}
        isMulti
        onChange={setSelectedLanguages}
        value={selectedLanguages}
        className="form-input"
      />
    </div>

    <div className="form-group">
      <label htmlFor="multi-select">Select Currencies:</label>
      <Select
        id="multi-select"
        options={currencies}
        isMulti
        onChange={setSelectedCurrencies}
        value={selectedCurrencies}
        className="form-input"
      />
    </div>

    
    <div className="form-group">
      <label>amount in bank:</label>
      <input
        type="number"
        min={0}
        value={bank.bank}
        onChange={(e) => setBank((prev) => ({ ...prev, bank: e.target.value }))}
        placeholder="Enter amount in bank"
        className="form-input"
      />
    </div>

    
    <div className="form-group">
      <label>Cash in hand:</label>
      <input
        type="number"
        min={0}
        value={bank.cash}
        onChange={(e) => setBank((prev) => ({ ...prev, cash: e.target.value }))}
        placeholder="Enter Cash in hand"
        className="form-input"
      />
    </div>
    <button type="submit" className="submit-button">
      {mode === "add" ? "Add Branch" : "Update Branch"}
    </button>
  </form>
</div>

  );
};

BranchForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit'])
};

export default BranchForm;
