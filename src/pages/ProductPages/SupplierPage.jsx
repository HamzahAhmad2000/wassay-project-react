import { useEffect, useState } from "react";
import { getSuppliers, deleteSuppliers } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";

const SupplierPage = () => {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    getSuppliers()
      .then((suppliers) => {
        setSuppliers(suppliers);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
        alert("Failed to load suppliers. Please try again.");
        setIsLoading(false);
      });
  }, []);
  

  const handleUpdate = (supplierId) => {
    const supplier = suppliers.find((c) => c.id === supplierId); // Get the matching supplier
    if (supplier) {
      navigate(`/update-supplier/${supplierId}`, { state: { supplier } });
    } else {
      console.error(`Supplier with ID ${supplierId} not found.`);
    }
  };
  

  const handleDelete = (supplierId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this supplier?");
    if (confirmDelete) {
      deleteSuppliers(supplierId)
        .then((response) => {
          if (response.ok) {
            setSuppliers(suppliers.filter((supplier) => supplier.id !== supplierId));
          } else {
            console.error("Failed to delete supplier:", response.status);
            alert("Failed to delete the supplier. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting supplier:", error);
          alert("An error occurred. Unable to delete the supplier at this time.");
        });
    }
  };
  
  

  return (
    <div className="supplier-page">
      <h1 className="page-title">Supplier Details</h1>

      <Link to="/add-supplier">
        <button className="action-button add-button">Add Supplier</button>
      </Link>
      {isLoading ? (
        <p>Loading suppliers...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Name</th>
              <th>Score</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={supplier.id}>
                <td>{index+1}</td>
                <td>{supplier.name}</td>
                <td>{supplier.score || "N/A"}</td>
                <td>{supplier.phone_no}</td>
                <td>{supplier.location}</td>

                <td>
                  <button
                    className="action-button update-button"
                    onClick={() => handleUpdate(supplier.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(supplier.id)}
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

export default SupplierPage;
