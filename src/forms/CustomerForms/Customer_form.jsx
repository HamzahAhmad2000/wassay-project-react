import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the import path as needed
import { postCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Customer" : "Edit Customer"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>

              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {user && !user.branch && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#101023] font-medium">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#101023] font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#101023] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-[#101023] font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[#101023] font-medium">Address</Label>
                <Textarea
                  id="address"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-[#101023] font-medium">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="DOB" className="text-[#101023] font-medium">Date of Birth</Label>
                <Input
                  id="DOB"
                  type="date"
                  value={DOB}
                  onChange={(e) => setDOB(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#101023] font-medium">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="error-text text-red-500 text-center">{error}</p>}
              {success && <p className="success-text text-green-500 text-center">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customers')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Customer" : "Update Customer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

CustomerForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerForm;



