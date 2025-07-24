import { toast } from "react-toastify";

// TokenAPIs.jsx
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

/*Customer Api Calls*/ 
export const getCustomers = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customers/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Fetching Customer:", error);
    throw error;
  }
};

export const postCustomers = async (post_data, id=null) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/customers/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data),
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Customer data
    } catch (error) {
      console.error("Error Submitting Customer:", error);
      throw error;
    }
};

export const deleteCustomers = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customers/${id}/`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
        console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Deleting Customer:", error);
    throw error;
  }
};





export const getCustomerLedgers = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customer-ledgers/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Fetching Customer:", error);
    throw error;
  }
};

export const postCustomerLedgerPayments = async (post_data, id=null) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/repayments/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data),
      });
  
      if (!response.ok) {
        const data = await response.json()
        console.error("Error:", response)
        // console.error("Error:", data)
        toast.error("response", data.non_field_errors.replace("[", ""). replace("]", ""))
        if(data.non_field_errors)
          toast.error((data.non_field_errors.replace("[", " "). replace("]", " ").replace("'", "")))
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Customer data
    } catch (error) {
      console.error("Error Submitting Customer:", error);
      throw error;
    }
};







export const getCustomerPayments = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/repayments/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Fetching Customer:", error);
    throw error;
  }
};




export const getCLP = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customer-loyalty-points/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the customer-loyalty-points data
  } catch (error) {
    console.error("Error Fetching customer-loyalty-points:", error);
    throw error;
  }
};


export const getCLPByCustomer = async (customer=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customer-loyalty-points/${customer ? ("?customer=" + customer) : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the customer-loyalty-points data
  } catch (error) {
    console.error("Error Fetching customer-loyalty-points:", error);
    throw error;
  }
};

export const postCLP = async (post_data, id=null) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/customer-loyalty-points/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data),
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the customer-loyalty-points data
    } catch (error) {
      console.error("Error Submitting customer-loyalty-points:", error);
      throw error;
    }
};

export const deleteCLP = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/customer-loyalty-points/${id}/`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
        console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the customer-loyalty-points data
  } catch (error) {
    console.error("Error Deleting customer-loyalty-points:", error);
    throw error;
  }
};





/*Customer Api Calls*/ 
export const getCustomerReviews = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/reviews/${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Fetching Customer Review:", error);
    throw error;
  }
};

export const postCustomerReviews = async (post_data, id=null) => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/reviews/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data),
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Customer data
    } catch (error) {
      console.error("Error Submitting Customer Review:", error);
      throw error;
    }
};

export const deleteCustomerReviews = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/customers/reviews/${id}/`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
        console.error("Error:", response)
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Customer data
  } catch (error) {
    console.error("Error Deleting Customer Review:", error);
    throw error;
  }
};