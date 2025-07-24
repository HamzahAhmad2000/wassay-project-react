'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  KeyIcon, 
  ShieldIcon, 
  LogOutIcon, 
  MenuIcon, 
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from 'lucide-react';
import { Button } from './button';

const Sidebar = ({ activeSection, onSectionChange, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(true);
  const { user, logout } = useAuth();
  const { hasPermission } = useUserPermissions();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      href: '/'
    },
    {
      id: 'user-management',
      label: 'User Management',
      icon: UsersIcon,
      isExpandable: true,
      isOpen: isUserManagementOpen,
      onToggle: () => setIsUserManagementOpen(!isUserManagementOpen),
      children: [
        {
          id: 'permissions',
          label: 'Permissions',
          icon: KeyIcon,
          requiredPermission: 'read_permissions'
        },
        {
          id: 'roles',
          label: 'Roles',
          icon: ShieldIcon,
          requiredPermission: 'read_roles'
        }
      ]
    }
  ];

  // Permission checking is now handled by the useUserPermissions hook

  const renderNavigationItem = (item, level = 0) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;
    const hasAccess = hasPermission(item.requiredPermission);
    
    if (!hasAccess) return null;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (item.isExpandable && item.onToggle) {
              item.onToggle();
            } else {
              onSectionChange(item.id);
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
            level > 0 ? 'pl-8' : ''
          } ${
            isActive 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon className={`h-5 w-5 ${isCollapsed && level === 0 ? 'mx-auto' : ''}`} />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.isExpandable && (
                item.isOpen ? 
                  <ChevronDownIcon className="h-4 w-4" /> : 
                  <ChevronRightIcon className="h-4 w-4" />
              )}
            </>
          )}
        </button>
        
        {item.children && item.isOpen && !isCollapsed && (
          <div className="bg-gray-25">
            {item.children.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <MenuIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b bg-gray-50">
            <div className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {user.roles?.join(', ')}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2">
          {navigationItems.map(item => renderNavigationItem(item))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOutIcon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Sidebar; 