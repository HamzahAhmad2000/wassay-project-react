import { useState, useEffect } from "react";
import { verifyToken } from "/src/APIs/TokenAPIs";
import { postCustomerReviews, getCustomers } from "/src/APIs/CustomerAPIs";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Textarea } from "../../additionalOriginuiComponents/ui/textarea";

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Customer Review" : "Edit Customer Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isFetchingCustomers && <p className="text-center text-gray-500">Loading customers...</p>}
            {!isFetchingCustomers && customers.length === 0 && (
              <p className="text-center text-yellow-500">No customers available.</p>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Customer Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-[#101023] font-medium">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.customer} 
                  onValueChange={(value) => handleChange("customer", value)}
                  disabled={isFetchingCustomers}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.first_name} {customer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Review Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#101023] font-medium">
                  Title 
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full"
                  placeholder="Write your title here..."
                />
              </div>
              
              {/* Review Text */}
              <div className="space-y-2">
                <Label htmlFor="review" className="text-[#101023] font-medium">
                  Review <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="review"
                  value={formData.review}
                  onChange={(e) => handleChange("review", e.target.value)}
                  className="w-full"
                  rows="4"
                  placeholder="Write your review here..."
                  required
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">
                  Rating <span className="text-red-500">*</span>
                </Label>
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
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customer-reviews')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isFetchingCustomers}
                  className={`bg-[#423e7f] text-white hover:bg-[#201b50] ${
                    loading || isFetchingCustomers ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Processing..." : mode === "add" ? "Add Review" : "Update Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

CustomerReview.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default CustomerReview;
