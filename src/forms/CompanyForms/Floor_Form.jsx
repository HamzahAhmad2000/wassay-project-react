import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCompanies, getBranches, getFloors, postFloors  } from '/src/APIs/CompanyAPIs';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const FloorForm = ({ mode = "add" }) => {

  const { state } = useLocation();
  const existingData = state?.floor || {};
  const user = JSON.parse(localStorage.getItem("OrbisUser"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    branch: existingData.branch || user.branch || "",
    name: existingData.name || "",
    number: existingData.number || "",
  });
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder API calls for dropdowns (replace with actual endpoints)
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

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
    if (existingData.id) {
      const fetchFloor = async () => {
        try {
          const data = await getFloors(existingData.id);
          setFormData({
            company: data.company || '',
            branch: data.branch || '',
            name: data.name || '',
            number: data.number || '',
          });
        } catch (err) {
          setError('Failed to fetch floor', err);
        }
      };
      fetchFloor();
    }
  }, [existingData.id]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = JSON.stringify(formData);
      await postFloors(payload, existingData.id);
      setTimeout(() => navigate("/floors"), 1500);

    } catch (err) {
      setError('Failed to save floor', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {existingData.id ? 'Update Floor' : 'Create Floor'}
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
                  onChange={(e) => handleChange("number", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/floors')}
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

export default FloorForm;