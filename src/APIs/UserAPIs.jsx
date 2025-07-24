import { toast } from "react-toastify";

const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

export const getUsers = async (id = null) => {
    try{
        const response = await fetch(`${apiUrl}/api/users/users/${id ? id : ""}`, {
            method: "GET",
             headers: {
       "ngrok-skip-browser-warning": "true",
                "Authorization": `Bearer ${token}`
            },
        })
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return data; // This will return the User data
    } catch (error) {
        console.error("Error Fetching User:", error);
        throw error;
    }
}
export const postUsers = async (post_data, id=null) => {
    
    
    try {
      const response = await fetch(`${apiUrl}/api/users/users/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
        },
        body: post_data,
      });
  
      if (!response.ok) {
        console.error("Error:", response)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response;
      
      return data; // This will return the User data
    } catch (error) {
      console.error("Error Submitting User:", error);
      throw error;
    }
};
export const createUsers = async (post_data, id = null) => {
    
    try {
      const response = await fetch(`${apiUrl}/api/users/signup/${id ? id.toString() + "/" : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
        },
        body: post_data, // Ensure the body is stringified
      });
  
      // if (!response.ok) {
      //   console.error("Error:", response);
      //   throw new Error(`API call failed: ${response.statusText}`);
      // }
  
      const data = await response.json(); // Parse JSON response
      return data; // Return the user data
    } catch (error) {
      console.error("Error Submitting User:", error);
      // throw error;
      return error
    }
};
export const deleteUsers = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/users/${id}/`, {
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
    return data; // This will return the User data
  } catch (error) {
    console.error("Error Deleting User:", error);
    throw error;
  }
};



export const getPermissions = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/permissions/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
}

export const getRoles = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/roles/${id ? id : ""}`, {
          method: "GET",
           headers: {
       "ngrok-skip-browser-warning": "true",
              "Authorization": `Bearer ${token}`
          },
      })
      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
}

export const postRoles = async (post_data, id=null) => {
    
    
    try {
      const response = await fetch(`${apiUrl}/api/users/roles/${id ? (id.toString()+"/") : ""}`, {
        method: id ? "PATCH" : "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(post_data),
      });
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Error:", data)
        toast.error(`Error: ${data.name[0]}`)
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      
      return data; // This will return the User data
    } catch (error) {
      console.error("Error Submitting User:", error);
      throw error;
    }
};

export const deleteRoles = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/roles/${id}/`, {
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
    return data; // This will return the User data
  } catch (error) {
    console.error("Error Deleting User:", error);
    throw error;
  }
};






export const getShifts = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/shift_times/${id ? id : ""}`, {
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
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
};

export const postShifts = async (post_data, id=null) => {
  
  
  try {
    const response = await fetch(`${apiUrl}/api/users/shift_times/${id ? (id.toString()+"/") : ""}`, {
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
    
    return data; // This will return the User data
  } catch (error) {
    console.error("Error Submitting User:", error);
    throw error;
  }
};

export const deleteShifts = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/users/shift_times/${id}/f`, {
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
  return data; // This will return the User data
} catch (error) {
  console.error("Error Deleting User:", error);
  throw error;
}
};


export const getSalaries = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/salaries/${id ? id : ""}`, {
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
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
};

export const postSalaries = async (post_data, id=null) => {
  
  
  try {
    const response = await fetch(`${apiUrl}/api/users/salaries/${id ? (id.toString()+"/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify(post_data)
    });

    const data = await response;
    
    
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Submitting Salary:", error);
    throw error;
  }
};

export const deleteSalaries = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/users/salaries/${id}/`, {
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
  return data; // This will return the Salary data
} catch (error) {
  console.error("Error Deleting Salary:", error);
  throw error;
}
};



export const getAdvanceSalaries = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/advance_salaries/${id ? id : ""}`, {
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
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
};


export const getAdvanceSalariesForAUser = async (id = null) => {
  try{
      const response = await fetch(`/api/users/advance_salaries/?staff_id=${id}&adjusted=${false}&total_amount=1`, {
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
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
};

export const postAdvanceSalaries = async (post_data, id=null) => {
  
  
  try {
    const response = await fetch(`${apiUrl}/api/users/advance_salaries/${id ? (id.toString()+"/") : ""}`, {
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
    
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Submitting Salary:", error);
    throw error;
  }
};

export const deleteAdvanceSalaries = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/users/advance_salaries/${id}/`, {
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
  return data; // This will return the Salary data
} catch (error) {
  console.error("Error Deleting Salary:", error);
  throw error;
}
};



export const getAttendance = async (id = null) => {
  try{
      const response = await fetch(`${apiUrl}/api/users/attendances/${id ? id : ""}`, {
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
      
      return data; // This will return the User data
  } catch (error) {
      console.error("Error Fetching User:", error);
      throw error;
  }
};

export const postAttendance = async (post_data, id=null) => {
  
  
  try {
    const response = await fetch(`${apiUrl}/api/users/attendances/${id ? (id.toString()+"/") : ""}`, {
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
    
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Submitting Salary:", error);
    throw error;
  }
};

export const deleteAttendance = async (id) => {
try {
  const response = await fetch(`${apiUrl}/api/users/attendances/${id}/`, {
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
  return data; // This will return the Salary data
} catch (error) {
  console.error("Error Deleting Salary:", error);
  throw error;
}
};




export const markTimeIn = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/users/time-in/`, {
      method: "POST",
       headers: {
         "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json() 
      throw error;
    }
    
    else{
      toast.success("Time In Marked Successfully")
    }
  
    const data = await response;
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Marking Attendance:", error.error);
    toast.error(`${error.error}`);
    throw error;
  }
};



export const markTimeOut = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/users/time-out/`, {
      method: "POST",
       headers: {
         "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json() 
      throw error;
    }
    else{
      toast.success("Time Out Marked Successfully")
    }
  
    const data = await response;
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Marking Attendance:", error.error);
    toast.error(`${error.error}`);
    throw error;
  }
};
  
  


export const getDeductedSalary = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/deductions/${id}/`, {
      method: "GET",
       headers: {
         "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`
      },
    });
    if (!response.ok) {
      const error = await response.json() 
      throw error;
    }
    const data = await response;
    return data; // This will return the Salary data
  } catch (error) {
    console.error("Error Calculating Salary Deduction:", error.error);
    toast.error(`${error.error}`);
    throw error;
  }
};
  
  

