import { useState, useEffect } from 'react';
import { getBranches, getWareHouses, getFloors, getAisle, getSide } from '../APIs/CompanyAPIs';
import { getInventoryByBranch } from '../APIs/ProductAPIs';
import { Button } from "../additionalOriginuiComponents/ui/button";
import { Input } from "../additionalOriginuiComponents/ui/input";
import { Label } from "../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../additionalOriginuiComponents/ui/select";

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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              Inventory Transfer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* From Section */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Transfer From:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={formData.from_type} onValueChange={(value) => handleChange({ target: { name: 'from_type', value } })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.from} onValueChange={(value) => handleChange({ target: { name: 'from', value } })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${formData.from_type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.from_type === 'warehouse' ? warehouses : branches).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (ID: {item.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* To Section */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Transfer To:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={formData.to_type} onValueChange={(value) => handleChange({ target: { name: 'to_type', value } })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.to} onValueChange={(value) => handleChange({ target: { name: 'to', value } })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${formData.to_type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.to_type === 'warehouse' ? warehouses : branches).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (ID: {item.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Input */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-[#101023]">Add Products</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Product</Label>
                    <Select value={productInput.id} onValueChange={(value) => handleProductChange({ target: { name: 'id', value } })} disabled={!formData.from}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((item, index) => (
                          <SelectItem key={item.id} value={item.id}>
                            {`${item.product_name}${item.product_weight ? ` - ${item.product_weight}` : ''} - $${item.retail_price} (Stock: ${item.quantity_in_stock})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Quantity</Label>
                    <Input
                      type="number"
                      value={productInput.quantity}
                      onChange={handleProductChange}
                      placeholder="Quantity"
                      min="1"
                      className="w-full"
                      disabled={!formData.from}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Floor</Label>
                    <Select onValueChange={(value) => setFilteredAisle(aisle.filter((ai) => ai.floor == value))} disabled={!formData.from}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors.map((floor) => (
                          <SelectItem key={floor.id} value={floor.id}>
                            {`${floor.number} - ${floor.name}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Aisle</Label>
                    <Select onValueChange={(value) => setFilteredSide(side.filter((ai) => ai.aisle == value))} disabled={!formData.from}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Aisle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAisle.map((ai) => (
                          <SelectItem key={ai.id} value={ai.id}>
                            {`${ai.name} - ${ai.number}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Side</Label>
                    <Select value={productInput.placement} onValueChange={(value) => handleProductChange({ target: { name: 'placement', value } })} disabled={!formData.from}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Side" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSide.map((side) => (
                          <SelectItem key={side.id} value={side.id}>
                            {side.side}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={addProduct}
                      className="w-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
                      disabled={!formData.from}
                    >
                      Add Product
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product List */}
              {formData.products.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-[#101023]">Products to Transfer</h4>
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
                                  <Button
                                    type="button"
                                    onClick={() => removeProduct(index)}
                                    className="text-red-500 hover:text-red-700"
                                    variant="ghost"
                                  >
                                    Remove
                                  </Button>
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
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Transfer Inventory
                </Button>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryTransferForm;