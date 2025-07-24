import { getCustomerReviews, deleteCustomerReviews } from '../../APIs/CustomerAPIs';
import SearchFilter from '../../components/SearchFilter';
import ReusableTable from '../../components/ReusableTable';
import { Pencil, Trash2, Star } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import useFetchAndFilter from '../../hooks/useFetchAndFilter';
import { useNavigate } from 'react-router-dom';
import { handleUpdate, handleDelete } from '../../utils/crudUtils';

const ReviewPage = () => {
  
  const navigate = useNavigate();
  const {
    data: reviews,
    isLoading,
    searchTerm,
    setSearchTerm,
    setData: setReviews,
  } = useFetchAndFilter(getCustomerReviews, 'reviews');

  const handleUpdateReview = (reviewId) => {
    handleUpdate(reviewId, reviews, navigate, (id) => `/update-customer-review/${id}`, 'reviews');
  };

  const handleDeleteReview = (reviewId) => {
    handleDelete(reviewId, deleteCustomerReviews, setReviews, 'reviews');
  };

  const reviewHeaders = [
    { label: 'Sr. No.', key: 'serial_no' },
    { label: 'Customer', key: 'customer_name', sortable: true },
    { label: 'Company', key: 'company_name', sortable: true },
    { label: 'Branch', key: 'branch_address', sortable: true },
    { label: 'Stars', key: 'stars', sortable: true },
    { label: 'Review', key: 'review', sortable: false },
    { label: 'Created At', key: 'created_at', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false },
  ];

  const reviewData = reviews.map((review, index) => ({
    serial_no: index + 1,
    customer_name: review.customer_name || 'N/A',
    company_name: review.company_name || 'N/A',
    branch_address: review.branch_address || 'N/A',
    stars: (
      <div className="flex">
        {[...Array(review.stars)].map((_, i) => (
          <Star key={i} className="text-yellow-500 w-4 h-4" fill="currentColor" />
        ))}
      </div>
    ),
    review: review.review || 'N/A',
    created_at: review.created_at ? new Date(review.created_at).toLocaleString() : 'N/A',
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleUpdateReview(review.id)}
          className="text-blue-500 hover:underline flex items-center"
        >
          <Pencil className="h-4 w-4 mr-1" /> Update
        </button>
        <button
          onClick={() => handleDeleteReview(review.id)}
          className="text-red-500 hover:underline flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </button>
      </div>
    ),
  }));

  return (
    <div className="review-page p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Customer Reviews</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText="Add Review"
        onButtonClick={() => navigate('/add-customer-review')}
      />
      {isLoading ? <p>Loading reviews...</p> : <ReusableTable headers={reviewHeaders} data={reviewData} />}
    </div>
  );
};

export default ReviewPage;
