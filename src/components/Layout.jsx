import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Layout = () => {
  const location = useLocation();

  // Routes where we don't want to show the sidebar (auth pages)
  const noSidebarRoutes = ["/login", "/register", "/signup"];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  if (!showSidebar) {
    // Render the page without sidebar (full-width)
    return (
      <div className="min-h-screen w-full">
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main section */}
        <main className="flex-1 min-h-screen w-full overflow-auto main-scrollbar">
          {/* Mobile trigger button */}
          <div className="p-4">
            <SidebarTrigger className="mb-4 md:hidden inline-flex" />
          </div>
          <div className="w-full px-6 pb-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
