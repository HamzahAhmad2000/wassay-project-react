import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAisle, deleteAisle } from '../../APIs/CompanyAPIs'; // Using CompanyAPIs as requested
import ReusableTable from '../../components/ReusableTable'; // Import the reusable table
import { Pencil, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchFilter from '../../components/SearchFilter';
import { Button } from "../../additionalOriginuiComponents/ui/button";

const AisleList = () => {
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAisles, setFilteredAisles] = useState([]);

  useEffect(() => {
    fetchAislesData();
  }, []);

  const fetchAislesData = async () => {
    setLoading(true);
    try {
      const data = await getAisle();
      setAisles(Array.isArray(data) ? data : []);
      setFilteredAisles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch aisles');
      console.error('Failed to fetch aisles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = aisles;
    if (searchTerm) {
      filtered = filtered.filter((aisle) =>
        Object.keys(aisle).some((key) => {
          const value = aisle[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredAisles(filtered);
  }, [searchTerm, aisles]);

  const handleUpdate = async (id) => {
    const aisle = aisles.find((c) => c.id === id);
    if (aisle) {
      navigate(`/update-aisle/`, { state: { aisle } });
    } else {
      toast.error(`Aisle with ID ${id} not found`);
    }
  }
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this aisle?')) {
      try {
        await deleteAisle(id);
        setAisles(aisles.filter((aisle) => aisle.id !== id));
        toast.success('Aisle deleted successfully!');
      } catch (err) {
        setError('Failed to delete aisle');
        toast.error('Failed to delete aisle');
        console.error('Failed to delete aisle', err);
      }
    }
  };

  const aisleHeaders = [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Number', key: 'number', sortable: true },
    { label: 'Floor', key: 'floor_name', sortable: true },
    { label: 'Branch', key: 'branch_name', sortable: true },
    { label: 'Company', key: 'company_name', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false },
  ];

  const aisleData = filteredAisles.map((aisle) => ({
    name: aisle.name || 'N/A',
    number: aisle.number,
    floor_name: aisle.floor_name || 'N/A',
    branch_name: aisle.branch_name || 'N/A',
    company_name: aisle.company_name || 'N/A',
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => handleUpdate(aisle.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(aisle.id)}
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

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Aisles</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText="Create Aisle"
        onButtonClick={() => navigate('/add-aisles')}
      />
      <ReusableTable headers={aisleHeaders} data={aisleData} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default AisleList;