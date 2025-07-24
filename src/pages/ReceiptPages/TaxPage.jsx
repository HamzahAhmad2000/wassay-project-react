import { useEffect, useState } from "react";
import { getTaxes, deleteTaxes } from "/src/APIs/TaxAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";

const TaxPage = () => {
  const navigate = useNavigate()
  const [taxes, setTaxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTaxes()
      .then((taxes) => {
        setTaxes(taxes);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching taxes:", error);
        alert("Failed to load taxes. Please try again.");
        setIsLoading(false);
      });
  }, []);
  

  const handleUpdate = (taxId) => {
    const tax = taxes.find((c) => c.id === taxId); // Get the matching tax
    if (tax) {
      navigate(`/update-tax/${taxId}`, { state: { tax } });
    } else {
      console.error(`Tax with ID ${taxId} not found.`);
    }
  };
  

  const handleDelete = (taxId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this tax?");
    if (confirmDelete) {
      deleteTaxes(taxId)
        .then((response) => {
          if (response.ok) {
            setTaxes(taxes.filter((tax) => tax.id !== taxId));
          } else {
            console.error("Failed to delete tax:", response.status);
            alert("Failed to delete the tax. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting tax:", error);
          alert("An error occurred. Unable to delete the tax at this time.");
        });
    }
  };
  
  

  return (
    <div className="tax-page">
      <h1 className="page-title">Tax Details</h1>

      <Link to="/add-tax">
        <button className="action-button add-button">Add Tax</button>
      </Link>
      {isLoading ? (
        <p>Loading taxes...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Category</th>
              <th>Type</th>
              <th>Via Card(%)</th>
              <th>Via Card(%)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxes.map((tax, index) => (
              <tr key={tax.id}>
                <td>{index+1}</td>
                <td>{tax.category}</td>
                <td>{tax.tax_name || "N/A"}</td>
                <td>{tax.tax_percentage_via_card}</td>
                <td>{tax.tax_percentage_via_cash}</td>
                
                <td>
                  <button
                    className="action-button update-button"
                    onClick={() => handleUpdate(tax.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(tax.id)}
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

export default TaxPage;
