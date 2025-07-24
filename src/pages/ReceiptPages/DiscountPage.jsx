import { useEffect, useState } from "react";
import { getDiscounts, deleteDiscounts } from "/src/APIs/TaxAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";
import { formatDate } from "/src/utils/dateUtils";
import { toast } from "react-toastify";

const DiscountPage = () => {
  const navigate = useNavigate()
  const [discounts, setDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDiscounts()
      .then((discounts) => {
        setDiscounts(discounts);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching discounts:", error);
        toast.error("Failed to load discounts. Please try again.");
        alert("Failed to load discounts. Please try again.");
        setIsLoading(false);
      });
  }, []);
  

  const handleUpdate = (discountId) => {
    const discount = discounts.find((c) => c.id === discountId); // Get the matching discount
    if (discount) {
      navigate(`/update-discount`, { state: { discount } });
    } else {
      console.error(`Discount with ID ${discountId} not found.`);
      toast.error(`Discount with ID ${discountId} not found.`);
    }
  };
  

  const handleDelete = (discountId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this discount?");
    if (confirmDelete) {
      deleteDiscounts(discountId)
        .then((response) => {
          if (response.ok) {
            setDiscounts(discounts.filter((discount) => discount.id !== discountId));
            toast.success("Discount deleted successfully.");
          } else {
            console.error("Failed to delete discount:", response.status);
            alert("Failed to delete the discount. Please check your permissions or try again.");
            toast.error("Failed to delete the discount. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting discount:", error);
          toast.error("An error occurred. Unable to delete the discount at this time.");
          alert("An error occurred. Unable to delete the discount at this time.");
        });
    }
  };
  
  

  return (
    <div className="discount-page">
      <h1 className="page-title">Discount Details</h1>

      <Link to="/add-discount">
        <button className="action-button add-button">Add Discount</button>
      </Link>
      {isLoading ? (
        <p>Loading discounts...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Category</th>
              <th>Percent</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Created at</th>
              <th>Updated at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount, index) => (
              <tr key={discount.id}>
                <td>{index+1}</td>
                <td>{discount.category}</td>
                <td>{(discount.discount_percentage).toFixed(2) || "N/A"}</td>
                <td>{discount.start_date}</td>
                <td>{discount.end_date}</td>
                <td>{formatDate(discount.created_at)}</td>
                <td>{formatDate(discount.updated_at)}</td>
                
                <td>
                  <button
                    className="action-button update-button"
                    onClick={() => handleUpdate(discount.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(discount.id)}
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

export default DiscountPage;
