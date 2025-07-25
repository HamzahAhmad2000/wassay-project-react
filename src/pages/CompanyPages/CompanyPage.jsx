import { useEffect, useState } from "react";
import { deleteCompanies, getCompanies } from "/src/APIs/CompanyAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { toast } from 'react-toastify';
import ReusableTable from "../../components/ReusableTable"; // Import ReusableTable
import { Pencil, Trash2 } from "lucide-react"; // Import Lucide icons
import ImageModal from "/src/components/ImageModal";
import { Button } from "../../additionalOriginuiComponents/ui/button";

const CompanyPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // State for modal image

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const companiesData = await getCompanies();
      setCompanies(companiesData);
      setFilteredCompanies(companiesData);
    } catch (error) {
      toast.error("Failed to load companies. Please refresh the page", error);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = companies;
    if (searchTerm) {
      filtered = filtered.filter((company) =>
        Object.keys(company).some((key) => {
          const value = company[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  const handleUpdate = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      navigate(`/update-company/${companyId}`, { state: { company } });
    } else {
      toast.error(`Company with ID ${companyId} not found`);
    }
  };

  const handleDelete = async (companyId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this company?");
    if (!confirmDelete) {
      toast.info("Delete action canceled");
      return;
    }

    try {
      const response = await deleteCompanies(companyId);
      const data = await response;

      if (data.success) {
        toast.success(data.message || "Company deleted successfully!");
        await fetchCompanies(); // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete the company. Please try again");
      }
    } catch (err) {
      console.error("Error deleting company:", err);
      toast.error("An error occurred while deleting the company. Please try again");
    }
  };

  const companyHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Name", key: "name", sortable: true },
    { label: "Logo", key: "logo", sortable: false },
    { label: "HQ Location", key: "HQ_location", sortable: true },
    { label: "Latitude/Longitude", key: "Lat_long", sortable: true },
    { label: "Category", key: "category", sortable: true },
    { label: "Company Scale", key: "Company_scale", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

  const companyData = filteredCompanies.map((company, index) => ({
    serial_no: index + 1,
    name: company.name,
    logo: company.logo ? (
      <img
        src={company.logo}
        alt="Company Logo"
        className="h-10 w-10 object-contain rounded cursor-pointer"
        onClick={() => setSelectedImage(`${company.logo}`)}
      />
    ) : (
      "No Logo"
    ),
    HQ_location: company.HQ_location || "N/A",
    Lat_long: company.Lat_long || "N/A",
    category: company.category || "N/A",
    Company_scale: company.Company_scale || "N/A",
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => handleUpdate(company.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(company.id)}
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    ),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Company Details</h1>
      </div>
      
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Company"}
        onButtonClick={() => {
          navigate(`/add-company`);
        }}
      />
      
      <ReusableTable headers={companyHeaders} data={companyData} />
      
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage}
        altText="Enlarged Bill" // You can make this dynamic if needed
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default CompanyPage;