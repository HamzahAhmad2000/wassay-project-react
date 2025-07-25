import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { postContractDocument, getSuppliers } from "/src/APIs/ProductAPIs";
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { getContractDocumentCategory } from "/src/APIs/ProductAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const ContractDocumentForm = () => {
  const navigate = useNavigate();
  
  const { state } = useLocation();
  const existingData = state?.contractDocument || {};
  
  const [companies, setCompanies] = useState([])
  const [branches, setBranches] = useState([])
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);

  const user = JSON.parse(localStorage.getItem("OrbisUser"))

  const [formData, setFormData] = useState({
    company: existingData.company || user.company || "",
    branch: existingData.branch || user.branch || "",
    name: existingData.name || 0,
    description: existingData.description || "",
    supplier: existingData.supplier || "",
    note: existingData.note || "",
    category: existingData.category || "",
    image: existingData.image || null, 
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.is_superuser)
      getCompanies().then((companies) => {
        setCompanies(companies);
      });
    if (user)
      getBranches().then((branches) => {
        setBranches(branches);
      });

    getContractDocumentCategory().then((data) => {
      setCategories(data)
    })
  },[])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!formData.supplier){
          const suppliersData = await getSuppliers();
          setSuppliers(suppliersData);
        }
      } catch (error) {
        toast.error("Failed to load data for the form.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formData.supplier, formData.purchase_order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const newFormData = new FormData

      Object.keys(formData).forEach((key) => {
        console.log(key, formData[key])
        newFormData.append(key, formData[key])

      })
      const response = await postContractDocument(newFormData);
      const data = await response;
      if (response.id) {
        toast.success(
          `Contract Document ${existingData.id ? "updated" : "added"} successfully!`
        );
        setTimeout(() => navigate("/contract-documents"), 1500);

      } else {
        toast.error(
          `Failed to ${existingData.id ? "update" : "add"} contract documents: ${
            data.error || "An error occurred."
          }`
        );
      }
    } catch (error) {
      toast.error(
        `An error occurred while ${existingData.id ? "updating" : "adding"} the contract documents.`,
        error
      );
    }
  };

  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {existingData.id ? "Update Contract Document" : "Add New Contract Document"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company */}
              {user && user.is_superuser && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-[#101023] font-medium">
                    Company
                  </Label>
                  <Select
                    value={formData.company}
                    onValueChange={(value) => setFormData({ ...formData, company: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a company" />
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

              {/* Branch */}
              {user && (
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-[#101023] font-medium">
                    Branch
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a branch" />
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
                <Label htmlFor="name" className="text-[#101023] font-medium">
                  Name:
                </Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">
                  Description:
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-[#101023] font-medium">
                  Supplier:
                </Label>
                <Select
                  value={formData.supplier}
                  onValueChange={(value) => setFormData({ ...formData, supplier: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note" className="text-[#101023] font-medium">
                  Notes (Optional):
                </Label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#101023] font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-[#101023] font-medium">
                  Image
                </Label>
                <Input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="w-full"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                />
                
                {formData.image && (
                  <img 
                    src={getImagePreviewSrc(formData.image)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded-md" 
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {existingData.id ? "Update Payment" : "Add Payment"}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/contract-documents")}
                  variant="outline"
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ContractDocumentForm;