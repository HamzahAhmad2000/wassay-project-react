import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBranches, getCompanies, getFloors, postAisle } from '/src/APIs/CompanyAPIs';

const AisleForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation()
  const existingData = state?.aisle || {};
  const user = JSON.parse(localStorage.getItem('OrbisUser'));
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || '',
    branch: existingData.branch || user.branch || '',
    floor: existingData.floor || '',
    name: existingData.name || '',
    number: existingData.number || '',
  });
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder API calls for dropdowns
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch companies', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch branches', err);
    }
  };

  const fetchFloors = async () => {
    try {
      const data = await getFloors();
      setFloors(Array.isArray(data) ? data.filter(floor => {
        if (user && user.is_superuser) {
          return true;
        } else if (user && user.branch) {
          return floor.branch === user.branch;
        } else if (user && user.company) {
          return floor.company === user.company;
        } else {
          return false;
        }
      }) : []);
    } catch (err) {
      setError('Failed to fetch floors', err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
    fetchFloors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = JSON.stringify(formData);
      await postAisle(payload, existingData.id);
      setTimeout(() => navigate("/aisles"), 1500);

    } catch (err) {
      setError('Failed to save aisle', err);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{existingData.id ? 'Update Aisle' : 'Create Aisle'}</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Number</label>
          <input
            type="number"
            name="number"
            value={formData.number}
            min={1}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
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
            onClick={() => navigate('/aisles')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AisleForm;