import { useEffect, useState } from "react";
import { getAssets, deleteAssets } from "../../APIs/CompanyAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable";
import { Pencil, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageModal from "/src/components/ImageModal";

const AssetPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image


  useEffect(() => {
    fetchAssetsData();
  }, []);

  const fetchAssetsData = async () => {
    setLoading(true);
    try {
      const assetsData = await getAssets();
      setAssets(assetsData);
      setFilteredAssets(assetsData);
    } catch (error) {
      toast.error("Failed to load assets. Please refresh the page");
      setError("Failed to load assets.");
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assetId) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteAssets(assetId);
        setAssets(assets.filter((asset) => asset.id !== assetId));
        setFilteredAssets(filteredAssets.filter((asset) => asset.id !== assetId));
        toast.success("Asset deleted successfully.");
      } catch (error) {
        toast.error(`Failed to delete asset: ${error.message || "An error occurred"}`);
        console.error("Error deleting asset:", error);
      }
    }
  };

  useEffect(() => {
    let filtered = assets;
    if (searchTerm) {
      filtered = filtered.filter((asset) =>
        Object.values(asset).some((value) => {
          if (value && typeof value === "object") {
            return Object.values(value).some(
              (v) =>
                v &&
                v.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredAssets(filtered);
  }, [searchTerm, assets]);

  const assetHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Company", key: "company_name", sortable: true },
    { label: "Branch", key: "branch_address", sortable: true },
    { label: "Warehouse", key: "warehouse_address", sortable: true },
    { label: "Name", key: "name", sortable: true },
    { label: "Type", key: "type", sortable: true },
    { label: "Yearly Depreciation", key: "yearly_depreciation", sortable: true },
    { label: "Buying Price", key: "buying_price", sortable: true },
    { label: "Purchase Year", key: "purchase_year", sortable: true },
    { label: "Current Price", key: "current_price", sortable: true },
    { label: "Picture", key: "picture", sortable: false }, // New column
    { label: "Created At", key: "created_at", sortable: true },
    { label: "Updated At", key: "updated_at", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const assetData = filteredAssets.map((asset, index) => ({
    serial_no: index + 1,
    company_name: asset.company_name || "N/A",
    branch_address: asset.branch_address || "N/A",
    warehouse_address: asset.warehouse_address || "N/A",
    name: asset.name || "N/A",
    type: asset.type || "N/A",
    yearly_depreciation: asset.yearly_depreciation || "N/A",
    buying_price: asset.buying_price !== null ? `$${asset.buying_price.toFixed(2)}` : "N/A",
    purchase_year: asset.purchase_year !== null ? asset.purchase_year : "N/A",
    current_price: asset.current_price !== null ? `$${asset.current_price.toFixed(2)}` : "N/A",
    picture: asset.picture ? (
      <img
        src={`${asset.picture}`}
        alt="Bill"
        className="h-12 w-12 object-cover rounded cursor-pointer"
        onClick={() => setSelectedImage(`${asset.picture}`)}
      />
    ) : (
      "N/A"
    ),
    created_at: asset.created_at
      ? new Date(asset.created_at).toLocaleString()
      : "N/A",
    updated_at: asset.updated_at
      ? new Date(asset.updated_at).toLocaleString()
      : "N/A",
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => navigate(`/update-asset`, { state: { asset } })}
          className="inline-flex items-center px-2 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          onClick={() => handleDelete(asset.id)}
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  if (loading) return <div className="text-center mt-4">Loading assets...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="asset-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="page-title">Asset Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Asset"}
        onButtonClick={() => {
          navigate(`/add-asset`);
        }}
      />
      <ReusableTable headers={assetHeaders} data={assetData} />
      
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        altText="Enlarged Bill" // You can make this dynamic if needed
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default AssetPage;