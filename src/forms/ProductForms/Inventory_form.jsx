import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { postInventory } from "/src/APIs/ProductAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";

const InventoryForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const existingData = state?.inventory || {};

  const [formData, setFormData] = useState({
    product_id: existingData?.product_id || "",
    product_name: existingData?.product_name || "",
    manufacturing_date: existingData?.manufacturing_date || "",
    expiry_date: existingData?.expiry_date || "",
    warehouse: existingData?.warehouse || "",
    branch: existingData?.branch || "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const body = {
      manufacturing_date: formData.manufacturing_date,
      expiry_date: formData.expiry_date,
      warehouse: formData.warehouse,
      branch: formData.branch,
    };
    try {

      console.table(body);
      const response = await postInventory(body, mode === "edit" ? existingData.id : undefined);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Inventory added successfully!" : "Inventory updated successfully!");
        setTimeout(() => navigate("/inventory"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Inventory. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Inventory" : "Edit Inventory"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="product_name" className="text-[#101023] font-medium">
                  Product Name:
                </Label>
                <Input
                  id="product_name"
                  type="text"
                  value={`${formData.product_name} - ID(${formData.product_id})`}
                  className="w-full"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturing_date" className="text-[#101023] font-medium">
                  Manufacturing Date:
                </Label>
                <Input
                  id="manufacturing_date"
                  type="date"
                  value={formData.manufacturing_date}
                  onChange={(e) => {setFormData({ ...formData, manufacturing_date: e.target.value })}}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry_date" className="text-[#101023] font-medium">
                  Expiry Date:
                </Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => {setFormData({ ...formData, expiry_date: e.target.value })}}
                  className="w-full"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/inventory")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Inventory" : "Update Inventory"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

InventoryForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default InventoryForm;
