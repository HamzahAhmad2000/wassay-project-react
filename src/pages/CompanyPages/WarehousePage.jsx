import { useEffect, useState } from "react";
import { getWareHouses, deleteWarehouses } from "../../APIs/CompanyAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";

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
        <Button
          onClick={() => handleUpdate(warehouse.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(warehouse.id)}
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    ),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Warehouse Details</h1>
      </div>
      
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Warehouse"}
        onButtonClick={() => {
          navigate(`/add-warehouse`);
        }}
      />
      
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-[#101023]">Loading warehouses...</p>
        </div>
      ) : (
        <ReusableTable headers={warehouseHeaders} data={warehouseData} />
      )}
    </div>
  );
};

export default WarehousePage;