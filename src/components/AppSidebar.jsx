import { useLocation, NavLink, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Building, 
  User, 
  Package, 
  Users, 
  Receipt, 
  FileText, 
  Settings, 
  BarChart3,
  CreditCard,
  AlertTriangle,
  ChevronDown, 
  ChevronRight, 
  LogOut,
  Warehouse,
  Banknote,
  ShoppingCart,
  ClipboardList,
  Calendar,
  DollarSign,
  Shield,
  Bell
} from "lucide-react"
import React from "react"

// Comprehensive menu configuration based on all routes
const menu = [
      {
      section: null,
      items: [
        { title: "Dashboard", path: "/", icon: Home },
      ],
    },
  {
    section: "Company Management",
    icon: Building,
    items: [
      { title: "Companies", path: "/companies" },
      { title: "Branches", path: "/branches" },
      { title: "Warehouses", path: "/warehouses" },
      { title: "Floors", path: "/floors" },
      { title: "Aisles", path: "/aisles" },
      { title: "Sides", path: "/sides" },
      { title: "Assets", path: "/assets" },
      { title: "Expenses", path: "/expenses" },
      { title: "Profit Logs", path: "/profit-logs" },
      { title: "Loyalty Point Rules", path: "/LPRs" },
      { title: "Other Income Sources", path: "/other-source-of-incomes" },
      { title: "Other Income Categories", path: "/other-source-of-income-categories" },
    ],
  },
  {
    section: "Financial Management",
    icon: Banknote,
    items: [
      { title: "Banks", path: "/banks" },
      { title: "Bank Transactions", path: "/bank-transactions" },
      { title: "Bank Transfers", path: "/bank-transfers" },
      { title: "Contract Documents", path: "/contract-documents" },
      { title: "Contract Categories", path: "/contract-documents-categories" },
    ],
  },
  {
    section: "User Management",
    icon: Users,
    items: [
      { title: "Users", path: "/users" },
      { title: "Roles", path: "/roles" },
      { title: "Shifts", path: "/shifts" },
      { title: "Salaries", path: "/salaries" },
      { title: "Advance Salaries", path: "/advance-salaries" },
      { title: "Attendance", path: "/attendance" },
    ],
  },
  {
    section: "Product Management",
    icon: Package,
    items: [
      { title: "Categories", path: "/categories" },
      { title: "Products", path: "/products" },
      { title: "Suppliers", path: "/suppliers" },
      { title: "Inventory", path: "/inventories" },
      { title: "Inventory Adjustments", path: "/inventory-adjustment" },
      { title: "Inventory Transfer", path: "/inventory-transfer" },
      { title: "Ingredients", path: "/ingredients" },
      { title: "Bundles", path: "/bundles" },
      { title: "Pack Open Products", path: "/pack-open-product" },
    ],
  },
  {
    section: "Purchase & Supply",
    icon: ShoppingCart,
    items: [
      { title: "Purchase Orders", path: "/purchase-orders" },
      { title: "GRN", path: "/grns" },
      { title: "Supplier Invoices", path: "/supplier-invoices" },
      { title: "Supplier Ledgers", path: "/supplier-ledgers" },
      { title: "Supplier Payments", path: "/supplier-payments" },
    ],
  },
  {
    section: "Customer Management",
    icon: Users,
    items: [
      { title: "Customers", path: "/customers" },
      { title: "Customer Reviews", path: "/customer-reviews" },
      { title: "Customer Ledgers", path: "/customer-ledgers" },
      { title: "Customer Payments", path: "/customer-payments" },
      { title: "CLP", path: "/CLP" },
    ],
  },
  {
    section: "Sales & Receipts",
    icon: Receipt,
    items: [
      { title: "Receipts", path: "/receipts" },
      { title: "Cashier Receipts", path: "/cashier-receipts" },
      { title: "Gift Cards", path: "/gift-cards" },
      { title: "Discounts", path: "/discounts" },
      { title: "Taxes", path: "/taxes" },
    ],
  },
  {
    section: "Reports & Analytics",
    icon: BarChart3,
    items: [
      { title: "Price Checker", path: "/price-checker" },
      { title: "Package Groups", path: "/pack" },
    ],
  },
  {
    section: "Notifications",
    icon: Bell,
    items: [
      { title: "Alerts", path: "/alerts" },
      { title: "Warnings", path: "/warnings" },
      { title: "Tasks", path: "/tasks" },
    ],
  },
  {
    section: "System",
    icon: Settings,
    items: [
      { title: "Change Logs", path: "/change-logs" },
      { title: "About", path: "/about" },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve user info from localStorage (if available)
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("OrbisUser")) || {}
    } catch {
      return {}
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("OrbisAccessToken")
    localStorage.removeItem("OrbisRefreshToken")
    localStorage.removeItem("OrbisUser")
    navigate("/login")
  }

  // track open/closed state for each section
  const [openSections, setOpenSections] = React.useState({})

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderMenuItems = (items) => {
    return items.map(({ title, path, icon: Icon }) => {
      const isActive = location.pathname === path || location.pathname.startsWith(path + "/")
      const isDashboard = title === "Dashboard"
      return (
        <SidebarMenuItem key={title}>
          <SidebarMenuButton asChild isActive={isActive} size="sm" className={`w-full h-7 ${!isDashboard ? '-mt-1' : ''}`}>
            <NavLink to={path} className="flex items-center gap-1.5 w-full px-1.5 py-1">
              {Icon && <Icon className="h-3.5 w-3.5" />} 
              <span className="truncate text-xs">{title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })
  }

  return (
    <Sidebar className="border-r">
      {/* Header with logo */}
      <SidebarHeader className="h-12 flex items-center justify-center border-b">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">O</span>
          </div>
          <span className="text-base font-bold">Orbis</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-2 sidebar-scrollbar">
        {menu.map((group, idx) => (
          <SidebarGroup key={idx}>
            {group.section ? (
              <SidebarGroupLabel asChild>
                <button
                  onClick={() => toggleSection(group.section)}
                  className="flex w-full items-center gap-1.5 px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent -mt-1"
                >
                  {group.icon && <group.icon className="h-3.5 w-3.5" />}
                  <span className="flex-1 text-left">{group.section}</span>
                  {openSections[group.section] ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                  )}
                </button>
              </SidebarGroupLabel>
            ) : null}

            {/* render menu items only if section is open or if it's unsectioned */}
            {(group.section == null || openSections[group.section]) && (
              <SidebarGroupContent className={group.section ? "pl-4" : undefined}>
                <SidebarMenu>{renderMenuItems(group.items)}</SidebarMenu>
              </SidebarGroupContent>
            )}

            {idx !== menu.length - 1 && <SidebarSeparator className="my-1" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User profile footer */}
      <SidebarFooter className="border-t px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="h-7 w-7 flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase">
            {(user?.user_name || "G").slice(0, 2)}
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium leading-none">
              {user?.user_name || "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "guest@orbis.com"}
            </p>
          </div>
          {/* Sign out */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1 rounded-md hover:bg-accent focus-visible:ring-2 ring-ring transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar; 