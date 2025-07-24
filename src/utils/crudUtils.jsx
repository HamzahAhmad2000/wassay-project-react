// utils/crudUtils.js

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const useNavigation = () => useNavigate(); // Custom hook for navigation

export const handleUpdate = (itemId, data, navigate, updateRoute, entityName) => {
  const item = data.find((item) => item.id === itemId);
  if (item) {
    navigate(updateRoute(itemId), { state: { [entityName.slice(0, -1)]: item } }); // Adjust state name as needed
  } else {
    toast.error(`${entityName.slice(0, -1)} with ID ${itemId} not found.`);
  }
};

export const handleDelete = async (itemId, deleteFn, setData, entityName) => {
  const confirmDelete = window.confirm(`Are you sure you want to delete this ${entityName.slice(0, -1)}?`);
  if (confirmDelete) {
    try {
      const response = await deleteFn(itemId);
      if (response.ok) {
        setData((prevData) => prevData.filter((item) => item.id !== itemId));
        toast.success(`${entityName.slice(0, -1)} deleted successfully.`);
      } else {
        toast.error(`Failed to delete ${entityName.slice(0, -1)}: ${response.status}`);
        console.error(`Failed to delete ${entityName.slice(0, -1)}:`, response.status);
      }
    } catch (error) {
      toast.error(`Error deleting ${entityName.slice(0, -1)}: ${error.message}`);
      console.error(`Error deleting ${entityName.slice(0, -1)}:`, error);
    }
  }
};