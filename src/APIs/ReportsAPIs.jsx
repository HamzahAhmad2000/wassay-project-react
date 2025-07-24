import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;

export const apiReport = async (reportName, id = null) => {
  try {
    const token = localStorage.getItem('OrbisAccessToken'); // Fetch token inside function
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = `${apiUrl}/api/products/sales/${reportName}${id ? `/${id}` : ''}`; // Cleaner URL handling
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${reportName} report:`, error);
    toast.error(`Failed to fetch ${reportName} report: ${error.message}`);
    throw error;
  }
};