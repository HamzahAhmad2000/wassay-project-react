
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');


export const getTaxes = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/receipts/taxes/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`,
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the Tax data
  } catch (error) {
      console.error("Error Fetching Tax:", error);
      throw error;
  }
};

export const postTaxes = async (post_data, id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/receipts/taxes/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    
    return data; // This will return the Tax data
  } catch (error) {
    console.error("Error Submitting Tax:", error);
    throw error;
  }
};

export const deleteTaxes = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/receipts/taxes/${id}/`, {
    method: "DELETE",
     headers: {
       "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response;
  return data; // This will return the Tax data
} catch (error) {
  console.error("Error Deleting Tax:", error);
  throw error;
}
};

export const getReceipts = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/receipts/receipts/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`,
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the Tax data
  } catch (error) {
      console.error("Error Fetching Tax:", error);
      throw error;
  }
};

export const postReceipts = async (post_data, id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/receipts/receipts/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PUT" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    
    return data; // This will return the Tax data
  } catch (error) {
    console.error("Error Submitting Tax:", error);
    throw error;
  }
};

export const deleteReceipts = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/receipts/receipts/${id}/`, {
    method: "DELETE",
     headers: {
       "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response;
  return data; // This will return the Tax data
} catch (error) {
  console.error("Error Deleting Tax:", error);
  throw error;
}
};



export const getGiftCards = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/receipts/gift-cards/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`,
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the Tax data
  } catch (error) {
      console.error("Error Fetching Tax:", error);
      throw error;
  }
};

export const postGiftCards = async (post_data, id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/receipts/gift-cards/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    const data = await response.json();

    return data; // This will return the Tax data
  } catch (error) {
    console.error("Error Submitting Tax:", error);
    throw error;
  }
};


export const postBulkGiftCards = async (post_data, id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/receipts/gift-cards/bulk-create/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    const data = await response.json();

    return data; // This will return the Tax data
  } catch (error) {
    console.error("Error Submitting Tax:", error);
    throw error;
  }
};

export const deleteGiftCards = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/receipts/gift-cards/${id}/`, {
    method: "DELETE",
     headers: {
       "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response;
  return data; // This will return the Tax data
} catch (error) {
  console.error("Error Deleting Tax:", error);
  throw error;
}
};





export const getDiscounts = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/receipts/discounts/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`,
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the Discount data
  } catch (error) {
      console.error("Error Fetching Discount:", error);
      throw error;
  }
};

export const postDiscounts = async (post_data, id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/receipts/discounts/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    
    return data; // This will return the Discount data
  } catch (error) {
    console.error("Error Submitting Discount:", error);
    throw error;
  }
};

export const deleteDiscounts = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/receipts/discounts/${id}/`, {
    method: "DELETE",
     headers: {
       "ngrok-skip-browser-warning": "true",
      Authorization: `Bearer ${token}`
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response;
  return data; // This will return the Discount data
} catch (error) {
  console.error("Error Deleting Discount:", error);
  throw error;
}
};