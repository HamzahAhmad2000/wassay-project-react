import { useEffect, useState } from "react";
import {
  getContractDocuments,
  deleteContractDocument,
  ApproveContractDocument
} from "../../APIs/ProductAPIs";
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReusableTable from "../../components/ReusableTable";
import { Pencil, Trash2 } from "lucide-react";
import ImageModal from "/src/components/ImageModal";

const ContractDocument = () => {
    const navigate = useNavigate();
    const [contractDocuments, setContractDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredContractDocuments, setFilteredContractDocuments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // State for modal image
  
    useEffect(() => {
      fetchContractDocumentsData();
    }, []);
  
    const fetchContractDocumentsData = async () => {
      setLoading(true);
      try {
        const data = await getContractDocuments();
        setContractDocuments(data);
        setFilteredContractDocuments(data);
      } catch (error) {
        toast.error("Failed to load contract Documents. Please refresh the page.", error);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      let filtered = contractDocuments;
      if (searchTerm) {
        filtered = filtered.filter((contractDocument) =>
          Object.keys(contractDocument).some((key) => {
            const value = contractDocument[key];
            return (
              value &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          })
        );
      }
      setFilteredContractDocuments(filtered);
    }, [searchTerm, contractDocuments]);
  
    
  const handleUpdate = (contractDocumentId) => {
    const selectedContractDocument = contractDocuments.find((t) => t.id === contractDocumentId);
    if (selectedContractDocument) {
      navigate(`/update-contract-documents/`, { state: { contractDocument: selectedContractDocument } });
    } else {
      toast.error(`Contract Document with ID ${contractDocumentId} not found.`);
    }
  };
  
    const handleDelete = async (contractDocumentId) => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this supplier contractDocument?"
      );
      if (!confirmDelete) {
        toast.info("Delete action canceled.");
        return;
      }
  
      try {
        const response = await deleteContractDocument(contractDocumentId);
        const data = await response;
        if (data.ok) {
          toast.success("Supplier contractDocument deleted successfully!");
          setTimeout(async () => {
            try {
              await fetchContractDocumentsData(); // Refresh the list
            } catch (error) {
              toast.error("Failed to refresh supplier contractDocuments.");
              console.error("Error fetching supplier contractDocuments:", error);
            }
          }, 1000);
        } else {
          toast.error("Failed to delete contractDocument.");
        }
      } catch (error) {
        toast.error(
          "An error occurred while deleting the contractDocument.",
          error
        );
      }
    };


    const handleApprove = async (contractDocumentId) => {
      const confirmApprove = window.confirm(
        "Are you sure you want to approve this contractDocument?"
      );
      if (!confirmApprove) {
        toast.info("Approve action canceled.");
        return;
      }
  
      try {
        const response = await ApproveContractDocument(contractDocumentId);
        const data = await response;
        console.log(data)
        if (data.data.id) {
          toast.success("Supplier contractDocument approved successfully!");
          setTimeout(async () => {
            try {
              await fetchContractDocumentsData(); // Refresh the list
            } catch (error) {
              toast.error("Failed to refresh supplier contractDocuments.");
              console.error("Error fetching supplier contractDocuments:", error);
            }
          }, 1000);
        } else {
          toast.error("Failed to approve supplier contractDocument.");
        }
      } catch (error) {
        toast.error(
          "An error occurred while deleting the supplier contractDocument.",
          error
        );
      }
    };
  
    const contractDocumentHeaders = [
      { label: "Sr. No.", key: "serial_no" },
      { label: "Company", key: "company_name", sortable: true },
      { label: "Branch", key: "branch_location", sortable: true },
      { label: "Name", key: "name", sortable: true },
      { label: "Description", key: "description", sortable: true },
      { label: "Supplier", key: "supplier_name", sortable: true },
      { label: "Image", key: "image", sortable: false },
      { label: "Approved", key: "approved", sortable: true },
      { label: "Notes", key: "note", sortable: true },
      { label: "Category", key: "category_name", sortable: true },
      { label: "Date", key: "created_at", sortable: true },

      { label: "Actions", key: "actions", sortable: false },
    ];
  
    const contractDocumentData = filteredContractDocuments.map((contractDocument, index) => ({
      serial_no: index + 1,
      company_name: contractDocument.company_name || "N/A",
      branch_location: contractDocument.branch_location || "N/A",
      name: contractDocument.name || "N/A",
      description: contractDocument.description  || "N/A",
      supplier_name: contractDocument.supplier_name || "N/A",
      approved: contractDocument.approved ? "YES" : "NO",
      note: contractDocument.note || "N/A",
      category_name: contractDocument.category_name || "N/A",
      created_at: contractDocument.created_at || "N/A",
      image: contractDocument.image ? (
        <img
          src={contractDocument.image}
          alt="Payment Image"
          className="h-10 w-10 object-contain rounded"
          onClick={() => setSelectedImage(`${contractDocument.image}`)}

        />
      ) : (
        "No Image"
      ),
      actions: (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdate(contractDocument.id)}
            className="inline-flex items-center px-2 py-1 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white focus:outline-none text-sm"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Update
          </button>
          <button
            onClick={() => handleDelete(contractDocument.id)}
            className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>

          {!contractDocument.approved && 
          (
             <button
            onClick={() => handleApprove(contractDocument.id)}
            className="inline-flex items-center px-2 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white focus:outline-none text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Approve
          </button>
          )}
        </div>
      ),
    }));
  
    if (loading) {
      return <div>Loading contractDocuments...</div>;
    }
  
    return (
      <div className="contractDocument-page">
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
        <h1 className="page-title">Contract Documents</h1>
        <SearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          buttonText={"Add Contract Documents"}
          onButtonClick={() => {
            navigate("/add-contract-documents");
          }}
        />
        <ReusableTable headers={contractDocumentHeaders} data={contractDocumentData} />

        <ImageModal
          isOpen={!!selectedImage}
          imageSrc={selectedImage}
          altText="Enlarged Bill" // You can make this dynamic if needed
          onClose={() => setSelectedImage(null)}
        />
      </div>
    );
  };
  
export default ContractDocument;