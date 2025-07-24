import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { getPermissions, getRoles, postRoles } from "/src/APIs/UserAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import PropTypes from "prop-types";
import { toast } from "react-toastify";


const animatedComponents = makeAnimated();

const RoleForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.role || {};
  const navigate = useNavigate();

  // Consolidated state object
  const [roleData, setRoleData] = useState({
    name: existingData?.name || "",
    company: existingData?.company || user.company || "",
    upper_role: existingData?.upper_role || "",
    description: existingData?.description || "",
    permissions: existingData?.permissions?.map((p) => ({ value: p.id, label: p.name })) || [],
  });

  const [options, setOptions] = useState({
    companies: [],
    upperRoles: [],
    permissions: [],
  });

  const [status, setStatus] = useState({ error: "", success: "" });

  // Handle input change
  const handleChange = (field, value) => {
    setRoleData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token).catch(() => navigate("/login"));
    }
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [companies, roles, permissions] = await Promise.all([
          getCompanies(),
          getRoles(),
          getPermissions(),
        ]);
        setOptions({
          companies,
          upperRoles: roles,
          permissions: permissions.map((p) => ({ value: p.id, label: p.name,category: p.content_type, // Group by module/category
          })),
        });
      } catch (error) {
        setStatus({ error: "Failed to fetch data. Please try again." + error, success: "" });
      }
    }

    fetchData();
  }, []);

  
  // Grouped permissions by category
  const groupedPermissions = options.permissions.reduce((acc, perm) => {
    const category = perm.category || "General";
    if (!acc[category]) acc[category] = { label: category, options: [] };
    acc[category].options.push(perm);
    return acc;
  }, {});

  
  // Handle "Select All" click
  const handleSelectAll = (category) => {
    const categoryOptions = groupedPermissions[category].options;
    const selectedPermissions = roleData.permissions || [];

    // Check if all are selected
    const allSelected = categoryOptions.every((p) => selectedPermissions.some((sp) => sp.value === p.value));

    // Toggle: If all selected -> Remove all, else Add all
    const newPermissions = allSelected
      ? selectedPermissions.filter((p) => !categoryOptions.some((cp) => cp.value === p.value)) // Remove
      : [...selectedPermissions, ...categoryOptions.filter((cp) => !selectedPermissions.some((sp) => sp.value === cp.value))]; // Add

    handleChange("permissions", newPermissions);
  };


  useEffect(() => {
    if (status.success || status.error) {
      const timeout = setTimeout(() => setStatus({ error: "", success: "" }), 1000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const validateForm = () => {
    if (!roleData.company) return setStatus({ error: "Company is required.", success: "" }), false;
    if (!roleData.name) return setStatus({ error: "Name is required.", success: "" }), false;
    if (roleData.permissions.length === 0)
      return setStatus({ error: "At least one permission must be selected.", success: "" }), false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: "", success: "" });

    if (!validateForm()) return;

    const body = {
      ...roleData,
      permissions: roleData.permissions.map((p) => p.value),
      name: !roleData.name.includes(` ${roleData.company}`)? roleData.name.trim() + " " + roleData.company : roleData.name.trim(),
    };

    try {
      const response =
        mode === "add"
          ? await postRoles(body)
          : existingData?.id
          ? await postRoles(body, existingData.id)
          : null;

      if (response.id) {
        setStatus({ error: "", success: mode === "add" ? "Role added!" : "Role updated!" });
        toast.success(mode == "add" ? "Role added!" : "Role updated!");
      setTimeout(() => navigate("/roles"), 1500);

      } else {
        const data = await response.json();
        setStatus({ error: data.detail || "Operation failed.", success: "" });
        toast.error(data.detail || "Operation failed.");
      }
    } catch {
      setStatus({ error: "An error occurred. Please try again.", success: "" });
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">{mode === "add" ? "Add Role" : "Edit Role"}</h2>
      <form className="company-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={roleData.name} onChange={(e) => handleChange("name", e.target.value)} required className="form-input" />
        </div>
        {user && user.is_superuser && (

          <div className="form-group">
            <label>Company:</label>
            <select value={roleData.company} onChange={(e) => handleChange("company", e.target.value)} required className="form-input">
              <option value="" disabled>Select a Company</option>
              {options.companies.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
          )}

        <div className="form-group">
          <label>Upper Role:</label>
          <select value={roleData.upper_role} onChange={(e) => handleChange("upper_role", e.target.value)} className="form-input">
            <option value="" disabled>Select an upper role</option>
            {options.upperRoles.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </div>

    <div className="form-group">
      <label htmlFor="multi-select" className="text-sm font-medium text-gray-700">
        Select Permissions:
      </label>
      <Select
        id="multi-select"
        options={Object.entries(groupedPermissions).map(([category, group]) => ({
          label: (
            <div className="flex justify-between items-center">
              <span>{category}</span>
              <button
                type="button"
                className="text-blue-500 text-xs underline ml-2"
                onClick={() => handleSelectAll(category)}
              >
                Select All
              </button>
            </div>
          ),
          options: group.options,
        }))}
        isMulti
        onChange={(value) => handleChange("permissions", value)}
        value={roleData.permissions}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200"
        closeMenuOnSelect={false}
        components={animatedComponents}
        isSearchable
      />
    </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea rows="3" value={roleData.description} onChange={(e) => handleChange("description", e.target.value)} className="form-input" />
        </div>

        {status.error && <p className="error-text">{status.error}</p>}
        {status.success && <p className="success-text">{status.success}</p>}

        <button type="submit" className="submit-button">{mode === "add" ? "Add Role" : "Update Role"}</button>
      </form>
    </div>
  );
};

RoleForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default RoleForm;
