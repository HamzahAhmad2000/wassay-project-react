import { toast } from "react-toastify";

// TokenAPIs.jsx
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

/*Company Api Calls*/ 
export const getCompanies = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/companies/${id ? id : ""}`, {
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
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Fetching Company:", error);
    throw error;
  }
};

export const postCompanies = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/companies/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteCompanies = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/companies/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};

/*Branch Api Calls*/ 
export const getBranches = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/branches/${id ? `${id}/` : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error:", response)

      throw new Error(`Failed to fetch branches: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};


export const getBranchesByCompany = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/branches/?company=${id ? `${id}` : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error:", response)

      throw new Error(`Failed to fetch branches: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

export const postBranches = async (post_data, id = null) => {
  
  try {
    const response = await fetch(`${apiUrl}/api/company/branches/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      console.error("Error:", response)

      throw new Error(`Failed to ${id? "update":"submit"} branch: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating":"submitting"} branch:`, error);
    throw error;
  }
};

export const deleteBranches = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/branches/${id}/`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error:", response)

      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};
  
/*Warehouse Api Calls*/ 
export const getWareHouses = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/warehouses/${id ? id : ""}`, {
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
    return data; // This will return the Warehouse data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postWarehouses = async (post_data, id = null) => {
  
  try {
    const response = await fetch(`${apiUrl}/api/company/warehouses/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      console.error("Error:", response)

      throw new Error(`Failed to ${id? "update":"submit"} Warehouse: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating":"submitting"} Warehouse:`, error);
    throw error;
  }
};

export const deleteWarehouses = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/warehouses/${id ? (id.toString()+"/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};

/*Languages Api Calls*/
export const getLanguages = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/languages/${id ? id : ""}`, {
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
    return data; // This will return the languages data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

/*Currencies Api Calls*/
export const getCurrencies = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/currencies/${id ? id : ""}`, {
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
    return data; // This will return the currencies data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};







export const getBanks = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/Bank/${id ? id : ""}`, {
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
    return data; // This will return the Bank data
  } catch (error) {
    console.error("Error Fetching Bank:", error);
    throw error;
  }
};



export const postBanks = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/Bank/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteBanks = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/Bank/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};






export const getFloors = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/floors/${id ? id : ""}`, {
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
    return data; // This will return the floors data
  } catch (error) {
    console.error("Error Fetching floors:", error);
    throw error;
  }
};

export const postFloors = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/floors/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteFloors = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/floors/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};


export const getSide = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/sides/${id ? id : ""}`, {
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
    return data; // This will return the sides data
  } catch (error) {
    console.error("Error Fetching sides:", error);
    throw error;
  }
};

export const postSide = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/sides/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error("Error:",data.non_field_errors[0])
        toast.error(`Error: ${data.non_field_errors[0]}`)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteSide = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/sides/${id}/`, {
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

    const data = await response
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};


export const getAisle = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/aisles/${id ? id : ""}`, {
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
    return data; // This will return the aisles data
  } catch (error) {
    console.error("Error Fetching aisles:", error);
    throw error;
  }
};

export const postAisle = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/aisles/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteAisle = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/aisles/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};





export const getProfit = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/profit-log/${id ? id : ""}`, {
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
    return data; // This will return the profit-log data
  } catch (error) {
    console.error("Error Fetching profit-log:", error);
    throw error;
  }
};

export const postProfit = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/profit-log/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteProfit = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/profit-log/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};




export const getBankTransfers = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/banktransfers/${id ? id : ""}`, {
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
    return data; // This will return the banktransfers data
  } catch (error) {
    console.error("Error Fetching banktransfers:", error);
    throw error;
  }
};

export const postBankTransfers = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/banktransfers/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};




export const getLPR = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/loyalty-point-rules/${id ? id : ""}`, {
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
    return data; // This will return the loyalty-point-rules data
  } catch (error) {
    console.error("Error Fetching loyalty-point-rules:", error);
    throw error;
  }
};

export const postLPR = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/loyalty-point-rules/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting Company:", error);
      throw error;
    }
};

export const deleteLPR = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/loyalty-point-rules/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting Company:", error);
    throw error;
  }
};




// Fetch expenses (list or single)
export const getExpenses = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/expenses/${id ? `${id}/` : ""}`, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error:", response, errorData);
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns array for list or object for single expense
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

// Create or update an expense
export const postExpenses = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/expenses/${id ? `${id}/` : ""}`, {
      method: id ? "PUT" : "POST", // Use PUT for updates
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        // Do not set Content-Type; browser handles multipart/form-data for FormData
      },
      body: post_data, // Expects FormData for create/update
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error:", response, errorData);
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns { id, ... } for created/updated expense
  } catch (error) {
    console.error("Error submitting expense:", error);
    throw error;
  }
};

// Delete an expense
export const deleteExpenses = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/expenses/${id}/`, {
      method: "DELETE",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error:", response, errorData);
      throw new Error(errorData.error || `API call failed: ${response.statusText}`);
    }

    // DELETE returns 204 No Content with no body
    return { success: true }; // Return a simple success object
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};







export const getBankTransactions = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/bank-transactions/${id ? id : ""}`, {
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
    return data; // This will return the Bank data
  } catch (error) {
    console.error("Error Fetching bank-transactions:", error);
    throw error;
  }
};



export const postBankTransactions = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/bank-transactions/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
  
      const data = await response;
      return data; // This will return the Company data
    } catch (error) {
      console.error("Error Submitting bank-transactions:", error);
      throw error;
    }
};

export const deleteBankTransactions = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/bank-transactions/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error Deleting bank-transactions:", error);
    throw error;
  }
};








export const getAssets = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/assets/${id ? id : ""}`, {
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
    return data; // This will return the assets data
  } catch (error) {
    console.error("Error Fetching assets:", error);
    toast.error(' Error Fetching Assets')
    throw error;
  }
};

export const postAssets = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/assets/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`
        },
        body: post_data,
      });
      const data= await response.json()

      console.log(data)
      if (!data.id) {
        console.error("Error:", response)
        Object.keys(data).forEach((key) => {
          toast.error(`${key}: ${data[key]}`);
        }
        );
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      // const data = await response.json();
      return data; // This will return the Asset data
    } catch (error) {
      console.error("Error Submitting Asset:", error);
      toast.error("Error Submitting Asset");
      throw error;
    }
};

export const deleteAssets = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/assets/${id}/`, {
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

    const data = await response.json();
    return data; // This will return the Asset data
  } catch (error) {
    console.error("Error Deleting Asset:", error);
    toast.error("Error Deleting Asset");
    throw error;
  }
};






export const getOtherIncomeCategory = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/other-income-categories/${id ? id : ""}`, {
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
    return data; // This will return the assets data
  } catch (error) {
    console.error("Error Fetching other-income-categories:", error);
    toast.error(' Error Fetching OtherIncomeCategory')
    throw error;
  }
};

export const postOtherIncomeCategory = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/other-income-categories/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",

        },
        body: post_data,
      });
      const data= await response.json()

      console.log(data)
      if (!data.id) {
        console.error("Error:", response)
        Object.keys(data).forEach((key) => {
          toast.error(`${key}: ${data[key]}`);
        }
        );
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      // const data = await response.json();
      return data; // This will return the other-income-categories data
    } catch (error) {
      console.error("Error Submitting other-income-categories:", error);
      toast.error("Error Submitting other-income-categories");
      throw error;
    }
};

export const deleteOtherIncomeCategory = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/other-income-categories/${id}/`, {
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
    return data; // This will return the other-income-categories data
  } catch (error) {
    console.error("Error Deleting other-income-categories:", error);
    toast.error("Error Deleting other-income-categories");
    throw error;
  }
};







export const getOtherSourceOfIncomes = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/other-sources-of-income/${id ? id : ""}`, {
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
    return data; // This will return the assets data
  } catch (error) {
    console.error("Error Fetching other-sources-of-income:", error);
    toast.error(' Error Fetching OtherSourceOfIncome')
    throw error;
  }
};

export const postOtherSourceOfIncome = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/company/other-sources-of-income/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,

        },
        body: post_data,
      });
      const data= await response.json()

      console.log(data)
      if (!data.id) {
        console.error("Error:", response)
        Object.keys(data).forEach((key) => {
          toast.error(`${key}: ${data[key]}`);
        }
        );
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      // const data = await response.json();
      return data; // This will return the other-sources-of-income data
    } catch (error) {
      console.error("Error Submitting other-sources-of-income:", error);
      toast.error("Error Submitting other-sources-of-income");
      throw error;
    }
};

export const deleteOtherSourceOfIncome = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/company/other-sources-of-income/${id}/`, {
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
    return data; // This will return the other-sources-of-income data
  } catch (error) {
    console.error("Error Deleting other-sources-of-income:", error);
    toast.error("Error Deleting other-sources-of-income");
    throw error;
  }
};
