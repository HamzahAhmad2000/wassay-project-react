import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { getCompanies } from "/src/APIs/CompanyAPIs";
import { getPermissions, getRoles, postRoles } from "/src/APIs/UserAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../additionalOriginuiComponents/ui/card";
import { Select as OriginSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Role" : "Edit Role"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={roleData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <OriginSelect value={roleData.company} onValueChange={(value) => handleChange("company", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.companies.map((option) => (
                        <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </OriginSelect>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="upper_role" className="text-[#101023] font-medium">Upper Role</Label>
                <OriginSelect value={roleData.upper_role} onValueChange={(value) => handleChange("upper_role", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an upper role" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.upperRoles.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                    ))}
                  </SelectContent>
                </OriginSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="multi-select" className="text-[#101023] font-medium">
                  Select Permissions
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">Description</Label>
                <textarea
                  rows="3"
                  id="description"
                  value={roleData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              {status.error && <p className="text-red-600 text-sm">{status.error}</p>}
              {status.success && <p className="text-green-600 text-sm">{status.success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/roles')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Role" : "Update Role"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

RoleForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default RoleForm;
