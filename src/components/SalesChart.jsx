import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { formatDate } from "../utilityFunctions/unitilityFunctions";
import Loader from "./Loader";
import ChartCard from "./ChartCard";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "./EmptyState";
import { AlertCircle, Calendar, DollarSign, ShoppingCart } from "lucide-react";
import PropTypes from "prop-types"
const SalesChart = ({period="monthly"}) => {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const apiUrl = import.meta.env.VITE_API_URL;


    useEffect(() => {
        fetchDailySales();
    }, []);

    const fetchDailySales = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/api/products/sales/${period}/`, {
                 headers: {
                    "ngrok-skip-browser-warning": "true",
                    Authorization: `Bearer ${localStorage.getItem("OrbisAccessToken")}`,
                },
            });
            const data = await response.json();
            setSalesData(data);
        } catch (err) {
            setError("Failed to load daily sales data.");
            toast({
                title: "Error",
                description: "Failed to load daily sales data. Please try again.",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const formatCurrency = (value) => {
        return `$${value.toLocaleString()}`;  // Formats number with commas and adds $
    };
    return (
        <ChartCard 
            title={`${period} Sales Report`}
            className="w-full"
        >
            {/* Loading & Error States */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader />
                </div>
            )}

            {error && (
                <div className="p-4">
                    <EmptyState 
                        title="Error Loading Sales Data"
                        description={error}
                        icon={AlertCircle}
                    />
                </div>
            )}

            {/* Sales Data Display */}
            {salesData && (
                <>
                    <div className="bg-muted/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* Left Side: Total Sales & Transactions */}
                        <div className="flex flex-col items-center sm:items-start">
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-green-500" />
                                <p className="text-2xl font-bold text-foreground">
                                    ${salesData.total_sales.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                                <ShoppingCart className="w-4 h-4 text-blue-500" /> 
                                Transactions: {salesData.total_transactions}
                            </p>
                        </div>

                        {/* Right Side: Dates */}
                        <div className="flex flex-col text-center sm:text-right text-sm text-muted-foreground">
                            <p>
                                <span className="font-semibold">Start Date:</span> {formatDate(new Date(salesData.start_date))}
                            </p>
                            <p>
                                <span className="font-semibold">End Date:</span> {formatDate(new Date(salesData.end_date))}
                            </p>
                        </div>
                    </div>

                    {/* Category Breakdown Chart */}
                    <div className="mt-6">
                        <h3 className="text-md font-semibold text-foreground mb-2">Category Breakdown</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData.category_breakdown} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                <XAxis 
                                    dataKey="product__category__category_name" 
                                    tick={{ fontSize: 12, fill: 'var(--color-foreground)' }} 
                                />
                                <YAxis 
                                    tickFormatter={formatCurrency} 
                                    tick={{ fontSize: 12, fill: 'var(--color-foreground)' }} 
                                />
                                <Tooltip 
                                    formatter={(value) => formatCurrency(value)} 
                                    cursor={{ fill: "var(--color-muted)" }}
                                    contentStyle={{ 
                                        backgroundColor: 'var(--color-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '0.375rem'
                                    }}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="total_revenue" 
                                    fill="var(--color-tertiary-500)" 
                                    name="Revenue" 
                                    barSize={40} 
                                    radius={[5, 5, 0, 0]} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </ChartCard>
    );
};

SalesChart.propTypes = {
    period: PropTypes.oneOf(["daily", "monthly", "quarterly", "yearly"]),
};

export default SalesChart;
