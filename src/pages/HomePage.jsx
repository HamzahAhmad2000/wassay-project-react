import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "/src/APIs/TokenAPIs"; // Adjust the path if needed
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
import ErrorBoundary from "../components/ErrorBoundary";

const HomePage = () => {
  // const user = JSON.parse(localStorage.getItem("OrbisUser"))
  const user = { user_name: "Test User", role: { name: "admin" } }; // Temporary test user
  
  const navigate = useNavigate();
  
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

  return (
    <div className="w-full origin-ui-background">
      {/* Main Content */}
      <div className="w-full p-6">
        <h1 className="text-3xl font-bold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
          Welcome, Mr. <i>{user?.user_name}</i>.
        </h1>
        <p className="origin-ui-text">This is the home page.</p>

        {/* Components wrapped with error boundaries for graceful error handling */}
        <div className="space-y-6">
          <ErrorBoundary>
            <ReportTemplate />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PaymentCalendar />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <SalesChart />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PackageGroupTable />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <NewProductLaunchSalesReport />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <ProductAffinityReport />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <SalesLineChart />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PeakSalesChart />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <WeekendVsWeekdayChart/> 
          </ErrorBoundary>
          
          <ErrorBoundary>
            <SalesReport/>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <ProductSalesChart />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <YearOverYearSales />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PaymentMethodPieChart />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <TopBottomProducts />
          </ErrorBoundary>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;
