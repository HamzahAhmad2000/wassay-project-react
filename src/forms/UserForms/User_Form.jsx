import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getBranches, getCompanies, getWareHouses } from "/src/APIs/CompanyAPIs";

import { postUsers, getRoles, getShifts, getUsers } from "/src/APIs/UserAPIs";
import { toast } from 'react-toastify';


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
    <div className="form-container">
      <h2 className="form-heading">Add Custom User</h2>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      <form className="company-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User Name</label>
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
        <label>Company</label>
        <select
          name="company"
          className="form-input"
          value={formData.company}
          onChange={(e) => {
            handleInputChange(e);
            filterBranches(e.target.value); // Dynamically update branches based on the selected company
            filterWarehouses(e.target.value); // Dynamically update warehouses based on the selected company
          }}
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
        <label>Warehouses</label>
        <select
          name="warehouse"
          className="form-input"
          value={formData.warehouse}
          onChange={handleInputChange}
        >
          <option value="">Select a Warehouse</option>
          {filteredWarehouses.map((warehouse) => (
            <option value={warehouse.id} key={warehouse.id}>
              {warehouse.address}
            </option>
          ))}
        </select>
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
            type="text"
            name="role"
            className="form-input"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value={""}> Select a Role</option>
            {roles.map((role) => (
              <option value={role.id} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Out Sourced</label>
          <input
            type="checkbox"
            name="out_sourced"
            checked={formData.out_sourced}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Thumb Impression</label>
          <input
            type="file"
            name="thumb_impression"
            className="form-input"
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            className="form-input"
            value={formData.address}
            onChange={handleInputChange}
          ></textarea>
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
        </div>
        <div className="form-group">
           <div className="flex justify-between align-middle">
            <label>CNIC Copy</label>
            {formData.CNIC_copy && (
              <img
              src={formData.CNIC_copy}
              alt="Profile"
              className="profile-picture-preview h-20 w-20 rounded-full object-cover mb-2" // Added basic styling
              />
            )}
          </div>
          <input
            type="file"
            name="CNIC_copy"
            className="form-input"
            onChange={handleInputChange}
          />
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
        <div className="form-group">
          <label>Base Salary</label>
          <input
            type="number"
            name="base_salary"
            className="form-input"
            value={formData.base_salary}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Manager</label>
          <select
            type="text"
            name="manager"
            className="form-input"
            value={formData.manager}
            onChange={handleInputChange}
          >
            <option value={""}> Select a Manager</option>
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
            type="text"
            name="shift_timing"
            className="form-input"
            value={formData.shift_timing}
            onChange={handleInputChange}
          >
            <option value={""}> Select a Shift Timing</option>
            {shifts.map((shiftTiming) => (
              <option value={shiftTiming.id} key={shiftTiming.id}>
                {shiftTiming.time_in + "-" + shiftTiming.time_out}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Rating</label>
          <input
            type="number"
            name="rating"
            className="form-input"
            value={formData.rating}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <div className="flex justify-between align-middle">

            <label>Profile Picture</label>

            {formData.profile_picture && (
              <img
              src={formData.profile_picture}
              alt="Profile"
              className="profile-picture-preview h-20 w-20 rounded-full object-cover mb-2" // Added basic styling
              />
            )}
          </div>

          <input
            type="file"
            name="profile_picture"
            className="form-input"
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

export default CustomUserForm;
