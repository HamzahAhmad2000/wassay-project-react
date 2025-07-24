import { useCallback, useEffect } from "react";
import { getRoles, deleteRoles, getPermissions } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { toast } from "react-toastify";

const RolePage = () => {
  const navigate = useNavigate();

  // Fetch roles using the custom hook
  const fetchRolesData = useCallback(async () => {
    const response = await getRoles();
    return response;
  }, []);

  const { data: roles, isLoading, searchTerm, setSearchTerm, setData: setRoles } = useFetchAndFilter(
    fetchRolesData,
    'roles'
  );

  // Fetch permissions (kept the original logic, might be needed elsewhere)
  useEffect(() => {
    getPermissions()
      .catch((error) => {
        console.error("Error fetching permissions:", error);
        // Optionally add a toast notification here if needed
      });
  }, []);

  const handleUpdate = (roleId) => {
    const role = roles.find((c) => c.id === roleId);
    if (role) {
      navigate(`/update-role/${roleId}`, { state: { role } });
    } else {
      toast.error(`Role with ID ${roleId} not found.`);
    }
  };

  const handleDeleteRole = (roleId) => {
    handleDelete(roleId, deleteRoles, setRoles, 'role', () => {
      toast.success("Role deleted successfully.");
    });
  };

  const roleHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Name", key: "name", sortable: true },
    { label: "Company", key: "company", sortable: true }, // Assuming 'company' holds the name/ID
    {
      label: "Permissions",
      key: "permissions",
      render: (role) =>
        role.permissions && role.permissions.length > 0
          ? role.permissions.slice(0, 5).map((p) => p.name).join(", ") + (role.permissions.length > 5 ? "..." : "")
          : "N/A",
    },
    { label: "Upper Role", key: "upper_role", sortable: true }, // Assuming 'upper_role' holds the name/ID
    { label: "Description", key: "description", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const roleData = roles.map((role, index) => ({
    serial_no: index + 1,
    ...role, // Spread role properties
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(role.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDeleteRole(role.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="role-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">Role Details</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Optional Search Filter */}
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search roles..."
          // Hide the button part of SearchFilter if you prefer the Link below
          // buttonText="" // Hide button
          // onButtonClick={() => {}}
        />
        <Link to="/add-role">
          <button className="action-button add-button ml-4">Add Role</button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-gray-500">No roles found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={roleHeaders} data={roleData} />
        </div>
      )}
    </div>
  );
};

export default RolePage;