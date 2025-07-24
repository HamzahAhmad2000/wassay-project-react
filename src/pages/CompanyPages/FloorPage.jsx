import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFloors, deleteFloors } from '../../APIs/CompanyAPIs'; // Adjust the import path
import ReusableTable from '../../components/ReusableTable'; // Import the reusable table
import { Pencil, Trash2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchFilter from '../../components/SearchFilter';

const FloorList = () => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFloors, setFilteredFloors] = useState([]);

  useEffect(() => {
    fetchFloorsData();
  }, []);

  const fetchFloorsData = async () => {
    setLoading(true);
    try {
      const data = await getFloors();
      setFloors(Array.isArray(data) ? data : []);
      setFilteredFloors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch floors');
      console.error('Failed to fetch floors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = floors;
    if (searchTerm) {
      filtered = filtered.filter((floor) =>
        Object.keys(floor).some((key) => {
          const value = floor[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredFloors(filtered);
  }, [searchTerm, floors]);

  
  const handleUpdate = (floorId) => {
    const floor = floors.find((c) => c.id === floorId);
    if (floor) {
      navigate(`/update-floor`, { state: { floor } });
    } else {
      toast.error(`Floor with ID ${floorId} not found`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this floor?')) {
      try {
        await deleteFloors(id);
        setFloors(floors.filter((floor) => floor.id !== id));
        toast.success('Floor deleted successfully!');
      } catch (err) {
        setError('Failed to delete floor');
        toast.error('Failed to delete floor');
        console.error('Failed to delete floor', err);
      }
    }
  };

  const floorHeaders = [
    { label: 'Name', key: 'name', sortable: true },
    { label: 'Number', key: 'number', sortable: true },
    { label: 'Branch', key: 'branch_name', sortable: true },
    { label: 'Company', key: 'company_name', sortable: true },
    { label: 'Actions', key: 'actions', sortable: false },
  ];

  const floorData = filteredFloors.map((floor) => ({
    name: floor.name || 'N/A',
    number: floor.number,
    branch_name: floor.branch_name || 'N/A',
    company_name: floor.company_name || 'N/A',
    actions: (
      <div className="flex space-x-2">
        <button
          onClick={() => handleUpdate(floor.id)}
          className="inline-flex items-center px-2 py-1 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white focus:outline-none text-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Update
        </button>
        <button
          className="inline-flex items-center px-2 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white focus:outline-none text-sm"
          onClick={() => handleDelete(floor.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>
      </div>
    ),
  }));

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <h1 className="text-2xl font-bold mb-4">Floors</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText="Create Floor"
        onButtonClick={() => navigate('/add-floors')}
      />
      <ReusableTable headers={floorHeaders} data={floorData} />
    </div>
  );
};

export default FloorList;