import { toast } from "react-toastify";

// TokenAPIs.jsx
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('OrbisAccessToken');

/*product Api Calls*/
export const getProducts = async (id = null, filters = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/products/${ filters ? ("?search=" + filters) :""}${id ? id : ""}`, {
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
    return data; // This will return the product data
  } catch (error) {
    console.error("Error Fetching product:", error);
    throw error;
  }
};

export const postProduct = async (post_data, id = null) => {
  try {
    // Construct base URL
    const baseEndpoint = id ? "products" : "Bulkproducts";
    const url = `${apiUrl}/api/products/${baseEndpoint}/${id ? `${id}/` : ""}`;

    const response = await fetch(url, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
      body: post_data,
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw response for debugging
      console.error("Error response:", response.status, errorText);
      throw new Error(`API call failed with status ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("Error submitting product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/products/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};


/*product Api Calls*/
export const getSuppliers = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/suppliers/${id ? id : ""}`, {
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
    return data; // This will return the product data
  } catch (error) {
    console.error("Error Fetching suppliers:", error);
    throw error;
  }
};
export const postSuppliers = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/suppliers/${id ? id : ""}`, {
      method: id ? "PATCH": "POST",
       headers: { 
       "ngrok-skip-browser-warning": "true",

        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data),
    });


    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the product data

  } catch (error) {
    console.error("Error Fetching suppliers:", error);
    throw error;
  }
};


export const deleteSuppliers = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/suppliers/${id}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",

        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });


    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    
    const data = await response;
    toast.success("Supplier Deleted Successfully")
    return data; // This will return the product data

  } catch (error) {
    console.error("Error DELETING suppliers:", error);
    toast.error("Error DELETING suppliers: ", error)
    throw error;
  }
};



export const postPurchaseOrder = async (post_data, id = null) => {
  try {

    console.log(post_data)

    Object.keys(post_data).map((key)=>{
      console.log(key, post_data[key])
    })

    const url = id ? `update-purchase_order/${id}/`: `purchase-order-products/` 
    const response = await fetch(`${apiUrl}/api/products/${url}`, {
      method: id ? "PUT" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/json",
      },
      body: post_data, // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Purchase Order: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Purchase Order:`, error);
    throw error;
  }
};




export const getPurchaseOrders = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/purchase-order-products/${id ? (id.toString() + "/") : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Purchase Order: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json(); // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error Fetching Purchase Order:`, error);
    throw error;
  }
};


export const deletePurchaseOrders = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/purchase-order-products/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete Purchase Order: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};




export const postSupplierInvoice = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-invoice/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: post_data, // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} supplier invoice: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} supplier invoice:`, error);
    throw error;
  }
};






export const getSupplierInvoices = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-invoice/${id ? (id.toString() + "/") : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Purchase Order: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json(); // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error Fetching Purchase Order:`, error);
    throw error;
  }
};


export const deleteSupplierInvoices = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-invoice/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete Purchase Order: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};
export const postSupplierPayment = async (formData, id = null) => {
  try {
    const token = localStorage.getItem("OrbisAccessToken"); // Assuming token is stored in localStorage
    const response = await fetch(`${apiUrl}/api/products/supplier-payments/${id ? id.toString() + "/" : ""}`, {
      method: id ? "PATCH" : "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to ${id ? "update" : "submit"} Supplier Payment: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Supplier Payment:`, error);
    throw error;
  }
};



export const ApproveSupplierPayment = async (id) => {
  try {
    const token = localStorage.getItem("OrbisAccessToken"); // Assuming token is stored in localStorage
    const response = await fetch(`${apiUrl}/api/products/approve-supplier-payment/${id}/`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to approve Supplier Payment: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error approving Supplier Payment:`, error);
    throw error;
  }
};



export const getSupplierPayments = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-payments/${id ? (id.toString() + "/") : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Supplier Payment: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error fetching Supplier Payment:`, error);
    throw error;
  }
};

export const deleteSupplierPayment = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-payments/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });


    if (!response.ok) {
      throw new Error(`Failed to delete Supplier Payment: ${response.status} - ${response.statusText}`);
    }
    else
      toast.success("Successfully deleted record")

    return response;
  } catch (error) {
    console.error("Error deleting Supplier Payment:", error);
    throw error;
  }
};








export const getCategories = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/category/${id ? id : ""}`, {
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
    return data; // This will return the Warehouse data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};


export const getAllCategories = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/all-category/${id ? id : ""}`, {
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
    return data; // This will return the Warehouse data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};


export const getCategoryChildren = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/category/get_children/${id}/`, {
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
    return data; // This will return the Warehouse data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postCategory = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/${id? 'update-category' : 'category'}/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PUT" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Warehouse: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Warehouse:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/delete-category/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};



export const getGRNs = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/grn_products/${id ? id : ""}`, {
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
    return data; // This will return the Warehouse data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postGRN = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/grn_products/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: post_data, // Ensure payload is stringified
    });

    // if (!response.ok) {
    //   throw new Error(`Failed to ${id ? "update" : "submit"} GRN: ${response.status} - ${response.statusText}`);
    // }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} GRN:`, error);
    throw error;
  }
};


