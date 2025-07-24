// TokenAPIs.jsx
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

export const getChangeLogs = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/logs/changelogs/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the changeLogs data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};