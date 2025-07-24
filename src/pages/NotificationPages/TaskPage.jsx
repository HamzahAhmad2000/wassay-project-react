import { useEffect, useState } from "react";
import { getNotifications, deleteNotifications, postNotifications } from "../../APIs/NotificationAPIs"; // Adjust the import path
import { useNavigate } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { toast } from "react-toastify";

const TaskPage = () => {
  const navigate = useNavigate();
  const [task, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("OrbisUser"));

  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [filteredTasks, setFilteredTasks] = useState([]); // Filtered task

  useEffect(() => {
    fetchTasksData();
  }, []);

  const fetchTasksData = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications("tasks");
      setTasks(data);
      setFilteredTasks(data);
    } catch (error) {
      toast.error(`Error fetching tasks: ${error}`);
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filtering
  useEffect(() => {
    let filtered = task;
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        Object.keys(task).some((key) => {
          const value = task[key];
          return (
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }
    setFilteredTasks(filtered);
  }, [searchTerm, task]);

  const handleUpdate = (taskId) => {
    const selectedTask = task.find((t) => t.id === taskId);
    if (selectedTask) {
      navigate(`/update-task/${taskId}`, { state: { task: selectedTask } });
    } else {
      toast.error(`Task with ID ${taskId} not found.`);
    }
  };

  const handleDone = async (taskId) => {
    const selectedTask = task.find((f) => f.id == taskId);

    if (!selectedTask) {
      toast.error(`Task Does Not Exist`);
      return;
    }

    const updatedTask = { ...selectedTask };
    updatedTask.completed = true;
    try {
      const response = await postNotifications('tasks', updatedTask, taskId);

      if (response.id) {
        toast.success(`Task marked as Completed`);

        // ✅ Update frontend state
        const updatedTasks = task.map((a) =>
          (a.id == taskId ? { ...response } : a)
        );
        setTasks(updatedTasks); // make sure setTasks is defined via useState
      }
    } catch (error) {
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  const handleTaskApprove = async (taskId) => {
    const selectedTask = task.find((f) => f.id == taskId);

    if (!selectedTask) {
      toast.error(`Task Does Not Exist`);
      return;
    }

    const updatedTask = { ...selectedTask };
    updatedTask.approved = true;
    try {
      const response = await postNotifications('tasks', updatedTask, taskId);

      if (response.id) {
        toast.success(`Task Approved Successfully`);

        // ✅ Update frontend state
        const updatedTasks = task.map((a) =>
          (a.id == taskId ? { ...response } : a)
        );
        setTasks(updatedTasks); // make sure setTasks is defined via useState
      }
    } catch (error) {
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      try {
        const response = await deleteNotifications("tasks", taskId);
        if (response.ok) {
          setTasks(task.filter((t) => t.id !== taskId));
          toast.success("Task deleted successfully.");
        } else {
          toast.error(`Failed to delete task: ${response.status}`);
          console.error("Failed to delete task:", response.status);
        }
      } catch (error) {
        toast.error(`Error deleting task: ${error}`);
        console.error("Error deleting task:", error);
      }
    }
  };

  const taskHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "From", key: "from_name", sortable: true },
    { label: "To", key: "to_name", sortable: true },
    { label: "Description", key: "details", sortable: true },
    { label: "Priority", key: "priority", sortable: true },
    { label: "Assign Date", key: "created_at_formatted", sortable: true },
    { label: "Due Date", key: "due_date_formatted", sortable: true },
    { label: "Completed?", key: "completed_formatted", sortable: true },
    { label: "Approved?", key: "approved_formatted", sortable: true },
    { label: "Updated At", key: "updated_at_formatted", sortable: true },
    { label: "Actions", key: "actions" },
  ];

  const taskData = filteredTasks.map((taskItem, index) => ({
    serial_no: index + 1,
    from_name: taskItem.from_name || "N/A",
    to_name: taskItem.to_name || "N/A",
    details: taskItem.details || "N/A",
    priority: taskItem.priority || "N/A",
    created_at_formatted: new Date(taskItem.created_at).toLocaleString(),
    due_date_formatted: new Date(taskItem.due_date).toLocaleString(),
    completed_formatted: taskItem.completed ? "YES" : "NO",
    approved_formatted: taskItem.approved ? "YES" : "NO",
    updated_at_formatted: new Date(taskItem.updated_at).toLocaleString(),
    actions: (
      <div>
        <button
          className="action-button update-button mr-2"
          onClick={() => handleUpdate(taskItem.id)}
        >
          Update
        </button>
        <button
          className="action-button delete-button mr-2"
          onClick={() => handleDelete(taskItem.id)}
        >
          Delete
        </button>
        {(user?.id == taskItem._to) && !(taskItem.completed) ? (
          <button className="action-button bg-blue-500 text-white" onClick={() => handleDone(taskItem.id)}>
            Mark As Done
          </button>
        ) : null}
        {(user?.id == taskItem._from) && (taskItem.completed) ? (
          <button className="action-button bg-green-500 text-white ml-2" onClick={() => handleTaskApprove(taskItem.id)}>
            Approve Task
          </button>
        ) : null}
      </div>
    ),
  }));

  return (
    <div className="task-page">
      <h1 className="page-title">Task Details</h1>
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        buttonText={"Add Task"}
        onButtonClick={() => {
          navigate(`/add-task`);
        }}
      />
      {isLoading ? (
        <p>Loading tasks...</p>
      ) : (
        <ReusableTable headers={taskHeaders} data={taskData} />
      )}
    </div>
  );
};

export default TaskPage;