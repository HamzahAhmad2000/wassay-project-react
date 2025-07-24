import { useState, useEffect } from 'react';
import { getCompanies, getBranches, getWareHouses, getFloors, getAisle, getSide } from '../APIs/CompanyAPIs';
import { getInventoryByBranch, postInventoryTransfer } from '../APIs/ProductAPIs';
import { toast } from 'react-toastify';

const InventoryTransferForm2 = () => {

  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const [formData, setFormData] = useState({
    company: user.company || '',
    from_type: 'Branch',
    from_id: '',
    to_type: 'Branch',
    to_id: '',
    inventory: '',
    quantity: '',
    side: '',
  });
  const [message, setMessage] = useState('');
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [floors, setFloors] = useState([]);
  const [aisles, setAisles] = useState([]);
  const [filteredAisles, setFilteredAisles] = useState([]);
  const [sides, setSides] = useState([]);
  const [filteredSides, setFilteredSides] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Fetch companies, branches, warehouses, floors, aisles, and sides on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyData, branchData, warehouseData, floorData, aisleData, sideData] = await Promise.all([
          getCompanies(),
          getBranches(),
          getWareHouses(),
          getFloors(),
          getAisle(),
          getSide(),
        ]);
        setCompanies(companyData);
        setBranches(branchData);
        setWarehouses(warehouseData);
        setFloors(floorData);
        setAisles(aisleData);
        setSides(sideData);
      } catch (error) {
        setMessage(`Error fetching initial data: ${error.message}`);
      }
    };
    fetchData();
  }, []);

  // Fetch inventory when company, from_type, or from_id changes
  useEffect(() => {
    const fetchInventory = async () => {
      if (formData.company && formData.from_id) {
        try {
          console.log(formData.from_id, formData.from_type)
          const inventoryData = await getInventoryByBranch(formData.from_type.toLowerCase(), formData.from_id);


          console.log("New inventory:", inventoryData)
          setInventory(inventoryData.filter((i) => i.quantity_in_stock > 0));
        } catch (error) {
          setMessage(`Error fetching inventory: ${error.message}`);
        }
      } else {
        setInventory([]);
      }
    };
    fetchInventory();
  }, [formData.company, formData.from_type, formData.from_id]);



  useEffect(()=>{

    console.log("from", formData.from_type)
    console.log("to", formData.to_type)

    console.log(branches)
    console.log(warehouses)

  }, [formData.to_type, formData.from_type])

  // Filter aisles and sides when floor or aisle changes
  useEffect(() => {
    setFilteredAisles(aisles.filter((aisle) => aisle.floor === Number(formData.floor)));
  }, [formData.floor, aisles]);

  useEffect(() => {
    setFilteredSides(sides.filter((side) => side.aisle === Number(formData.aisle)));
  }, [formData.aisle, sides]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset dependent fields
      ...(name === 'company' ? { from_id: '', to_id: '', inventory: '', quantity: '', floor: '', aisle: '', side: '' } : {}),
      ...(name === 'from_type' ? { from_id: '', inventory: '', quantity: '', floor: '', aisle: '', side: '' } : {}),
      ...(name === 'to_type' ? { to_id: '' } : {}),
      ...(name === 'from_id' ? { inventory: '', quantity: '', floor: '', aisle: '', side: '' } : {}),
      ...(name === 'floor' ? { aisle: '', side: '' } : {}),
      ...(name === 'aisle' ? { side: '' } : {}),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.company || !formData.from_type || !formData.from_id || !formData.to_type || !formData.to_id || !formData.inventory || !formData.quantity) {
      setMessage('Please fill all required fields.');
      return;
    }
    if (formData.from_type === formData.to_type && formData.from_id === formData.to_id) {
      setMessage('Source and destination cannot be the same.');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setMessage('Quantity must be greater than zero.');
      return;
    }
    const selectedProduct = inventory.find((item) => item.id === Number(formData.inventory));
    if (!selectedProduct || selectedProduct.quantity_in_stock < Number(formData.quantity)) {
      setMessage('Insufficient stock for the selected product.');
      return;
    }

    try {
      const response = await postInventoryTransfer(formData)

      const result = await response.json();
      console.log(result)
      if (!response.ok) throw new Error(result.error || 'Transfer failed.');

      setMessage('Transfer successful!');
      toast.success('Transfer successful!')
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Transfer</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Selection */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Company:</label>
          <select
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* From Section */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Transfer From:</label>
          <div className="flex space-x-4">
            <select
              name="from_type"
              value={formData.from_type}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Branch">Branch</option>
              <option value="Warehouse">Warehouse</option>
            </select>
            <select
              name="from_id"
              value={formData.from_id}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.company}
            >
              <option value="">Select {formData.from_type}</option>
              {(formData.from_type == 'Warehouse' ? warehouses : branches)
                .filter((item) => item.company_id === Number(formData.company))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.location} (ID: {item.id})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* To Section */}
        <div className="flex flex-col space-y-2">
          <label className="text-gray-700 font-medium">Transfer To:</label>
          <div className="flex space-x-4">
            <select
              name="to_type"
              value={formData.to_type}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Branch">Branch</option>
              <option value="Warehouse">Warehouse</option>
            </select>
            <select
              name="to_id"
              value={formData.to_id}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.company}
            >
              <option value="">Select {formData.to_type}</option>
              {(formData.to_type == 'Warehouse' ? warehouses : branches)
                .filter((item) => item.company_id == Number(formData.company))
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.location} (ID: {item.id})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Inventory and Quantity */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-lg font-semibold text-gray-700">Product Details</h4>
          <div className="flex space-x-4">
            <select
              name="inventory"
              value={formData.inventory}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from_id}
            >
              <option value="">Select Product</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {`${item.product_name}${item.product_weight ? ` - ${item.product_weight}` : ''} - $${item.retail_price} (Stock: ${item.quantity_in_stock})`}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              min="1"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.inventory}
            />
          </div>
        </div>

        {/* Floor, Aisle, Side Selection */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-lg font-semibold text-gray-700">Placement Details</h4>
          <div className="flex space-x-4">
            <select
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.company}
            >
              <option value="">Select Floor</option>
              {floors
                .filter((floor) => floor.company === Number(formData.company))
                .map((floor) => (
                  <option key={floor.id} value={floor.id}>
                    {`${floor.number} - ${floor.name || 'Unnamed'}`}
                  </option>
                ))}
            </select>
            <select
              name="aisle"
              value={formData.aisle}
              onChange={handleChange}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.floor}
            >
              <option value="">Select Aisle</option>
              {filteredAisles.map((aisle) => (
                <option key={aisle.id} value={aisle.id}>
                  {`${aisle.number} - ${aisle.name || 'Unnamed'}`}
                </option>
              ))}
            </select>
            <select
              name="side"
              value={formData.side}
              onChange={handleChange}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.aisle}
            >
              <option value="">Select Side</option>
              {filteredSides.map((side) => (
                <option key={side.id} value={side.id}>
                  {side.side}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-3 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Transfer Inventory
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-4 p-2 rounded-md text-center ${
            message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default InventoryTransferForm2;