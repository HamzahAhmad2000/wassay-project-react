import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Layout = () => {
  const location = useLocation();

  // Routes where we don't want to show the sidebar (e.g. auth pages)
  const noSidebarRoutes = ["/login", "/register"];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  if (!showSidebar) {
    // Render the page without sidebar (full-width)
    return (
      <main className="min-h-screen w-full p-6 overflow-auto">
        <Outlet />
      </main>
    );
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main section */}
      <main className="flex-1 min-h-screen overflow-auto p-6">
        {/* Mobile trigger button */}
        <SidebarTrigger className="mb-4 md:hidden inline-flex" />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