export const postHomemadeProducts = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/home-made-products/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    const data = await response.json(); // Parse JSON response

    if (data.error){
      toast.error(data.default_products[0].error)
    }
    else
     toast.success(data.message)

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Home made Product: ${response.status} - ${response.statusText}`);
    }
    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Home made Product:`, error);
    return error;
  }
};

export const deleteGRN = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/grn_products/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    throw error;
  }
};



export const getInventories = async (id = null, filter = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory/${filter ? "?product="+filter: ""}${id ? id : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,

      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};


export const getOpenProducts = async ()=>{
  try {
    const response = await fetch(`${apiUrl}/api/products/open-products`, {
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
    return data; // This will return the Open Products data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
}
}


export const getInventoryByBranch = async (name, id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory${id ? ("/?" + name + "=" + id): ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};


export const getPriceCheckerInventory = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/products/products-selling/`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postInventory = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Inventory: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Inventory:`, error);
    throw error;
  }
};




export const deleteInventory = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw error;
  }
};





export const getRawMaterials = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/get_raw_materials/${id ? id : ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const getHouseMadeProducts = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/get_housemade_products/${id ? id : ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const getBundleProducts = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/get_bundle_products/${id ? id : ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const getIngredients = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/ingredients/grouped/${id ? id : ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const getIngredientByBranch = async (branch) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/ingredient/?branch=${branch}`, {
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
    return data; // This will return the Ingredient data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postIngredient = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/ingredients/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Ingredient: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Ingredient:`, error);
    throw error;
  }
};




export const deleteIngredient = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/ingredient/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    throw error;
  }
};



export const getBundles = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/bundles/grouped/${id ? id : ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const getBundleByBranch = async (branch) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/bundle/?branch=${branch}`, {
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
    return data; // This will return the Bundle data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const postBundle = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/bundles/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Bundle: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Bundle:`, error);
    throw error;
  }
};




export const deleteBundle = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/bundle/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the Company data
  } catch (error) {
    console.error("Error deleting bundle:", error);
    throw error;
  }
};




export const postPackingProducts = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/add_packaging/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} Packing Products: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} Packing Products:`, error);
    throw error;
  }
};



export const getOpenProductsPrice = async(id)=>{
  try {
    const response = await fetch(`${apiUrl}/api/products/get-open-products-price/${id}`, {
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

    return data
  } catch (error) {
    console.error("Cant get the price:", error);
    throw error;
  }
}


export const getOpenProductsAccordingToGRN = async(id)=>{
  try {
    const response = await fetch(`${apiUrl}/api/products/open-products/${id}`, {
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

    return data
  } catch (error) {
    console.error("Cant get the price:", error);
    throw error;
  }
}


export const postPackages = async(data, id)=>{
  try {
    const response = await fetch(`${apiUrl}/api/products/packages-new/${id ? id + "/": ""}`, {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(data),
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
        "content-type": "application/json"
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    const data = await response.json();

    return data
  } catch (error) {
    console.error("Cant Post the Package:", error);
    throw error;
  }
}


export const getPackages = async(data, id)=>{
  try {
    const response = await fetch(`${apiUrl}/api/products/package-groups/${id ? id + "/": ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    const data = await response.json();

    return data
  } catch (error) {
    console.error("Cant Post the Package:", error);
    throw error;
  }


}

export const getPurchaseOrdersAgainstSupplier = async (supplierID) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/purchase-order-products/?supplier_id=${supplierID}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Supplier Payment: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error fetching Purchase Orders against Supplier:`, error);
    throw error;
  }
}



export const getSupplierInvoiceAgainstSupplierAndPurchaseOrder = async (supplierID, purchaseOrderID) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-invoice/?supplier_id=${supplierID}&purchase_order=${purchaseOrderID}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Supplier Payment: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error fetching Supplier Invoice:`, error);
    throw error;
  }

}



