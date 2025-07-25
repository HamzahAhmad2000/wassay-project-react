import { useState, useEffect } from "react";
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { createUsers, getRoles, getShifts, getUsers } from "/src/APIs/UserAPIs";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

// Import Origin UI components
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Checkbox } from "../../additionalOriginuiComponents/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    user_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    role: "",
    company: "",
    branch: "",
    warehouse: "",
    manager: "",
    shift_timing: "",
    
    out_sourced: false,
    thumb_impression: null,
    address: '',
    CNIC: '',
    CNIC_copy: null,
    joinning_date: '',
    base_salary: '',
    profile_picture: null,
  });
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([])
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [managers, setManagers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch roles, companies, branches, managers, and shifts
    const fetchData = async () => {
      try {
        const [rolesData, companiesData, branchesData, warehousesData, usersData, shiftsData] =
          await Promise.all([getRoles(), getCompanies(), getBranches(), getWareHouses(), getUsers(), getShifts()]);
        setRoles(rolesData);
        setCompanies(companiesData);
        setBranches(branchesData);
        setWarehouses(warehousesData);
        setManagers(usersData);
        setShifts(shiftsData);
      } catch (err) {
        setError("Error fetching data. Please try again.", err);
      }
    };

    fetchData();
  }, []);


  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({ ...formData, [name]: value });

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
      // setFormData({ ...formData, [name]: null });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if(name === "company"){
        formData.company = value;
    }

    if (name === "company") {
      // Filter branches based on selected company
      const filteredBranches = branches.filter((branch) => branch.company_id === parseInt(value));
      setFilteredBranches(filteredBranches);
      const filteredWarehouses = warehouses.filter((warehouse) => warehouse.company_id === parseInt(value));
      setFilteredWarehouses(filteredWarehouses);
      setFormData({ ...formData, branch: "", warehouse: "" }); // Reset branch when company changes
    }
    if (formData.thumb_impression && !(formData.thumb_impression instanceof File)) {
          toast.error("thumb_impression is not a valid file");
        }
        if (formData.profile_picture && !(formData.profile_picture instanceof File)) {
          toast.error("profile_picture is not a valid file");
        }
        if (formData.CNIC_copy && !(formData.CNIC_copy instanceof File)) {
          toast.log("CNIC_copy is not a valid file");
        }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    const form = new FormData();
  
    Object.keys(formData).forEach((key) => {
      if (['CNIC_copy', 'profile_picture', 'thumb_impression'].includes(key)) {
        if (formData[key] instanceof File) {
          form.append(key, formData[key]);
        }
      } else {
        form.append(key, formData[key] ?? ''); // Ensure empty values are included
      }
    });
  
    try {
      const response = await createUsers(form);
  
      if (response.errors) {
        // If backend returns validation errors
        const errorMessages = Object.entries(response.errors)
          .map(([messages, msg]) => {
            return `${messages} : ${msg[0]}\n`})
          .join('\n');
  
        setError(errorMessages);
        toast.error(`${errorMessages}`);
        return;
      }
  
      // Success case
      setSuccess('User added successfully!');
      toast.success('User added successfully!');
      setTimeout(() => navigate("/users"), 1500);

    } catch (err) {
      console.error('Request failed:', err);
  
      const errorMessage =
        err.response?.data?.message ||
        'An error occurred. Please try again later.';
  
      setError(errorMessage);
      toast.error(`An error occurred: ${errorMessage}`);
    }
  };
  
  
  return (
    <div className="min-h-screen bg-[var(--color-primary-200)] p-6">
      <ToastContainer />
      <Card className="max-w-4xl mx-auto bg-[var(--color-primary-200)] border-[var(--color-primary-100)] shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold text-[var(--color-secondary-900)]">
            Signup Form
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</p>}
          {success && <p className="text-green-600 bg-green-50 p-3 rounded-md border border-green-200">{success}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="user_name" className="text-[var(--color-secondary-900)] font-medium">
                  Username
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
                <Label htmlFor="password" className="text-[var(--color-secondary-900)] font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
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
                <Label htmlFor="company" className="text-[var(--color-secondary-900)] font-medium">
                  Company
                </Label>
                <Select
                  value={formData.company}
                  onValueChange={(value) => {
                    setFormData({ ...formData, company: value });
                    const filteredBranches = branches.filter((branch) => branch.company_id === parseInt(value));
                    setFilteredBranches(filteredBranches);
                    const filteredWarehouses = warehouses.filter((warehouse) => warehouse.company_id === parseInt(value));
                    setFilteredWarehouses(filteredWarehouses);
                    setFormData(prev => ({ ...prev, branch: "", warehouse: "" }));
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
                  disabled={!filteredBranches.length}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)] disabled:opacity-50">
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
                  disabled={!filteredWarehouses.length}
                >
                  <SelectTrigger className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)] disabled:opacity-50">
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
                    <SelectValue placeholder="Select a Shift" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)]">
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id.toString()}>
                        {shift.time_in + "-" + shift.time_out}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <small className="text-[var(--color-secondary-800)] text-sm">Please provide a valid 13-digit CNIC number</small>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-[var(--color-secondary-900)] font-medium">
                  Address
                </Label>
                <Input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
                <small className="text-[var(--color-secondary-800)] text-sm">Please provide a detailed address</small>
                <small className="text-[var(--color-secondary-800)] text-sm block">Include house number, street name, city, state, and zip code</small>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="profile_picture" className="text-[var(--color-secondary-900)] font-medium">
                  Profile Picture
                </Label>
                <Input
                  id="profile_picture"
                  type="file"
                  name="profile_picture"
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
                {formData.profile_picture && (
                  <img 
                    src={getImagePreviewSrc(formData.profile_picture)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md border-2 border-[var(--color-primary-100)]" 
                  />
                )}
              </div>

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
                {formData.thumb_impression && (
                  <img 
                    src={getImagePreviewSrc(formData.thumb_impression)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md border-2 border-[var(--color-primary-100)]" 
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="CNIC_copy" className="text-[var(--color-secondary-900)] font-medium">
                  CNIC Copy
                </Label>
                <Input
                  id="CNIC_copy"
                  type="file"
                  name="CNIC_copy"
                  onChange={handleInputChange}
                  className="bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-secondary-900)] focus:border-[var(--color-tertiary-500)] focus:ring-[var(--color-tertiary-500)]"
                />
                {formData.CNIC_copy && (
                  <img 
                    src={getImagePreviewSrc(formData.CNIC_copy)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md border-2 border-[var(--color-primary-100)]" 
                  />
                )}
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

export default SignupForm;
