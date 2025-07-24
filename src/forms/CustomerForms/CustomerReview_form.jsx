import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postCustomerReviews, getCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Star } from "lucide-react";

const CustomerReview = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.review || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser")) || {};
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: user.company || "",
    branch: user.branch || "",
    customer: existingData.customer || "",
    title: existingData.title || "",
    review: existingData.review || "",
    stars: existingData.stars || 0,
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingCustomers, setIsFetchingCustomers] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token || !user.id) {
      toast.error("Please log in to continue.");
      navigate("/login");
      return;
    }

    verifyToken(token)
      .then(() => {
        setIsFetchingCustomers(true);
        getCustomers()
          .then((res) => {
            if (Array.isArray(res) && res.length > 0) {
              setCustomers(res);
            } else {
              setCustomers([]);
              toast.warn("No customers available.");
            }
          })
          .catch((err) => {
            toast.error("Failed to fetch customers: " + err.message);
          })
          .finally(() => setIsFetchingCustomers(false));
      })
      .catch(() => {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      });
  }, [navigate, user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (index) => {
    setFormData((prev) => ({ ...prev, stars: index }));
  };

  const validateForm = () => {
    if (!formData.customer) {
      toast.error("Customer is required.");
      return false;
    }
    if (!formData.review) {
      toast.error("Review is required.");
      return false;
    }
    if (formData.stars < 1 || formData.stars > 5) {
      toast.error("Star rating must be between 1 and 5.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const body = {
        ...formData,
      };

      let response;
      if (mode === "add") {
        response = await postCustomerReviews(body);
      } else if (mode === "edit" && existingData?.id) {
        response = await postCustomerReviews(body, existingData.id);
      } else {
        throw new Error("Invalid mode or missing review ID for edit.");
      }

      if (response.ok) {
        toast.success(mode === "add" ? "Review added successfully!" : "Review updated successfully!");
        setTimeout(() => navigate("/customer-reviews"), 2000);
      } else {
        const data = await response.json();
        toast.error(data.non_field_errors || "Failed to process review request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="form-heading text-2xl font-bold mb-6 text-center">
        {mode === "add" ? "Add Customer Review" : "Edit Customer Review"}
      </h2>

      {isFetchingCustomers && <p className="text-center text-gray-500">Loading customers...</p>}
      {!isFetchingCustomers && customers.length === 0 && (
        <p className="text-center text-yellow-500">No customers available.</p>
      )}

      <form className="customer-form space-y-4" onSubmit={handleSubmit}>
        {/* Customer Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            required
            disabled={isFetchingCustomers}
          >
            <option value="" disabled>Select a Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.first_name} {customer.last_name}
              </option>
            ))}
          </select>
        </div>
        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title 
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            rows={2}
            className="form-input mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Write your title here..."
          />
        </div>
        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            rows={4}
            className="form-textarea mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Write your review here..."
            required
          ></textarea>
        </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-1 mt-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <button
                type="button"
                key={index}
                onClick={() => handleStarClick(index)}
                className={`text-yellow-400 hover:scale-110 transition-transform ${
                  index <= formData.stars ? "fill-current" : "text-gray-300"
                }`}
              >
                <Star fill={index <= formData.stars ? "currentColor" : "none"} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            loading || isFetchingCustomers ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading || isFetchingCustomers}
        >
          {loading ? "Processing..." : mode === "add" ? "Add Review" : "Update Review"}
        </button>
      </form>
    </div>
  );
};

CustomerReview.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerReview;
