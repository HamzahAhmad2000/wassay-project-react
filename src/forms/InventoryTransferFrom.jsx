import { useState, useEffect } from 'react';
import { getBranches, getWareHouses, getFloors, getAisle, getSide } from '../APIs/CompanyAPIs';
import { getInventoryByBranch } from '../APIs/ProductAPIs';

const InventoryTransferForm = () => {
  const [formData, setFormData] = useState({
    from_type: 'warehouse',
    from: '',
    to_type: 'warehouse',
    to: '',
    products: [],
  });
  const [productInput, setProductInput] = useState({ id: '', quantity: '', placement: '' });
  const [message, setMessage] = useState('');
  const [branches, setBranches] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [floors, setFloors] = useState([]);
  const [aisle, setAisle] = useState([]);
  const [filteredAisle, setFilteredAisle] = useState([]);
  const [side, setSide] = useState([]);
  const [filteredSide, setFilteredSide] = useState([]);
  const [inventory, setInventory] = useState([]); // Inventory for selected "from" location

  // Fetch branches and warehouses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchData = await getBranches();
        const warehouseData = await getWareHouses();
        const floorData = await getFloors();
        const aisleData = await getAisle();
        const sideData = await getSide();

        setBranches(branchData);
        setWarehouses(warehouseData);
        setFloors(floorData);
        setAisle(aisleData);
        setSide(sideData);
      } catch (error) {
        setMessage('Error fetching branches or warehouses.', error);
      }
    };
    fetchData();
  }, []);

  // Fetch inventory when from_type or from changes
  useEffect(() => {
    const fetchInventory = async () => {
      if (formData.from) {
        try {
          const inventoryData = await getInventoryByBranch(formData.from_type, formData.from);
          setInventory(inventoryData.filter(i => ((i.quantity_in_stock != 0))));
          console.log("Fetched inventory:", inventoryData);
        } catch (error) {
          setMessage('Error fetching inventory.', error);
        }
      } else {
        setInventory([]); // Reset inventory if no from
      }
    };
    fetchInventory();
  }, [formData.from_type, formData.from]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle product input changes
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setProductInput((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
  }, [productInput]);

  // Add product to the list with validation
  const addProduct = () => {
    if (!productInput.id || !productInput.quantity || productInput.quantity <= 0) {
      setMessage('Please select a valid product ID and enter a quantity greater than 0.');
      return;
    }
  
    const selectedProduct = inventory.find((item) => item.id === Number(productInput.id));
    if (!selectedProduct || selectedProduct.quantity_in_stock < Number(productInput.quantity)) {
      setMessage('Insufficient stock for the selected product.');
      return;
    }
  
    setFormData((prev) => {
      const existingProductIndex = prev.products.findIndex((p) => p.id === Number(productInput.id));
      if (existingProductIndex >= 0) {
        // Update existing product's quantity
        const updatedProducts = [...prev.products];
        updatedProducts[existingProductIndex].quantity += Number(productInput.quantity);
        return { ...prev, products: updatedProducts };
      } else {
        // Add new product
        return {
          ...prev,
          products: [...prev.products, { id: Number(productInput.id), quantity: Number(productInput.quantity), placement: productInput.placement }],
        };
      }
    });
    setProductInput({ id: '', quantity: '' });
    setMessage('');
  };

  // Remove product from the list
  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from || !formData.to || formData.products.length === 0) {
      setMessage('Please fill all fields and add at least one product.');
      return;
    }

    try {
      const response = await fetch('/api/products/tofromapi/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Transfer failed.');
      
      setMessage(result.message);
      setFormData({
        from_type: 'warehouse',
        from: '',
        to_type: 'warehouse',
        to: '',
        products: [],
      });
      setInventory([]);
    } catch (error) {
      setMessage(error.message || 'An error occurred while transferring inventory.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Inventory Transfer</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
              <option value="warehouse">Warehouse</option>
              <option value="branch">Branch</option>
            </select>
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {formData.from_type}</option>
              {(formData.from_type === 'warehouse' ? warehouses : branches).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (ID: {item.id})
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
              <option value="warehouse">Warehouse</option>
              <option value="branch">Branch</option>
            </select>
            <select
              name="to"
              value={formData.to}
              onChange={handleChange}
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {formData.to_type}</option>
              {(formData.to_type === 'warehouse' ? warehouses : branches).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (ID: {item.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Input */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-lg font-semibold text-gray-700">Add Products</h4>
          <div className="flex space-x-4">
            <select
              name="id"
              value={productInput.id}
              onChange={handleProductChange}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from}
            >
              <option value="">Select Product</option>
              {inventory.map((item, index) => (
                <option key={item.id} value={item.id}>
                {`${item.product_name}${item.product_weight ? ` - ${item.product_weight}` : ''} - $${item.retail_price} (Stock: ${item.quantity_in_stock})`}
              </option>
              ))}
            </select>
            <input
              type="number"
              name="quantity"
              value={productInput.quantity}
              onChange={handleProductChange}
              placeholder="Quantity"
              min="1"
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from}
            />
            


            <select
              onChange={(e)=>{
                setFilteredAisle(aisle.filter((ai) => ai.floor == e.target.value));
              }}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from}
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                {`${floor.number} - ${floor.name}`}
              </option>
              ))}
            </select>

            <select
              onChange={(e)=>{
                setFilteredSide(side.filter((ai) => ai.aisle == e.target.value));
              }}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from}
            >
              <option value="">Select Aisle</option>
              {filteredAisle.map((ai) => (
                <option key={ai.id} value={ai.id}>
                {`${ai.name} - ${ai.number}`}
              </option>
              ))}
            </select>

            <select
              name="placement"
              value={productInput.placement}
              onChange={handleProductChange}
              className="w-1/3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.from}
            >
              <option value="">Select Side</option>
              {filteredSide.map((side) => (
                <option key={side.id} value={side.id}>
                {`${side.side}`}
              </option>
              ))}
            </select>


            <button
              type="button"
              onClick={addProduct}
              className="w-1/3 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              disabled={!formData.from}
            >
              Add Product
            </button>
          </div>
        </div>

        {/* Product List */}
        {formData.products.length > 0 && (
  <div className="space-y-2">
  <h4 className="text-lg font-semibold text-gray-700">Products to Transfer</h4>
  {formData.products.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-gray-700 border border-gray-200 rounded-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 font-semibold">Product Name</th>
            <th className="p-2 font-semibold">Category</th>
            <th className="p-2 font-semibold">Weight/Quantity</th>
            <th className="p-2 font-semibold">Retail Price</th>
            <th className="p-2 font-semibold">Quantity</th>
            <th className="p-2 font-semibold">Placement</th>
            <th className="p-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {formData.products.map((product, index) => {
            const productDetails = inventory.find((item) => item.id === product.id);
            return (
              <tr key={index} className="border-b last:border-b-0 bg-gray-50 hover:bg-gray-100">
                <td className="p-2">
                  {productDetails ? productDetails.product_name : `ID: ${product.id}`}
                </td>
                <td className="p-2">
                  {productDetails ? productDetails.category.category_name : `ID: ${product.id}`}
                </td>
                <td className="p-2">
                  {productDetails && productDetails.product_weight
                    ? productDetails.product_weight
                    : "N/A"}
                </td>
                <td className="p-2">
                  {productDetails ? `$${productDetails.retail_price}` : "N/A"}
                </td>
                <td className="p-2">{product.quantity}</td>
                <td className="p-2">{product.placement}</td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeProduct(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-gray-500">No products added yet.</p>
  )}
</div>
)}

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
            message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default InventoryTransferForm;