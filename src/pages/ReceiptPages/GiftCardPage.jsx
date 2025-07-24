import { useEffect, useState } from "react";
import { getGiftCards, deleteGiftCards } from "/src/APIs/TaxAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const GiftCardPage = () => {
  const navigate = useNavigate()
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGiftCards()
      .then((giftCards) => {
        setGiftCards(giftCards);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching giftCards:", error);
        alert("Failed to load giftCards. Please try again.");
        setIsLoading(false);
      });
  }, []);
  

  const handleUpdate = (giftCardId) => {
    const giftCard = giftCards.find((c) => c.id === giftCardId); // Get the matching giftCard
    if (giftCard) {
      navigate(`/update-gift-card/${giftCardId}`, { state: { giftCard } });
    } else {
      console.error(`Gift Card with ID ${giftCardId} not found.`);
    }
  };
  

  const handleDelete = (giftCardId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this giftCard?");
    if (confirmDelete) {
      deleteGiftCards(giftCardId)
        .then((response) => {
          if (response.ok) {
            setGiftCards(giftCards.filter((giftCard) => giftCard.id !== giftCardId));
            toast.success("Gift Card deleted successfully.");
          } else {
            console.error("Failed to delete giftCard:", response.status);
            alert("Failed to delete the giftCard. Please check your permissions or try again.");
            toast.error("Failed to delete the giftCard. Please check your permissions or try again.");
          }
        })
        .catch((error) => {
          console.error("Error deleting giftCard:", error);
          alert("An error occurred. Unable to delete the giftCard at this time.");
        });
    }
  };
  
  

  return (
    <div className="giftCard-page">
      <h1 className="page-title">Gift Card Details</h1>

      <Link to="/add-gift-card">
        <button className="action-button add-button">Add Gift Card</button>
      </Link>
      {isLoading ? (
        <p>Loading giftCards...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Dicount Amount(%)</th>
              <th>Unique Code</th>
              <th>QR Code</th>
              <th>Used</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {giftCards.map((giftCard, index) => (
              <tr key={giftCard.id}>
                <td>{index+1}</td>
                <td>{giftCard.type}</td>
                <td>{giftCard.created_at || "N/A"}</td>
                <td>{giftCard.expiry_date}</td>
                <td>{giftCard.amount.toFixed(2)}</td>
                <td>{giftCard.unique_code}</td>
                <td><img src={giftCard.qr_code}/></td>
                <td>{giftCard.is_used? "Used": "Not Used"}</td>
                
                <td>
                  <button
                    className="action-button update-button"
                    onClick={() => handleUpdate(giftCard.id)}
                  >
                    Update
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => handleDelete(giftCard.id)}
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

export default GiftCardPage;
