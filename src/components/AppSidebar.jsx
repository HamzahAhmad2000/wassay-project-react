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
import { Home, Building, User, ChevronDown, ChevronRight, LogOut } from "lucide-react"
import React from "react"

// Basic menu configuration. Extend this as needed.
const menu = [
  {
    section: null,
    items: [
      { title: "Home", path: "/", icon: Home },
    ],
  },
  {
    section: "Company & Locations",
    icon: Building,
    items: [
      { title: "Companies", path: "/companies" },
      { title: "Branches", path: "/branches" },
    ],
  },
  {
    section: "Employee Management",
    icon: User,
    items: [
      { title: "Employee", path: "/users" },
      { title: "Roles", path: "/roles" },
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
      return (
        <SidebarMenuItem key={title}>
          <SidebarMenuButton asChild isActive={isActive} size="sm">
            <NavLink to={path} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />} <span>{title}</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })
  }

  return (
    <Sidebar>
      {/* Optional: Add header or logo here */}
      <SidebarHeader className="h-14 flex items-center justify-center text-lg font-semibold">
        Orbis
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {menu.map((group, idx) => (
          <SidebarGroup key={idx}>
            {group.section ? (
              <SidebarGroupLabel asChild>
                <button
                  onClick={() => toggleSection(group.section)}
                  className="flex w-full items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {group.icon && <group.icon className="h-4 w-4" />}
                  <span className="flex-1 text-left">{group.section}</span>
                  {openSections[group.section] ? (
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 opacity-70" />
                  )}
                </button>
              </SidebarGroupLabel>
            ) : null}

            {/* render menu items only if section is open or if it's unsectioned */}
            {(group.section == null || openSections[group.section]) && (
              <SidebarGroupContent className={group.section ? "pl-6" : undefined}>
                <SidebarMenu>{renderMenuItems(group.items)}</SidebarMenu>
              </SidebarGroupContent>
            )}

            {idx !== menu.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User profile footer (shadcn style) */}
      <SidebarFooter className="border-t px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-9 w-9 flex shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium uppercase">
            {(user?.user_name || "G").slice(0, 2)}
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">
              {user?.user_name || "Guest"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || "m@example.com"}
            </p>
          </div>
          {/* Sign out */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1 rounded-md hover:bg-sidebar-accent focus-visible:ring-2 ring-sidebar-ring transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar; 