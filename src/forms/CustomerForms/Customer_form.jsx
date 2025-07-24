import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";

const CustomerForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.customer || {};
  const user =  JSON.parse(localStorage.getItem("OrbisUser"))
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [company, setCompany] = useState(existingData?.company || user?.company || "");
  const [branch, setBranch] = useState(existingData?.branch || user?.branch || "");
  const [firstName, setFirstName] = useState(existingData?.first_name || "");
  const [lastName, setLastName] = useState(existingData?.last_name || "");
  const [email, setEmail] = useState(existingData?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(existingData?.phone_number || "");
  const [address, setAddress] = useState(existingData?.address || "");
  const [age, setAge] = useState(existingData?.age || "");
  const [DOB, setDOB] = useState(existingData?.DOB || "");
  const [gender, setGender] = useState(existingData?.gender || "Male");


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is already logged in
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).then(() => {
        if (user.is_superuser) {
          getCompanies().then((res) => {
            setCompanies(res);
          });
        }
        if (!user.branch) {
          getBranches().then((res) => {
            setBranches(res);
          });
        }
      }).catch(() => navigate("/login"));
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateForm = () => {
    if (!firstName.trim()) {
      toast.error("First Name is required.");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required.");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!gender) {
      toast.error("Gender is required.");
      return false;
    }
    if (!phoneNumber.trim()) {
      toast.error("Phone Number is required.");
      return false;
    }
    if (!address.trim()) {
      toast.error("Address is required.");
      return false;
    }
    if (!company) {
      toast.error("Company is required.");
      return false;
    }
    if (!branch) {
      toast.error("Branch is required.");
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
      company: company || null,
      branch: branch || null,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      address: address,
      age: age || null,
      DOB: DOB || null,
      gender: gender,
    };
    try {
      let response;
      if (mode === "add") {
        response = await postCustomers(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCustomers(body, existingData.id);
      }

      if (response.ok) {
        toast.success(mode == "add" ? "Customer added successfully!" : "Customer updated successfully!");
        setSuccess(mode == "add" ? "Customer added successfully!" : "Customer updated successfully!");
        if (mode === "add") {
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhoneNumber("");
          setAddress("");
        }
        setTimeout(() => navigate("/customers"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process request.");
        toast.error(data.detail || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Customer" : "Edit Customer"}</h2>
      <form className="customer-form" onSubmit={handleSubmit}>

        {user && user.is_superuser && (
          <div className="form-group">
            <label htmlFor="company">Company</label>
            <select
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        )}
        {user && !user.branch && (
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Address:</label>
          <textarea
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            value={DOB}
            onChange={(e) => setDOB(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="form-input"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit" className="submit-button">
          {mode === "add" ? "Add Customer" : "Update Customer"}
        </button>
      </form>
    </div>
  );
};

CustomerForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerForm;



