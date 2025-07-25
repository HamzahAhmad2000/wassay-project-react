import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Card, CardContent } from "../additionalOriginuiComponents/ui/card";
import { formatDate } from "../utilityFunctions/unitilityFunctions";
import SalesChart from "./SalesChart";
import Loader from "./Loader";
import { DollarSign, Loader2, ShoppingCart } from "lucide-react";

const SalesReport = ({ period, setPeriod }) => {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSalesData(period);
    }, []);
  

    const fetchSalesData = async (selectedPeriod) => {
        setLoading(true);
        setError(null);
        try {
            fetch(`${apiUrl}/api/products/sales/aggregated/${selectedPeriod}/`, {
                 headers: {
       "ngrok-skip-browser-warning": "true",
                    Authorization: `Bearer ${localStorage.getItem("OrbisAccessToken")}`,
                },
            })
            .then(response => response.json())
            .then(data => {
                setSalesData(data);
            });
        } catch (err) {
            setError("Failed to load sales data", err);
        }
        setLoading(false);
    };

    return (
        <>
        {loading && <Loader />}
        {error && <p className="text-red-500">{error}</p>}


        <Card 
            className="w-full cursor-pointer transition-transform transform hover:scale-105 shadow-lg rounded-xl bg-white"
            onClick={() => setPeriod(period)}
        >
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <h2 className="text-sm font-semibold text-gray-600 capitalize">{period} Sales</h2>
                    <p className="text-xs text-gray-500">
                        {formatDate(salesData?.start_date, period === "yearly")} - {formatDate(salesData?.end_date, period === "yearly")}
                    </p>
                </div>

                {/* Sales Figures */}
                <div className="flex flex-col items-center mt-4">
                    {loading ? (
                        <Loader2 className="animate-spin text-gray-400 w-6 h-6" />
                    ) : (
                        <>
                            {/* Total Sales */}
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <p className="text-3xl font-bold text-gray-800">{salesData?.total_sales?.toLocaleString()}</p>
                            </div>

                            {/* Transactions */}
                            <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                                <ShoppingCart className="w-4 h-4 text-blue-500" />
                                <p>{salesData?.total_transactions} Transactions</p>
                            </div>

                            {/* Average Sale */}
                            <p className="text-sm text-gray-500 mt-1">
                                Avg. Sale: <span className="font-medium">${salesData?.average_transaction?.toFixed(2)}</span>
                            </p>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
        </>

    );
};


const SalesDashboard = () => {
    const [period, setPeriod] = useState("daily")
    return (
        <>
            <div className="grid grid-cols-12 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {["daily", "weekly", "monthly", "yearly"].map((p) => (
                    <SalesReport key={p} period={p} setPeriod={setPeriod} />
                ))}
            </div>
            <SalesChart key={period} period={period} />
        </>
    );
};
SalesReport.propTypes = {
    period: PropTypes.string.isRequired,
    setPeriod: PropTypes.func.isRequired,
};

export default SalesDashboard;
