// TokenAPIs.jsx
const apiUrl = import.meta.env.VITE_API_URL;

// Function to handle login and get the token
export const loginUser = async (user_name, password) => {
  try {
    const response = await fetch(`${apiUrl}/api/token/`, {
      method: "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json", // Make sure the body is JSON

      },
      body: JSON.stringify({ user_name, password }), // Send user_name and password as JSON
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the token data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

// Function to verify the token
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${apiUrl}/api/verify-token/`, {
      method: "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
        "Content-Type": "application/json", // Make sure the body is JSON
      },
      body: JSON.stringify({ token: token }), // Send the token as part of the request body
    });

    if (!response.ok) {
      throw new Error(`Token verification failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Return the response from the verification API
  } catch (error) {
    console.error("Token Verification Error:", error);
    throw error;
  }
};
