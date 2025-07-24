
export const formatDate = (dateString, year=false) => {
    if (!dateString) return "N/A";
    if (year) return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
    }).format(new Date(dateString));
    
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
    }).format(new Date(dateString));
};

// Check if user has permission for an item
export  const hasPermission = async (permission) => {
    const user = await JSON.parse(localStorage.getItem('OrbisUser'))

    if (user.is_superuser) return true; // Superuser has all permissions
    if (!permission) return true; // No permission required
    if (!user || !user.user_permissions) return false;
    
    // Check if the permission exists in the user_permissions array by codename
    return user.user_permissions.some(p => p.codename === permission);
  };
