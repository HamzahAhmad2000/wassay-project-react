import { getCustomers, deleteCustomers } from '../../APIs/CustomerAPIs';
import SearchFilter from '../../components/SearchFilter';
import ReusableTable from '../../components/ReusableTable';
import { Pencil, Trash2 } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import useFetchAndFilter from '../../hooks/useFetchAndFilter';
import { useNavigate } from 'react-router-dom';
import { handleUpdate, handleDelete } from '../../utils/crudUtils';



const CustomerPage = () => {
  const navigate = useNavigate();
  const { data: customers, isLoading, searchTerm, setSearchTerm, setData: setCustomers } = useFetchAndFilter(getCustomers, 'customers');

  const handleUpdateCustomer = (customerId) => {
    handleUpdate(customerId, customers, navigate, (id) => `/update-customer/${id}`, 'customers');
  };

  const handleDeleteCustomer = (customerId) => {
    handleDelete(customerId, deleteCustomers, setCustomers, 'customers');
  };

  const customerHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "First Name", key: "first_name", sortable: true },
    { label: "Last Name", key: "last_name", sortable: true },
    { label: "Email", key: "email", sortable: true },
    { label: "Phone Number", key: "phone_number", sortable: true },
    { label: "Address", key: "address", sortable: true },
    { label: "Age", key: "age", sortable: true },
    { label: "DOB", key: "DOB", sortable: true },
    { label: "Gender", key: "gender", sortable: true },
    { label: "Created At", key: "created_at_formatted", sortable: true },
    { label: "Updated At", key: "updated_at_formatted", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const customerData = customers.map((customer, index) => ({
    serial_no: index + 1,
    first_name: customer.first_name || "N/A",
    last_name: customer.last_name || "N/A",
    email: customer.email || "N/A",
    phone_number: customer.phone_number || "N/A",
    address: customer.address || "N/A",
    age: customer.age || "N/A",
    DOB: customer.DOB || "N/A",
    gender: customer.gender || "N/A",
    created_at_formatted: customer.created_at ? new Date(customer.created_at).toLocaleString() : "N/A",
    updated_at_formatted: customer.updated_at ? new Date(customer.updated_at).toLocaleString() : "N/A",
    actions: (
      <div className="flex space-x-2">
        <button onClick={() => handleUpdateCustomer(customer.id)} className="...">
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button onClick={() => handleDeleteCustomer(customer.id)} className="...">
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="customer-page">
      <ToastContainer />
      <h1 className="page-title">Customer Details</h1>
      <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} buttonText="Add Customer" onButtonClick={() => navigate('/add-customer')} />
      {isLoading ? <p>Loading customers...</p> : <ReusableTable headers={customerHeaders} data={customerData} />}
    </div>
  );
};

export default CustomerPage;