import { useEffect, useState } from "react";
import { getInventoryTransfers, deleteInventoryTransfers } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";

const InventoryTransfer = () => {
  const navigate = useNavigate()
  const [inventoryTransfer, setInventoryTransfer] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    getInventoryTransfers()
      .then((inventoryTransfer) => {
        setInventoryTransfer(inventoryTransfer);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inventory Transfer:", error);
        alert("Failed to load inventory Transfer. Please try again.");
        setIsLoading(false);
      });
  }, []);
  

  const handleUpdate = (inventoryTransferId) => {
    const inventoryTransfer = inventoryTransfer.find((c) => c.id === inventoryTransferId); // Get the matching inventoryTransfer
    if (inventoryTransfer) {
      navigate(`/add-inventory-transfer/`, { state: { inventoryTransfer } });
    } else {
      console.error(`Inventory Transfer with ID ${inventoryTransferId} not found.`);
    }
  };
  

  const handleDelete = (inventoryTransferId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this inventoryTransfer?");
    if (confirmDelete) {
      deleteInventoryTransfers(inventoryTransferId)
        .then((response) => {
          if (response.ok) {
            setInventoryTransfer(inventoryTransfer.filter((inventoryTransfer) => inventoryTransfer.id !== inventoryTransferId));
          } else {
            console.error("Failed to delete inventoryTransfer:", response.status);
            alert("Failed to delete the inventoryTransfer. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting inventoryTransfer:", error);
          alert("An error occurred. Unable to delete the inventoryTransfer at this time.");
        });
    }
  };
  
  

  return (
    <div className="inventoryTransfer-page">
      <h1 className="page-title">Inventory Transfer Details</h1>

      <Link to="/add-inventoryTransfer">
        <button className="action-button add-button">Add Inventory Transfer</button>
      </Link>
      {isLoading ? (
        <p>Loading inventoryTransfer...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Company</th>
              <th>From</th>
              <th>To</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Placement</th>
              <th>Recorded By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryTransfer.map((inventoryTransfer, index) => (
              <tr key={inventoryTransfer.id}>
                <td>{index+1}</td>
                <td>{inventoryTransfer.company_name}</td>
                <td>{`${inventoryTransfer.from_type} (${inventoryTransfer.from_id})`}</td>
                <td>{`${inventoryTransfer.to_type} (${inventoryTransfer.to_id})`}</td>
                <td>{inventoryTransfer.inventory_name}</td>
                <td>{inventoryTransfer.quantity} {inventoryTransfer.unit} </td>
                <td>{inventoryTransfer.side_name}</td>
                <td>{inventoryTransfer.recorded_by}</td>
                <td>{inventoryTransfer.created_at}</td>

                <td>
                  <button
                    className="action-button update-button"
                    onClick={() => handleUpdate(inventoryTransfer.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(inventoryTransfer.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
    </div>
  );
};

export default InventoryTransfer;
