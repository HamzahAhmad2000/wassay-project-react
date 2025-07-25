import { useState, useEffect } from 'react';
import { getCompanies, getBranches, getWareHouses, getFloors, getAisle, getSide } from '../APIs/CompanyAPIs';
import { getInventoryByBranch, postInventoryTransfer } from '../APIs/ProductAPIs';
import { toast } from 'react-toastify';
import { Button } from "../additionalOriginuiComponents/ui/button";
import { Input } from "../additionalOriginuiComponents/ui/input";
import { Label } from "../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../additionalOriginuiComponents/ui/select";

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
              {/* Company Selection */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Company:</Label>
                <Select value={formData.company} onValueChange={(value) => handleChange({ target: { name: 'company', value } })}>
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

              {/* From Section */}
              <div className="space-y-2">
                <Label className="text-[#101023] font-medium">Transfer From:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={formData.from_type} onValueChange={(value) => handleChange({ target: { name: 'from_type', value } })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Branch">Branch</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.from_id} onValueChange={(value) => handleChange({ target: { name: 'from_id', value } })} disabled={!formData.company}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${formData.from_type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.from_type == 'Warehouse' ? warehouses : branches)
                        .filter((item) => item.company_id === Number(formData.company))
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.location} (ID: {item.id})
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
                      <SelectItem value="Branch">Branch</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={formData.to_id} onValueChange={(value) => handleChange({ target: { name: 'to_id', value } })} disabled={!formData.company}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Select ${formData.to_type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.to_type == 'Warehouse' ? warehouses : branches)
                        .filter((item) => item.company_id == Number(formData.company))
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.location} (ID: {item.id})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Inventory and Quantity */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-[#101023]">Product Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Product</Label>
                    <Select value={formData.inventory} onValueChange={(value) => handleChange({ target: { name: 'inventory', value } })} disabled={!formData.from_id}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((item) => (
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
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="Quantity"
                      min="1"
                      className="w-full"
                      disabled={!formData.inventory}
                    />
                  </div>
                </div>
              </div>

              {/* Floor, Aisle, Side Selection */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-[#101023]">Placement Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Floor</Label>
                    <Select value={formData.floor} onValueChange={(value) => handleChange({ target: { name: 'floor', value } })} disabled={!formData.company}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {floors
                          .filter((floor) => floor.company === Number(formData.company))
                          .map((floor) => (
                            <SelectItem key={floor.id} value={floor.id}>
                              {`${floor.number} - ${floor.name || 'Unnamed'}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Aisle</Label>
                    <Select value={formData.aisle} onValueChange={(value) => handleChange({ target: { name: 'aisle', value } })} disabled={!formData.floor}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Aisle" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAisles.map((aisle) => (
                          <SelectItem key={aisle.id} value={aisle.id}>
                            {`${aisle.number} - ${aisle.name || 'Unnamed'}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600">Side</Label>
                    <Select value={formData.side} onValueChange={(value) => handleChange({ target: { name: 'side', value } })} disabled={!formData.aisle}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Side" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSides.map((side) => (
                          <SelectItem key={side.id} value={side.id}>
                            {side.side}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

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
                  message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
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

export default InventoryTransferForm2;