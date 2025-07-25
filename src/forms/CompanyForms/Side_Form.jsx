import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAisle, getBranches, getCompanies, getFloors, postSide } from '/src/APIs/CompanyAPIs';
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";
import { Checkbox } from "../../additionalOriginuiComponents/ui/checkbox";

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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {existingData.id ? 'Update Side' : 'Create Side'}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="aisle" className="text-[#101023] font-medium">Aisle</Label>
                <Select value={formData.aisle} onValueChange={(value) => handleChange("aisle", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Aisle" />
                  </SelectTrigger>
                  <SelectContent>
                    {aisles.map((aisle) => (
                      <SelectItem key={aisle.id} value={aisle.id}>
                        {aisle.name || `Aisle ${aisle.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col items-center justify-center pt-20">
                {/* Container with rectangle */}
                <div className="relative w-72 h-48 border-4 border-black">
                  {/* Front */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={sideOptions.Front || formData.side == 'Front'}
                        onCheckedChange={() => handleSideChange('Front')}
                        className="accent-blue-500"
                      />
                      <span className="text-[#101023]">Front</span>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={sideOptions.Back || formData.side == 'Bank'}
                        onCheckedChange={() => handleSideChange('Back')}
                        className="accent-blue-500"
                      />
                      <span className="text-[#101023]">Back</span>
                    </div>
                  </div>

                  {/* Left */}
                  <div className="absolute left-[-80px] top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={sideOptions.Left || formData.side == 'Left'}
                        onCheckedChange={() => handleSideChange('Left')}
                        className="accent-blue-500"
                      />
                      <span className="text-[#101023]">Left</span>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="absolute right-[-80px] top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={sideOptions.Right || formData.side == 'Right'}
                        onCheckedChange={() => handleSideChange('Right')}
                        className="accent-blue-500"
                      />
                      <span className="text-[#101023]">Right</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/sides')}
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

export default SideForm;