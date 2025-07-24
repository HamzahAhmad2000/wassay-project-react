import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { postContractDocument, getSuppliers } from "/src/APIs/ProductAPIs";
import { getBranches, getCompanies } from "/src/APIs/CompanyAPIs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getImagePreviewSrc } from "/src/utils/imageUtil";
import { getContractDocumentCategory } from "/src/APIs/ProductAPIs";


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
    <div className="contract-document-form-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="page-title">
        {existingData.id ? "Update Contract Document" : "Add New Contract Document"}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8 space-y-4">
        {/* Company */}
        {user && user.is_superuser && (

          <div className="form-group">
            <label htmlFor="company">Company</label>
            <select
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          )}


          
        {/* Branch */}
        {user && (
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.address}
                </option>
              ))}
            </select>
          </div>
          )}

          
        <div>
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

         <div>
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <label htmlFor="supplier" className="block text-gray-700 text-sm font-bold mb-2">
            Supplier:
          </label>
          <select
            id="supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="note" className="block text-gray-700 text-sm font-bold mb-2">
            Notes (Optional):
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

         <div className="form-group">
            <label htmlFor="branch">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            required

            className="form-input"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
          
          
          {formData.image &&
            // Display the image preview if an image is selected
            <img src={getImagePreviewSrc(formData.image)} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
          }
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {existingData.id ? "Update Payment" : "Add Payment"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/contract-documents")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractDocumentForm;