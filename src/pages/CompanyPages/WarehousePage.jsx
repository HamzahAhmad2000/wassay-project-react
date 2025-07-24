import { useEffect, useState } from "react";
import { getWareHouses, deleteWarehouses } from "../../APIs/CompanyAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WarehousePage = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredWarehouse, setFilteredWarehouse] = useState([]);

  useEffect(() => {
    fetchWarehousesData();
  }, []);

  const fetchWarehousesData = async () => {
    setIsLoading(true);
    try {
      const data = await getWareHouses();
      setWarehouses(data);
      setFilteredWarehouse(data);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("Error fetching warehouses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = warehouses;
    if (searchTerm) {
      filtered = filtered.filter((warehouse) =>
        Object.keys(warehouse).some((key) => {
          const value = warehouse[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredWarehouse(filtered);
  }, [searchTerm, warehouses]);

  const handleUpdate = (warehouseId) => {
    const warehouse = warehouses.find((c) => c.id === warehouseId);
    if (warehouse) {
      navigate(`/update-warehouse/${warehouseId}`, { state: { warehouse } });
    } else {
      console.error(`Warehouse with ID ${warehouseId} not found.`);
      toast.error(`Warehouse with ID ${warehouseId} not found.`);
    }
  };

  const handleDelete = async (warehouseId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this warehouse?");
    if (confirmDelete) {
      try {
        const response = await deleteWarehouses(warehouseId);
        const data = await response.json();
        if (response.ok) {
          setWarehouses(warehouses.filter((warehouse) => warehouse.id !== warehouseId));
          toast.success("Warehouse deleted successfully.");
        } else {
          console.error("Failed to delete warehouse:", data.error || "Error deleting warehouse");
          toast.error(`Failed to delete warehouse: ${data.error || "Error deleting warehouse"}`);
        }
      } catch (error) {
        toast.error("Error deleting warehouse:", error);
        console.error("Error deleting warehouse:", error);
      }
    }
  };

  const warehouseHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "Location", key: "location", sortable: true },
    { label: "Address", key: "address", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const warehouseData = filteredWarehouse.map((warehouse, index) => ({
    serial_no: index + 1,
    company: warehouse.company || "N/A", // Adjust based on your API response structure
    location: warehouse.location || "N/A",
    address: warehouse.address || "N/A",
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleUpdate(warehouse.id)}
          className="inline-flex items-center px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          onClick={() => handleDelete(warehouse.id)}
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="warehouse-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="page-title">Warehouse Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Warehouse"}
        onButtonClick={() => {
          navigate(`/add-warehouse`);
        }}
      />
      {isLoading ? (
        <p>Loading warehouses...</p>
      ) : (
        <ReusableTable headers={warehouseHeaders} data={warehouseData} />
      )}
    </div>
  );
};

export default WarehousePage;