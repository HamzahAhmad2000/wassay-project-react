import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Plus, Menu, X, ChevronDown, ChevronRight, LogOut, Home, Building, User, ShoppingBag, Users2Icon, ShoppingCart, FileText, AlertCircle } from "lucide-react";
import PropTypes from "prop-types";
// import { hasPermission } from "../utilityFunctions/unitilityFunctions";
// import { markTimeIn, markTimeOut } from "../APIs/UserAPIs";
// import RefreshToken from "./RefreshToken";
import { toast } from "react-toastify";

// Simplified menu structure for testing
const menuStructure = {
  "Company & Locations": {
    icon: <Building />,
    items: [
      { path: "/companies", label: "Companies", addPath: "/add-company", permission: "view_company", addPermission: "add_company" },
      { path: "/branches", label: "Branches", addPath: "/add-branch", permission: "view_branch", addPermission: "add_branch" },
    ]
  },
  "Employee Management": {
    icon: <User />,
    items: [
      { path: "/users", label: "Employee", addPath: "/add-user", permission: "view_customuser", addPermission: "add_customuser" },
      { path: "/roles", label: "Roles", addPath: "/add-role", permission: "view_role", addPermission: "add_role" },
    ]
  }
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [user, setUser] = useState({ user_name: "Test User", role: { name: "admin" } }); // Test user
  const [accessibleItemsMap, setAccessibleItemsMap] = useState({});

  // Simplified permission check for testing
  useEffect(() => {
    const newAccessibleItems = {};
    
    for (const [section, { items }] of Object.entries(menuStructure)) {
      newAccessibleItems[section] = items.map(item => ({
        ...item,
        canAdd: true // Allow all for testing
      }));
    }
    
    setAccessibleItemsMap(newAccessibleItems);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenSections = {};
    
    Object.entries(menuStructure).forEach(([section, { items }]) => {
      if (items.some(item => currentPath.startsWith(item.path) || currentPath === item.addPath)) {
        newOpenSections[section] = true;
      }
    });
    
    setOpenSections(prevState => ({
      ...prevState,
      ...newOpenSections
    }));
  }, [location.pathname]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("OrbisAccessToken");
    localStorage.removeItem("OrbisRefreshToken");
    localStorage.removeItem("OrbisUser");
    navigate("/login");
  };

  return (
    <>
      {/* <RefreshToken /> */}
      
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white h-full flex flex-col transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <div>
                <h2 className="text-lg font-bold">Orbis</h2>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium">{user?.user_name || "Guest"}</p>
              <p className="text-xs text-gray-400">{user?.role?.name || "No Role"}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {/* Home Link */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg mb-2 transition ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            <Home size={20} />
            <span>Home</span>
          </NavLink>

          {/* Menu Sections */}
          {Object.entries(accessibleItemsMap).map(([section, items]) => (
            <div key={section} className="mb-4">
              <button
                onClick={() => toggleSection(section)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="flex items-center space-x-3">
                  {menuStructure[section].icon}
                  <span className="font-medium">{section}</span>
                </div>
                {openSections[section] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </button>
              
              {openSections[section] && (
                <div className="ml-6 mt-2 space-y-1">
                  {items.map((item) => (
                    <SidebarItem
                      key={item.path}
                      path={item.path}
                      label={item.label}
                      addPath={item.addPath}
                      currentPath={location.pathname}
                      canAdd={item.canAdd}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-600 transition text-red-400 hover:text-white"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ path, label, addPath, currentPath, canAdd }) => {
  const isActive = currentPath === path || currentPath === addPath;
  
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg transition ${
      isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
    }`}>
      <NavLink
        to={path}
        className="flex-1 text-sm"
      >
        {label}
      </NavLink>
      {canAdd && addPath && (
        <NavLink
          to={addPath}
          className="ml-2 p-1 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition"
        >
          <Plus size={16} />
        </NavLink>
      )}
    </div>
  );
};

SidebarItem.propTypes = {
  path: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  addPath: PropTypes.string,
  currentPath: PropTypes.string.isRequired,
  canAdd: PropTypes.bool
};

export default Sidebar;