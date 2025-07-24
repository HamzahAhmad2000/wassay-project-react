const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

const apiRequest = async (method, model, body = null, id = null) => {
  try {
    const needsTrailingSlash = ["POST", "PATCH", "PUT", "DELETE"].includes(method);
    const url = `${apiUrl}/api/requests/${model}/${id || ""}${needsTrailingSlash && id ? "/" : ""}`;

    const response = await fetch(url, {
      method,
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
        ...(body && { "Content-Type": "application/json" }),
      },
      ...(body && { body }),
    });

    if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
    const data = await response.json()
    return data;
  } catch (error) {
    console.error(`Error during ${method} request:`, error);
    throw error;
  }
};

export const getNotifications = (model, id = null) =>{
  return apiRequest("GET", model, null, id);
}

export const postNotifications = (model, body, id = null) =>{
  return apiRequest(id ? "PATCH" : "POST", model, JSON.stringify(body), id);
}

export const deleteNotifications = (model, id) =>{
  return apiRequest("DELETE", model, null, id);
}