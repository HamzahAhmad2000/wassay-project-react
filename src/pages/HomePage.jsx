import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "/src/APIs/TokenAPIs";
import SalesReport from "../components/SalesReport";
import SalesChart from "../components/SalesChart";
import TopBottomProducts from "../components/TopBottomProducts";
import YearOverYearSales from "../components/YearOverYearSales";
import ProductSalesChart from "../components/ProductSalesChart";
import PaymentMethodPieChart from "../components/PaymentMethodPieChart";
import SalesLineChart from "../components/SalesLineChart";
import PeakSalesChart from "../components/PeakSalesChart";
import WeekendVsWeekdayChart from "../components/WeekendVsWeekdayChart";
import ProductAffinityReport from "../components/ProductAffinityReport";
import NewProductLaunchSalesReport from "../components/NewProductLaunchSalesReport";
import PackageGroupTable from "./PackageGroupTable";
import PaymentCalendar from "../components/PaymentCalendar";
import { getPaymentDates } from "../APIs/ProductAPIs";
import ReportTemplate from "../components/ReportTemplate";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

const HomePage = () => {
  // const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const user = { user_name: "Test User", role: { name: "admin" } }; // Temporary test user
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Temporarily comment out authentication logic to test
  /*
  useEffect(() => {
    getPaymentDates()
    const token = localStorage.getItem("OrbisAccessToken");
    if (!token) {
      navigate("/login");
    } else {
      verifyToken(token)
        .then(() => {
          if(user.role.name == "cashier" )
          navigate('/add-cashier-receipt')
          else
            navigate("/");
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [navigate]);
  */

  // Loading skeleton for chart containers
  const ChartSkeleton = () => (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );

  // Loading skeleton for table containers
  const TableSkeleton = () => (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
      {/* Main Content */}
      <div className="flex-1 p-6" id="main-content" role="main" aria-label="Dashboard">
        {/* Modern Header Section */}
        <header className="mb-8" aria-labelledby="dashboard-title">
          <h1 id="dashboard-title" className="text-4xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-primary">{user?.user_name}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Row 1: Key Metrics */}
          <section className="md:col-span-2 lg:col-span-4" aria-labelledby="overview-title">
            <Card>
              <CardHeader>
                <CardTitle id="overview-title">Business Overview</CardTitle>
                <CardDescription>Key performance indicators for your business</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="status" aria-label="Loading business metrics">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ReportTemplate />
                )}
              </CardContent>
            </Card>
          </section>

          {/* Charts Section */}
          <section className="lg:col-span-2" aria-labelledby="sales-chart-title">
            {loading ? <ChartSkeleton /> : <SalesChart />}
          </section>
          
          <section className="lg:col-span-2" aria-labelledby="product-sales-chart-title">
            {loading ? <ChartSkeleton /> : <ProductSalesChart />}
          </section>

          <section className="lg:col-span-2" aria-labelledby="sales-line-chart-title">
            {loading ? <ChartSkeleton /> : <SalesLineChart />}
          </section>
          
          <section className="lg:col-span-2" aria-labelledby="payment-pie-chart-title">
            {loading ? <ChartSkeleton /> : <PaymentMethodPieChart />}
          </section>

          {/* Additional Reports */}
          <section className="lg:col-span-2" aria-labelledby="peak-sales-chart-title">
            {loading ? <ChartSkeleton /> : <PeakSalesChart />}
          </section>
          
          <section className="lg:col-span-2" aria-labelledby="weekday-chart-title">
            {loading ? <ChartSkeleton /> : <WeekendVsWeekdayChart />}
          </section>

          <section className="lg:col-span-2" aria-labelledby="year-over-year-chart-title">
            {loading ? <ChartSkeleton /> : <YearOverYearSales />}
          </section>
          
          <section className="lg:col-span-2" aria-labelledby="top-products-chart-title">
            {loading ? <ChartSkeleton /> : <TopBottomProducts />}
          </section>

          {/* Tables and Reports */}
          <section className="lg:col-span-4" aria-labelledby="package-table-title">
            {loading ? <TableSkeleton /> : <PackageGroupTable />}
          </section>

          <section className="lg:col-span-2" aria-labelledby="product-affinity-title">
            {loading ? <ChartSkeleton /> : <ProductAffinityReport />}
          </section>
          
          <section className="lg:col-span-2" aria-labelledby="new-product-launch-title">
            {loading ? <ChartSkeleton /> : <NewProductLaunchSalesReport />}
          </section>

          <section className="lg:col-span-4" aria-labelledby="sales-report-title">
            {loading ? <ChartSkeleton /> : <SalesReport />}
          </section>

          <section className="lg:col-span-4" aria-labelledby="payment-calendar-title">
            {loading ? <ChartSkeleton /> : <PaymentCalendar />}
          </section>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
