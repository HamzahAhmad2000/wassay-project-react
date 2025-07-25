import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBranches, getCompanies, getFloors, postAisle } from '/src/APIs/CompanyAPIs';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {existingData.id ? 'Update Aisle' : 'Create Aisle'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">Company</Label>
                  <Select value={formData.company} onValueChange={(value) => handleChange("company", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {user && !user.branch && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleChange("branch", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="floor" className="text-[#101023] font-medium">Floor</Label>
                <Select value={formData.floor} onValueChange={(value) => handleChange("floor", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.name || `Floor ${floor.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#101023] font-medium">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number" className="text-[#101023] font-medium">Number</Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  min={1}
                  onChange={(e) => handleChange("number", e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/aisles')}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {loading ? 'Saving...' : existingData.id ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AisleForm;