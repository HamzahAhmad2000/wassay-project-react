import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSide, deleteSide } from '../../APIs/CompanyAPIs'; // Using CompanyAPIs as requested
import ReusableTable from '../../components/ReusableTable'; // Import the reusable table
import { Pencil, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchFilter from '../../components/SearchFilter';
import { Button } from "../../additionalOriginuiComponents/ui/button";

const SideList = () => {
  const [sides, setSides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSides, setFilteredSides] = useState([]);

  useEffect(() => {
    fetchSidesData();
  }, []);

  const fetchSidesData = async () => {
    setLoading(true);
    try {
      const data = await getSide();
      setSides(Array.isArray(data) ? data : []);
      setFilteredSides(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch sides');
      console.error('Failed to fetch sides', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = sides;
    if (searchTerm) {
      filtered = filtered.filter((side) =>
        Object.keys(side).some((key) => {
          const value = side[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredSides(filtered);
  }, [searchTerm, sides]);

  const handleUpdate = async (sideId) => {
     const side = sides.find((c) => c.id === sideId);
    if (side) {
      navigate(`/update-side/`, { state: { side } });
    } else {
      toast.error(`Aisle with ID ${sideId} not found`);
    }
  }
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this side?')) {
      try {
        const res = await deleteSide(id);
        if (!res.ok){
          toast.error(`error deleting Side`)
        }
        setSides(sides.filter((side) => side.id !== id));
        toast.success('Side deleted successfully!');
      } catch (err) {
        setError('Failed to delete side');
        toast.error('Failed to delete side');
        console.error('Failed to delete side', err);
      }
    }
  };

  const sideHeaders = [
    { label: 'Company', key: 'company_name', sortable: true },
    { label: 'Branch', key: 'branch_name', sortable: true },
    { label: 'Floor', key: 'floor_name', sortable: true },
    { label: 'Aisle', key: 'aisle_name', sortable: true },
    { label: 'Side', key: 'side', sortable: true },
    { label: 'Number', key: 'number', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false },
  ];

  const sideData = filteredSides.map((side) => ({
    side: side.side || 'N/A',
    number: side.number,
    aisle_name: side.aisle_name || 'N/A',
    floor_name: side.floor_name || 'N/A',
    branch_name: side.branch_name || 'N/A',
    company_name: side.company_name || 'N/A',
    actions: (
      <div className="flex space-x-2">
        <Button
          onClick={() => handleUpdate(side.id)}
          variant="outline"
          size="sm"
          className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </Button>
        <Button
          onClick={() => handleDelete(side.id)}
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
        <h1 className="text-3xl font-bold text-[#201b50] mb-2">Sides</h1>
      </div>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText="Create Side"
        onButtonClick={() => navigate('/add-sides')}
      />
      <ReusableTable headers={sideHeaders} data={sideData} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default SideList;