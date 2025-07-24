import { useEffect, useState } from "react";
import { getPackages } from "/src/APIs/ProductAPIs";
import "/src/styles/TableStyles.css";
import { useNavigate, Link } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";

const PackOpenProducts = () => {
  const navigate = useNavigate();
  const [packageDetails, setPackageDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [filteredPackageDetails, setFilteredPackageDetails] = useState([]); // Filtered PackageDetails
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    getPackages().then((packageDetails) => {
      setPackageDetails(packageDetails);
      setFilteredPackageDetails(packageDetails);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching PackageDetails:", error);
      alert("Failed to load PackageDetails. Please try again.");
      setIsLoading(false);
    });
  }, []);

  
  const toggleRow = (packageDetailsId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packageDetailsId)) {
        newSet.delete(packageDetailsId);
      } else {
        newSet.add(packageDetailsId);
      }
      return newSet;
    });
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = packageDetails;
    if (searchTerm) {
      filtered = filtered.filter((packageDetails) =>
        Object.keys(packageDetails).some((key) => {
          const value = packageDetails[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredPackageDetails(filtered);
  }, [searchTerm, packageDetails]);


  return (
    <div className="packageDetails-page">
      <h1 className="page-title">Packing Details</h1>
      <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} buttonText={"Add Pack"} onButtonClick={() => {
        navigate(`/pack-open-product`);
      }} />
      <Link to="/pack-open-product">
        <button className="action-button add-button">Add Pack</button>
      </Link>
      {isLoading ? (
        <p>Loading PackageDetails...</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>GRN Number</th>
              <th>Entries</th>
              <th>Product</th>
              <th>Original Weight</th>
              <th>Packed</th>
              <th>Remaining</th>
              <th>Packing Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackageDetails.map((packageDetails, index) => (
              <tr key={packageDetails.id}>
                <td>{index + 1}</td>
                <td>{packageDetails.grn_number}</td>
                <td>{packageDetails.package_count}</td>
                <td>{packageDetails.product_name} (id : {packageDetails.product_id})</td>
                <td>{packageDetails.total_original_weight}</td>
                <td>{packageDetails.total_packed}</td>
                <td>{packageDetails.total_remaining}</td>
                <td>
                {packageDetails.packages && packageDetails.packages.length > 0 ? (
                  <div className="min-w-[250px]">
                    <button 
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-blue-600 hover:text-blue-700 focus:outline-none transition-colors duration-200"
                      onClick={() => toggleRow(index)}
                    >
                      <span className="font-medium">
                        {packageDetails.packages.length} {packageDetails.packages.length === 1 ? 'Package' : 'Packages'}
                      </span>
                      <span className="text-sm">
                        {expandedRows.has(index) ? '▼' : '▶'}
                      </span>
                    </button>
                    {expandedRows.has(index) && (
  <div className="mt-3 bg-white rounded-md shadow-sm border border-gray-200 p-4">
    <table className="w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100 text-gray-600 text-left">
          <th className="p-2 border border-gray-200">Sr. No.</th>
          <th className="p-2 border border-gray-200">Product Name</th>
          <th className="p-2 border border-gray-200">Packed By</th>
          <th className="p-2 border border-gray-200">Packed</th>
          <th className="p-2 border border-gray-200">Date</th>
        </tr>
      </thead>
      <tbody>
        {packageDetails.packages.map((singlePackage, i) => (
          <tr key={singlePackage.id} className="border border-gray-200">
            <td>{i+1}</td>
            <td className="p-2 border border-gray-200">{singlePackage.product_name}</td>
            <td className="p-2 border border-gray-200">{singlePackage.created_by_name || "N/A"}</td>
            <td className="p-2 border border-gray-200">{singlePackage.packed}</td>
            <td className="p-2 border border-gray-200">
  {new Date(singlePackage.updated_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })}
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

                  </div>
                ) : (
                  <span className="text-gray-500 italic">No Products</span>
                )}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PackOpenProducts;
