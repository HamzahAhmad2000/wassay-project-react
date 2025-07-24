import { useCallback, useEffect, useState } from "react";
import { getInventories } from "../../APIs/ProductAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import { hasPermission } from "../../utilityFunctions/unitilityFunctions"; // Adjust the import path
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter";
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { toast } from "react-toastify";

const InventoryPage = () => {
  const navigate = useNavigate();
  const [canUpdate, setCanUpdate] = useState(false);
  

  useEffect(() => {
    hasPermission("change_inventory")
      .then((hasPermission) => setCanUpdate(hasPermission))
      .catch((error) => console.error("Error checking permissions:", error));
  }, []);

  const fetchInventoriesData = useCallback(async () => {
    const response = await getInventories();
    return response;
  }, []);

  const { data: inventories, isLoading, searchTerm, setSearchTerm } = useFetchAndFilter(
    fetchInventoriesData,
    'inventories'
  );

  const handleUpdate = (inventoryId) => {
    const inventory = inventories.find((c) => c.id === inventoryId);
    if (inventory) {
      navigate(`/update-inventory/${inventoryId}`, { state: { inventory } });
    } else {
      toast.error(`Inventory with ID ${inventoryId} not found.`);
    }
  };

  const inventoryHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Product", key: "product_name", sortable: true },
    { label: "Weight/Units", key: "product_weight", sortable: true },
    { label: "Quantity in Stock", key: "quantity_in_stock", sortable: true },
    { label: "Availability", key: "product_status", sortable: true },
    { label: "Cost Price", key: "cost_price", sortable: true },
    { label: "Discounted Price", key: "discounted_price", sortable: true },
    { label: "Retail Price", key: "retail_price", sortable: true },
    { label: "Manufacturing Date", key: "manufacturing_date", sortable: true },
    { label: "Expiry Date", key: "expiry_date", sortable: true },
    { label: "Supplier", key: "supplier_name", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const inventoryData = inventories.map((inventory, index) => ({
    serial_no: index + 1,
    product_name: inventory.product_name || "N/A",
    product_weight: inventory.product_weight ? (inventory.product_weight + " " + inventory.unit) : ("N/A"),
    quantity_in_stock: inventory.quantity_in_stock || 0,
    product_status: inventory.product_status || "N/A",
    cost_price: inventory.cost_price || "N/A",
    discounted_price: inventory.discounted_price || 0.0,
    retail_price: inventory.retail_price || "N/A",
    manufacturing_date: inventory.manufacturing_date || "N/A",
    expiry_date: inventory.expiry_date || "N/A",
    supplier_name: inventory.supplier_name || "N/A",
    actions: canUpdate ? (
      <button className="action-button update-button" onClick={() => handleUpdate(inventory.id)}>
        Update Expiry
      </button>
    ) : null,
  }));

  return (
    <div className="inventory-page">
      <h1 className="page-title">Inventory Details</h1>

      <div className="filter-section mb-4 flex items-center justify-between px-4">
        <div className="flex-1 flex justify-center">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search inventories..." />
        </div>
        <Link to="/add-inventory">
          {/* The button is intentionally left out as per the original component */}
        </Link>
      </div>

      {isLoading ? (
        <p>Loading inventories...</p>
      ) : (
        <ReusableTable headers={inventoryHeaders} data={inventoryData} />
      )}
    </div>
  );
};

export default InventoryPage;