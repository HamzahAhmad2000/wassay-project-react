import { useCallback } from "react";
import { getUsers, deleteUsers } from "../../APIs/UserAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter"; // Import the reusable search filter
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { formatDate } from "../../utils/dateUtils"; // Assuming you have a date utility function
import { toast } from "react-toastify";

const UserPage = () => {
  const navigate = useNavigate();

  const fetchUsersData = useCallback(async () => {
    const response = await getUsers();
    return response;
  }, []);

  const { data: users, isLoading, searchTerm, setSearchTerm, setData: setUsers } = useFetchAndFilter(
    fetchUsersData,
    'users'
  );

  const handleUpdate = (userId) => {
    const user = users.find((c) => c.id === userId);
    if (user) {
      navigate(`/update-user/${userId}`, { state: { user } });
    } else {
      toast.error(`User with ID ${userId} not found.`);
    }
  };

  const handleDeleteUser = (userId) => {
    handleDelete(userId, deleteUsers, setUsers, 'user', () => {
      toast.success("User deleted successfully.");
    });
  };

  const userHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    {
      label: "DP",
      key: "profile_picture",
      render: (user) =>
        user.profile_picture ? (
          <img
            src={user.profile_picture}
            alt="User"
            className="company-logo w-10 h-10 rounded-full object-cover" // Added basic styling
          />
        ) : (
          "No Image"
        ),
    },
    { label: "Username", key: "user_name", sortable: true },
    { label: "Fullname", key: "fullname", sortable: true, render: (user) => `${user.first_name || ''} ${user.last_name || ''}` },
    { label: "Email", key: "email", sortable: true },
    { label: "Phone No.", key: "phone", sortable: true },
    { label: "Role", key: "role_name", sortable: true },
    { label: "Company", key: "company", sortable: true }, // Assuming 'company' holds the name directly
    { label: "Branch", key: "branch", sortable: true }, // Assuming 'branch' holds the name directly
    { label: "CNIC", key: "CNIC", sortable: true },
    { label: "Address", key: "address", sortable: true },
    { label: "Joining Date", key: "joinning_date", sortable: true, render: (user) => formatDate(user.joinning_date) },
    { label: "Base Salary", key: "base_salary", sortable: true },
    { label: "Manager", key: "manager", sortable: true }, // Assuming 'manager' holds the name directly
    { label: "Shift", key: "shift_timing", sortable: true },
    { label: "Rating", key: "rating", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const userData = users.map((user, index) => ({
    serial_no: index + 1,
    ...user, // Spread user properties
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(user.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button"
          onClick={() => handleDeleteUser(user.id)}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="user-page p-6">
      <h1 className="page-title text-2xl font-bold mb-6">User Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Search users..."
        buttonText="Add User"
        onButtonClick={() => navigate("/add-user")}
      />
      {isLoading ? (
        <p className="text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <ReusableTable headers={userHeaders} data={userData} />
        </div>
      )}
    </div>
  );
};

export default UserPage;