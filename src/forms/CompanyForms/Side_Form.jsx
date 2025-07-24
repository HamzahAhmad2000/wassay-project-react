import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAisle, getBranches, getCompanies, getFloors, postSide } from '/src/APIs/CompanyAPIs';

const SideForm = () => {
  const { state } = useLocation()
  const existingData = state?.side || {}
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || '',
    branch: existingData.branch || user.branch || '',
    floor: existingData.floor || '',
    aisle: existingData.aisle || '',
    side: existingData.side || '',
    // number: existingData.number || '',
  });
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [aisles, setAisles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sideOptions, setSideOptions] = useState({'Left' : false, 'Right' : false, 'Front' : false, 'Back' : false});

  // Fetch dropdown data
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch companies', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch branches', err);
    }
  };

  const fetchFloors = async () => {
    try {
      const data = await getFloors();
      setFloors(Array.isArray(data) ? data.filter(floor => {
        if (user && (user.branch || formData.branch)) {
          return floor.branch == user.branch || floor.branch == formData.branch;
        } else if (user && (user.company || formData.company)) {
          return floor.company == user.company || floor.company == formData.company;
        } else {
          return false;
        }
      }) : []);
    } catch (err) {
      toast.error('Failed to fetch floors', err);
    }
  };

  const fetchAisles = async () => {
    try {
      const data = await getAisle();
      setAisles(Array.isArray(data) ? data.filter(aisle => {
        if (formData.floor)
          return aisle.floor == formData.floor;
        else if (user && (user.branch || formData.branch)) {
          return aisle.branch == user.branch || aisle.branch == formData.branch;
        } else if (user && (user.company || formData.company)) {
          return aisle.company == user.company || aisle.company == formData.company;
        } else {
          return false;
        }
      }) : []);
    } catch (err) {
      toast.error('Failed to fetch aisles', err);
    }
  };

  // Fetch existing side data for updates
  useEffect(() => {
    fetchCompanies();
    fetchBranches();
    fetchFloors();
    fetchAisles();
  }, []);

  useEffect(() => {
    if (formData.branch){
      fetchFloors();
      fetchAisles();
    }
  }, [formData.branch])

  useEffect(() => {
    if (formData.floor) {
      fetchAisles();
    }
  }, [formData.floor])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSideChange = (side) => {
    setSideOptions((prev) => ({
      ...prev,
      [side]: !prev[side],
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedSides = Object.keys(sideOptions).filter(side => sideOptions[side]);

    if (selectedSides.length === 0) {
      toast.error('Please select at least one side.');
      setLoading(false);
      return;
    }

    try {
      for (const side of selectedSides) {
        const payload = {
          ...formData,
          side,
        };

        await postSide(JSON.stringify(payload), existingData.id).then((response) => {

          if (!response.ok) {
            throw new Error('Failed to save side');
          }
          toast.success(existingData.id ? 'Sides updated successfully' : 'Sides created successfully');

        }) // Send request per side
      }

      setTimeout(() => navigate("/sides"), 1500);

    } catch (err) {
      const errorMessage = err.non_field_errors || 'Failed to save sides';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{existingData.id ? 'Update Side' : 'Create Side'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {user && user.is_superuser && (
          <div>
            <label className="block text-sm font-medium">Company</label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {user && !user.branch && (
          <div>
            <label className="block text-sm font-medium">Branch</label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.address}
                </option>
              ))}
            </select>
          </div>
          )}
        <div>
          <label className="block text-sm font-medium">Floor</label>
          <select
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name || `Floor ${floor.number}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Aisle</label>
          <select
            name="aisle"
            value={formData.aisle}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Aisle</option>
            {aisles.map((aisle) => (
              <option key={aisle.id} value={aisle.id}>
                {aisle.name || `Aisle ${aisle.number}`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col items-center justify-center pt-20">
          {/* Container with rectangle */}
          <div className="relative w-72 h-48 border-4 border-black">
            {/* Front */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sideOptions.Front || formData.side == 'Front'}
                  onChange={() => handleSideChange('Front')}
                  className="accent-blue-500"
                />
                <span>Front</span>
              </label>
            </div>

            {/* Back */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sideOptions.Back || formData.side == 'Bank'}
                  onChange={() => handleSideChange('Back')}
                  className="accent-blue-500"
                />
                <span>Back</span>
              </label>
            </div>

            {/* Left */}
            <div className="absolute left-[-80px] top-1/2 transform -translate-y-1/2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sideOptions.Left || formData.side == 'Left'}
                  onChange={() => handleSideChange('Left')}
                  className="accent-blue-500"
                />
                <span>Left</span>
              </label>
            </div>

            {/* Right */}
            <div className="absolute right-[-80px] top-1/2 transform -translate-y-1/2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sideOptions.Right || formData.side == 'Right'}
                  onChange={() => handleSideChange('Right')}
                  className="accent-blue-500"
                />
                <span>Right</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : existingData.id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => navigate('/sides')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SideForm;