export const getSupplierPaymentsAgainstPurchaseOrder = async (purchase_order) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-payments/?purchase_order=${purchase_order ? (purchase_order.toString()) : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Supplier Payment: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error fetching Supplier Payment:`, error);
    throw error;
  }
};






export const getPaymentDates = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/products/payment-calendar`, 
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`
        }
      }
    )

    return response.json()

  } catch (error) {
    
    toast.error(error.message)
  }
}


export const getSupplierLedgers = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/products/supplier-ledgers`, 
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`
        }
      }
    )

    return response.json()

  } catch (error) {
    
    toast.error(error.message)
  }
}


export const getEventDates = async (date) => {
   try {
    console.log(date)
    const response = await fetch(`${apiUrl}/api/products/events-by-date/?date=${date}`, 
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = response.json()

    console.log(data)
    return data

  } catch (error) {
    
    toast.error(error.message)
  }
}




export const getInventoryAdjustments = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory-adjustments/${id ? ("/" + id.toString()): ""}`, {
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
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};


export const postInventoryAdjustments = async (post_data, id) => {
  try {
    console.log(" id : " ,id)
    const response = await fetch(`${apiUrl}/api/products/inventory-adjustments/${id ? ("/" + id.toString()): ""}`, {
      method: id ? "PUT" : "POST",
       headers: {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
        
      },
      body: post_data,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const approveInventoryAdjustments = async (post_data, id) => {
  try {
    console.log(" id : " ,id)
    console.log(" post_data : " ,post_data)
    const response = await fetch(`${apiUrl}/api/products/inventory-adjustments/${id ? (id + "/" ): ""}`, {
      method: "PATCH",
       headers: {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify(post_data),
    });

    const data = await response.json();
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};



export const deleteInventoryAdjustments = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory-adjustments/${id ? ("/" + id.toString()): ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // This will return the Inventory data
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};





export const postInventoryTransfer = async (post_data, id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory-transfers/${id ? (id.toString() + "/") : ""}`, {
      method: id ? "PATCH" : "POST",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
        "content-type": "application/json"
        
      },
      body: JSON.stringify(post_data), // Ensure payload is stringified
    });

    if (!response.ok) {
      throw new Error(`Failed to ${id ? "update" : "submit"} inventory transfer: ${response.status} - ${response.statusText}`);
    }
    const data = await response; // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error ${id ? "updating" : "submitting"} inventory transfer:`, error);
    throw error;
  }
};






export const getInventoryTransfers = async (id = null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory-transfers/${id ? (id.toString() + "/") : ""}`, {
      method: "GET",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory transfer: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json(); // Parse JSON response

    return data // Parse JSON response
  } catch (error) {
    console.error(`Error Fetching inventory transfer:`, error);
    throw error;
  }
};


export const deleteInventoryTransfers = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/inventory-transfers/${id ? (id.toString() + "/") : ""}`, {
      method: "DELETE",
       headers: {
       "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete inventory transfer: ${response.status} - ${response.statusText}`);
    }

    const data = await response;
    return data; // This will return the inventory transfer
  } catch (error) {
    console.error("Error deleting inventory transfer:", error);
    throw error;
  }
};





export const getContractDocumentCategory = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/contract-document-categories/${id ? id : ""}`, {
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
    console.error("Error Fetching contract-document-categories:", error);
    toast.error(' Error Fetching ContractDocumentCategory')
    throw error;
  }
};

export const postContractDocumentCategory = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/products/contract-document-categories/${id ? (id.toString()+"/") : ""}`, {
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
      return data; // This will return the contract-document-categories data
    } catch (error) {
      console.error("Error Submitting contract-document-categories:", error);
      toast.error("Error Submitting contract-document-categories");
      throw error;
    }
};

export const deleteContractDocumentCategory = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/contract-document-categories/${id}/`, {
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
    return data; // This will return the contract-document-categories data
  } catch (error) {
    console.error("Error Deleting contract-document-categories:", error);
    toast.error("Error Deleting contract-document-categories");
    throw error;
  }
};







export const getContractDocuments = async (id=null) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/contract-documents/${id ? id : ""}`, {
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
    console.error("Error Fetching contract-documents:", error);
    toast.error(' Error Fetching ContractDocument')
    throw error;
  }
};

export const postContractDocument = async (post_data, id=null) => {

    
    try {
      const response = await fetch(`${apiUrl}/api/products/contract-documents/${id ? (id.toString()+"/") : ""}`, {
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
      return data; // This will return the contract-documents data
    } catch (error) {
      console.error("Error Submitting contract-documents:", error);
      toast.error("Error Submitting contract-documents");
      throw error;
    }
};

export const deleteContractDocument = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/api/products/contract-documents/${id}/`, {
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
    return data; // This will return the contract-documents data
  } catch (error) {
    console.error("Error Deleting contract-documents:", error);
    toast.error("Error Deleting contract-documents");
    throw error;
  }
};



export const ApproveContractDocument = async (id) => {
  try {
    const token = localStorage.getItem("OrbisAccessToken"); // Assuming token is stored in localStorage
    const response = await fetch(`${apiUrl}/api/products/approve-supplier-payment/${id}/`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to approve Supplier Payment: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error approving Supplier Payment:`, error);
    throw error;
  }
};