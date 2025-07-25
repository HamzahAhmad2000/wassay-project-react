import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";

import { postUsers, getRoles, getShifts, getUsers } from "/src/APIs/UserAPIs";
import { toast } from 'react-toastify';

// Import Origin UI components
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Checkbox } from "../../additionalOriginuiComponents/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const CustomUserForm = () => {
  const { state } = useLocation();

  const existingData = state?.user || {};

  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  const [roles, setRoles] = useState([])
  const [managers, setManagers] = useState([])
  const [shifts, setShiftTimings] = useState([])
  
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([])
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);

const filterBranches = (companyId) => {
  if (companyId) {
    const filtered = branches.filter(
      (branch) => {
        if(branch.company_id == companyId){
          return branch}
        }
    );
    setFilteredBranches(filtered);
  } else {
    setFilteredBranches([]);
  }
};

const filterWarehouses = (companyId) => {
  if (companyId) {
    const filtered = warehouses.filter(
      (warehouse) => {
        if(warehouse.company_id == companyId){
          return warehouse}
        }
    );
    setFilteredWarehouses(filtered);
  } else {
    setFilteredWarehouses([]);
  }
};



  const navigate = useNavigate();
  const location = useLocation();

  // Check if a user object is passed for update
  const userToEdit = location.state?.user || null;
  const [formData, setFormData] = useState({
    user_name: existingData.user_name || '',
    first_name: existingData.first_name || '',
    last_name: existingData.last_name || '',
    email: existingData.email || '',
    phone: existingData.phone || '',
    role: existingData.role || '',
    company: existingData.company || '',
    branch: existingData.branch || '',
    warehouse: existingData.warehouse || '',
    manager: existingData.manager || '',
    shift_timing: existingData.shift_timing || '',
    out_sourced: existingData.out_sourced || false,
    thumb_impression: existingData.thumb_impression || null,
    address: existingData.address || '',
    CNIC: existingData.CNIC || '',
    CNIC_copy: existingData.CNIC_copy || null,
    joinning_date: existingData.joinning_date || '',
    base_salary: existingData.base_salary || '',
    rating: existingData.rating ||0.0,
    profile_picture: existingData.profile_picture || null,
  });
  

  useEffect(() => {
    
    getCompanies()
     .then((data) => {
      setCompanies(data)})
     .catch((error) => toast.error("Error fetching companies:", error));

     getBranches()
     .then((data) => {
      setBranches(data)})
     .catch((error) => toast.error("Error fetching branches:", error));
     
     getWareHouses()
     .then((data) => {
      setWarehouses(data)})
     .catch((error) => toast.error("Error fetching Warehouses:", error));

      getRoles()
     .then((data) => {
      setRoles(data)})
     .catch((error) => toast.error("Error fetching roles:", error));

      getUsers()
     .then((data) => {
      setManagers(data)})
     .catch((error) => toast.error("Error fetching managers:", error));

      getShifts()
     .then((data) => {
      setShiftTimings(data)})
     .catch((error) => toast.error("Error fetching shift timings:", error));
  
  }, []);
  

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
      // setFormData({ ...formData, [name]: null });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (formData.thumb_impression && !(formData.thumb_impression instanceof File || typeof formData.thumb_impression === "string" )) {
      toast.error("thumb_impression is not a valid file");
    }
    if (formData.profile_picture && !(formData.profile_picture instanceof File || typeof formData.thumb_impression === "string" )) {
      toast.error("profile_picture is not a valid file");
    }
    if (formData.CNIC_copy && !(formData.CNIC_copy instanceof File || typeof formData.thumb_impression === "string" )) {
      toast.log("CNIC_copy is not a valid file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      if ((key === 'CNIC_copy') || (key === 'profile_picture') || (key === 'thumb_impression') ) {
        if(formData[key] instanceof File)
        form.append(key, formData[key]);
      }
      else
        form.append(key, formData[key]);
    });

    try {
      const response = await postUsers(form, userToEdit.id)

      if (response.ok) {
        setSuccess('User added successfully!');
        toast.success('User added successfully!');
        navigate('/users')
        
      } else {
        const data = await response.json();
        setError(data.message || 'Something went wrong!');
        toast.error('Error adding user:', data.message);
      }
    } catch (err) {
      setError(`An error occurred. Please try again, ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-200)] p-6">
      <Card className="max-w-4xl mx-auto bg-[var(--color-primary-200)] border-[var(--color-primary-100)] shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-[var(--color-secondary-900)]">
            Add Custom User
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="user_name" className="text-[var(--color-secondary-900)] font-medium">
                  User Name
                </Label>
                <Input
                  id="user_name"
                  type="text"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  required
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-[var(--color-secondary-900)] font-medium">
                  Company
                </Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => {
                    setFormData({ ...formData, company: value });
                    filterBranches(value);
                    filterWarehouses(value);
                  }}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch" className="text-[var(--color-secondary-900)] font-medium">
                  Branch
                </Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => setFormData({ ...formData, branch: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Branch" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse" className="text-[var(--color-secondary-900)] font-medium">
                  Warehouse
                </Label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Warehouse" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {filteredWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-[var(--color-secondary-900)] font-medium">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[var(--color-secondary-900)] font-medium">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--color-secondary-900)] font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[var(--color-secondary-900)] font-medium">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-[var(--color-secondary-900)] font-medium">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager" className="text-[var(--color-secondary-900)] font-medium">
                  Manager
                </Label>
                <Select
                  value={formData.manager}
                  onValueChange={(value) => setFormData({ ...formData, manager: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Manager" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift_timing" className="text-[var(--color-secondary-900)] font-medium">
                  Shift Timing
                </Label>
                <Select
                  value={formData.shift_timing}
                  onValueChange={(value) => setFormData({ ...formData, shift_timing: value })}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]">
                    <SelectValue placeholder="Select a Shift Timing" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {shifts.map((shiftTiming) => (
                      <SelectItem key={shiftTiming.id} value={shiftTiming.id.toString()}>
                        {shiftTiming.time_in + "-" + shiftTiming.time_out}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-[var(--color-secondary-900)] font-medium">
                  Rating
                </Label>
                <Input
                  id="rating"
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joinning_date" className="text-[var(--color-secondary-900)] font-medium">
                  Joining Date
                </Label>
                <Input
                  id="joinning_date"
                  type="date"
                  name="joinning_date"
                  value={formData.joinning_date}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_salary" className="text-[var(--color-secondary-900)] font-medium">
                  Base Salary
                </Label>
                <Input
                  id="base_salary"
                  type="number"
                  name="base_salary"
                  value={formData.base_salary}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="CNIC" className="text-[var(--color-secondary-900)] font-medium">
                  CNIC
                </Label>
                <Input
                  id="CNIC"
                  type="text"
                  name="CNIC"
                  value={formData.CNIC}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[var(--color-secondary-900)] font-medium">
                  Address
                </Label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)] rounded-md px-3 py-2 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="thumb_impression" className="text-[var(--color-secondary-900)] font-medium">
                  Thumb Impression
                </Label>
                <Input
                  id="thumb_impression"
                  type="file"
                  name="thumb_impression"
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="CNIC_copy" className="text-[var(--color-secondary-900)] font-medium">
                  CNIC Copy
                </Label>
                <div className="space-y-2">
                  {formData.CNIC_copy && (
                    <img
                      src={formData.CNIC_copy}
                      alt="CNIC Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-[var(--color-primary-100)]"
                    />
                  )}
                  <Input
                    id="CNIC_copy"
                    type="file"
                    name="CNIC_copy"
                    onChange={handleInputChange}
                    className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture" className="text-[var(--color-secondary-900)] font-medium">
                  Profile Picture
                </Label>
                <div className="space-y-2">
                  {formData.profile_picture && (
                    <img
                      src={formData.profile_picture}
                      alt="Profile Preview"
                      className="h-20 w-20 rounded-full object-cover border-2 border-[var(--color-primary-100)]"
                    />
                  )}
                  <Input
                    id="profile_picture"
                    type="file"
                    name="profile_picture"
                    onChange={handleInputChange}
                    className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="out_sourced"
                  name="out_sourced"
                  checked={formData.out_sourced}
                  onCheckedChange={(checked) => setFormData({ ...formData, out_sourced: checked })}
                  className="border-[var(--color-primary-100)] data-[state=checked]:bg-[var(--color-tertiary-600)] data-[state=checked]:border-[var(--color-tertiary-600)]"
                />
                <Label htmlFor="out_sourced" className="text-[var(--color-secondary-900)] font-medium">
                  Out Sourced
                </Label>
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                className="bg-[var(--color-tertiary-600)] text-white hover:bg-[var(--color-tertiary-500)] focus:ring-2 focus:ring-[var(--color-tertiary-500)] focus:ring-offset-2 px-8 py-3 text-lg font-medium"
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomUserForm;
