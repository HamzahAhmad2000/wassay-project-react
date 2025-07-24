import { useState, useEffect } from "react";
import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";
import { createUsers, getRoles, getShifts, getUsers } from "/src/APIs/UserAPIs";
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { getImagePreviewSrc } from "/src/utils/imageUtil";

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
    <div className="form-container">
      <ToastContainer />
      <h2 className="form-heading">Signup Form</h2>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="user_name"
            className="form-input"
            value={formData.user_name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          
          <label>Profile Picture</label>

          <input
            type="file"
            name="profile_picture"
            className="form-input"
            onChange={handleInputChange}
          />

          
                    
                    {formData.profile_picture &&
                      // Display the profile_picture preview if an profile_picture is selected
                      <img src={getImagePreviewSrc(formData.profile_picture)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                    }
        </div>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            className="form-input"
            value={formData.first_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            className="form-input"
            value={formData.last_name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            name="role"
            className="form-input"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="">Select a Role</option>
            {roles.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Company</label>
          <select
            name="company"
            className="form-input"
            value={formData.company}
            onChange={handleInputChange}
          >
            <option value="">Select a Company</option>
            {companies.map((company) => (
              <option value={company.id} key={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Branch</label>
          <select
            name="branch"
            className="form-input"
            value={formData.branch}
            onChange={handleInputChange}
            disabled={!filteredBranches.length}
          >
            <option value="">Select a Branch</option>
            {filteredBranches.map((branch) => (
              <option value={branch.id} key={branch.id}>
                {branch.address}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Warehousw</label>
          <select
            name="warehouse"
            className="form-input"
            value={formData.warehouse}
            onChange={handleInputChange}
            disabled={!filteredWarehouses.length}
          >
            <option value="">Select a Warehous</option>
            {filteredWarehouses.map((warehouse) => (
              <option value={warehouse.id} key={warehouse.id}>
                {warehouse.address}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Manager</label>
          <select
            name="manager"
            className="form-input"
            value={formData.manager}
            onChange={handleInputChange}
          >
            <option value="">Select a Manager</option>
            {managers.map((manager) => (
              <option value={manager.id} key={manager.id}>
                {manager.user_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Shift Timing</label>
          <select
            name="shift_timing"
            className="form-input"
            value={formData.shift_timing}
            onChange={handleInputChange}
          >
            <option value="">Select a Shift</option>
            {shifts.map((shift) => (
              <option value={shift.id} key={shift.id}>
                {shift.time_in + "-" + shift.time_out}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Out Sourced</label>
          <input type="checkbox" name="out_sourced" onChange={handleInputChange} />
        </div>

        <div className="form-group">
          
          <label>Thumb Impression</label>

          <input
            type="file"
            name="thumb_impression"
            className="form-input"
            onChange={handleInputChange}
          />

          
          
          {formData.thumb_impression &&
            // Display the thumb_impression preview if an thumb_impression is selected
            <img src={getImagePreviewSrc(formData.thumb_impression)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>
        <div className="form-group">
          <label>CNIC</label>
          <input
            type="text"
            name="CNIC"
            className="form-input"
            value={formData.CNIC}
            onChange={handleInputChange}
          />
          <small>Please provide a valid 13-digit CNIC number</small>
        </div>
        <div className="form-group">
          <label>CNIC Copy</label>
          <input
            type="file"
            name="CNIC_copy"
            className="form-input"
            onChange={handleInputChange}
          />
          
          
          {formData.CNIC_copy &&
            // Display the CNIC_copy preview if an CNIC_copy is selected
            <img src={getImagePreviewSrc(formData.CNIC_copy)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>
        <div className="form-group">
          <label>Address</label>
          <input
            type="text"
            name="address"
            className="form-input"
            value={formData.address}
            onChange={handleInputChange}
          />
          <small>Please provide a detailed address</small>
          <small>Include house number, street name, city, state, and zip code</small>
        </div>
       
        <div className="form-group">
          <label>Joining Date</label>
          <input
            type="date"
            name="joinning_date"
            className="form-input"
            value={formData.joinning_date}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
