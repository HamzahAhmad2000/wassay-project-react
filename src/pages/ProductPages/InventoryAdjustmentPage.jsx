import { useCallback, useEffect, useState } from "react";
import { approveInventoryAdjustments, getInventoryAdjustments } from "../../APIs/ProductAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import { hasPermission } from "../../utilityFunctions/unitilityFunctions"; // Adjust the import path
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import SearchFilter from "../../components/SearchFilter";
import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Import the custom hook
import { toast } from "react-toastify";
import { formatDate } from "/src/utils/dateUtils";
import ImageModal from "/src/components/ImageModal";


const InventoryAdjustmentPage = () => {
  const navigate = useNavigate();
  const [canUpdate, setCanUpdate] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  useEffect(() => {
    hasPermission("change_inventory")
      .then((hasPermission) => setCanUpdate(hasPermission))
      .catch((error) => console.error("Error checking permissions:", error));
  }, []);

  const fetchInventoriesData = useCallback(async () => {
    const response = await getInventoryAdjustments();
    console.log("Fetched inventories:", response);
    return response;
  }, []);

  const { data: inventories, isLoading, searchTerm, setSearchTerm } = useFetchAndFilter(
    fetchInventoriesData,
    'inventories'
  );

  const handleApprove = async (inventoryId) => {
    const inventory = inventories.find((c) => c.id === inventoryId);

    console.log("Inventory to approve:", inventory);

    if (inventory) {
      if (user) {
        const approved = await approveInventoryAdjustments({approved_by: user.id}, inventoryId)
        console.log("Approval response:", approved);
        if (approved.id){
          toast.success("Inventory adjustment approved successfully.");
          // Optionally, you can refresh the data or navigate to another page
          // fetchInventoriesData(); // Uncomment if you want to refresh the data
        }
        else if (approved.non_field_errors){
          toast.error(approved.non_field_errors);
        }
        else if (approved.quantity_adjusted) {
          toast.error(approved.quantity_adjusted);
        
        }
      } else {
        toast.error("You do not have permission to approve this inventory adjustment.");
      }
    }
  };

  const inventoryHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company", sortable: true },
    { label: "Branch", key: "branch", sortable: true },
    { label: "Warehouse", key: "warehouse", sortable: true },
    { label: "Product", key: "product", sortable: true },
    { label: "Quantity", key: "quantity_adjusted", sortable: true },
    { label: "Recorded By", key: "recorded_by", sortable: true },
    { label: "Adjustment Type", key: "adjustment_type", sortable: true },
    { label: "Comment", key: "comment", sortable: false },
    { label: "Reason", key: "reason", sortable: false },
    { label: "Approved By", key: "approved_by", sortable: true },
      { label: "Image", key: "image", sortable: false },

    { label: "Created At", key: "created_at", sortable: true },
    { label: "Updated At", key: "update_at", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const inventoryData = inventories.map((inventory, index) => ({
    serial_no: index + 1,
    company: inventory.company || "N/A",
    branch: inventory.branch || "N/A",
    warehouse: inventory.warehouse || "N/A",
    product: inventory.product || "N/A",
    quantity_adjusted: inventory.quantity_adjusted || "N/A",
    recorded_by: inventory.recorded_by || "N/A",
    adjustment_type: inventory.adjustment_type || "N/A",
    comment: inventory.comment || "None",
    reason: inventory.reason || "N/A",
    approved_by: inventory.approved_by || "N/A",
    image: inventory.image ? (
        <img
          src={inventory.image}
          alt="Inventory Image"
          className="h-10 w-10 object-contain rounded"
          onClick={() => setSelectedImage(`${inventory.image}`)}

        />
      ) : (
        "No Image"
      ),
    created_at: formatDate(inventory.created_at) || "N/A",
    update_at: formatDate(inventory.updated_at) || "N/A",
    actions: !inventory.approved_by ? (
      <button className="action-button update-button" onClick={() => handleApprove(inventory.id)}>
        Approve
      </button>
    ) : "Already Approved",
  }));

  return (
    <div className="inventory-page">
      <h1 className="page-title">Inventory Details</h1>

      <div className="filter-section mb-4 flex items-center justify-between px-4">
        <div className="flex-1 flex justify-center">
          <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search inventories..." />
        </div>

        <Link to="/add-inventory-adjustment">
          <button className="action-button add-button">Add Inventory Adjustment</button>
        </Link>
      </div>

      {isLoading ? (
        <p>Loading inventories...</p>
      ) : (
        <ReusableTable headers={inventoryHeaders} data={inventoryData} />
        
      )}
       <ImageModal
          isOpen={!!selectedImage}
          imageSrc={selectedImage}
          altText="Enlarged Bill" // You can make this dynamic if needed
          onClose={() => setSelectedImage(null)}
        />
    </div>
  );
};

export default InventoryAdjustmentPage;