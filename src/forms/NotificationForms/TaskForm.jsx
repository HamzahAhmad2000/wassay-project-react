import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getUsers } from "/src/APIs/UserAPIs";
import { postNotifications } from "/src/APIs/NotificationAPIs";
import { toast } from "react-toastify";
import { Button } from "../../additionalOriginuiComponents/ui/button";
import { Input } from "../../additionalOriginuiComponents/ui/input";
import { Label } from "../../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../../additionalOriginuiComponents/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../additionalOriginuiComponents/ui/select";

const TaskForm = ({ mode = "add" }) => {
  const { state } = useLocation();
  const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const existingData = state?.task || {};
  const [task, setTasks] = useState({
    _from: user.id,
    _to : null,
    details: "",
    company: user.company,
    branch: user.branch || '',
    warehouse: user.warehouse || '',
    priority_level: 1,
    date: ""
  })
  const [users, setUsers] = useState([])
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (error && error !="")
    toast.error(error)
  }, [error])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers(); // Fetch root Users
        setUsers(data);
      } catch (err) {
        console.error("Failed _to fetch Users:", err);
        setError("Unable _to load Users. Please try again later.");
      }
    }
    fetchUsers();
  }, []);

  const handleChange = (e)=>{
    const {name, value} = e.target
    setTasks(prev => ({...prev, [name]:value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await postNotifications("tasks", task, mode === "edit" ? existingData.id : null);
      
      if (response.id) {
        setSuccess(mode === "add" ? "Task added successfully!" : "Task updated successfully!");
        toast.success(mode === "add" ? "Task added successfully!" : "Task updated successfully!");
        
        setTimeout(() => navigate("/tasks"), 1500);
      } else {
        const data = await response;
        setError(data.details || "Failed to process Task. Please check your inputs.");
      }
    } catch (err) {
      toast.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              {mode === "add" ? "Add Task" : "Edit Task"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-[#101023] font-medium">
                  To:
                </Label>
                <Select
                  value={task._to}
                  onValueChange={(value) => setTasks(prev => ({...prev, _to: value}))}
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
              
              <div className="space-y-2">
                <Label htmlFor="details" className="text-[#101023] font-medium">
                  Details:
                </Label>
                <textarea
                  id="details"
                  name="details"
                  value={task.details}
                  onChange={handleChange}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#423e7f] focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority_level" className="text-[#101023] font-medium">
                  Priority Level: <strong>{task.priority_level}</strong>
                </Label>
                <input
                  type="range"
                  name="priority_level"
                  min={1}
                  max={10}
                  value={task.priority_level}
                  onChange={handleChange}
                  style={{
                    background: `linear-gradient(to right, green, red ${task.priority_level * 10}%)`
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#101023] font-medium">
                  Due Date:
                </Label>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  value={task.date}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tasks")}
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  {mode === "add" ? "Add Task" : "Update Task"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

TaskForm.propTypes = {
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default TaskForm;
