import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getUsers } from "/src/APIs/UserAPIs";
import { postNotifications } from "/src/APIs/NotificationAPIs";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const AlertForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.category || {};
  const [alert, setAlert] = useState({
    title: "",
    description: "",
    to : null,
    company: user.company,
    branch: user.branch
  })
  const [users, setUsers] = useState([])
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(); // Fetch root Users
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch Users:", err);
        setError("Unable to load Users. Please try again later.");
      }
    }
    fetchUsers();
  }, []);

  const handleChange = (e)=>{
    const {name, value} = e.target
    setAlert(prev => ({...prev, [name]:value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await postNotifications("issues", alert, mode === "edit" ? existingData.id : null);
      
      if (response.status >= 200 && response.status < 300) {
        setSuccess(mode === "add" ? "Alert added successfully!" : "Alert updated successfully!");
        setTimeout(() => navigate("/categories"), 1500);
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to process Alert. Please check your inputs.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Alert" : "Edit Alert"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#101023] font-medium">
                  Title:
                </Label>
                <Input
                  id="title"
                  type="text"
                  name="title"
                  value={alert.title}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#101023] font-medium">
                  Description:
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={alert.description}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to" className="text-[#101023] font-medium">
                  To:
                </Label>
                <Select
                  value={alert.to}
                  onValueChange={(value) => setAlert(prev => ({...prev, to: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Responsible Person" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.role || ""} - {user.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/alerts")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Alert" : "Update Alert"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

AlertForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default AlertForm;
