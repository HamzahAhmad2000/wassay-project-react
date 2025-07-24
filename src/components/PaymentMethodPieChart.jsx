import { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import Loader from "./Loader";
import ChartCard from "./ChartCard";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "./EmptyState";
import { AlertCircle } from "lucide-react";
// Colors for different payment methods
const COLORS = ["#32de84", "#17B169", "#018749", "#1CAC78"];

// Custom Tooltip Component
import PropTypes from 'prop-types';
import { apiReport } from "../APIs/ReportsAPIs";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-md border">
                <p className="text-sm font-semibold">{data.payment_method}</p>
                <p className="text-green-600">💰 Revenue: <strong>${data.total_revenue.toLocaleString()}</strong></p>
                <p className="text-blue-500">🛒 Transactions: <strong>{data.total_transactions.toLocaleString()}</strong></p>
            </div>
        );
    }
    return null;
};
CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(PropTypes.shape({
        payload: PropTypes.shape({
            payment_method: PropTypes.string,
            total_revenue: PropTypes.number,
            total_transactions: PropTypes.number,
        }),
    })),
};

export default function PaymentMethodPieChart() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await apiReport('payment-method');
                if (data && data.length > 0) {
                    setChartData(data);
                } else {
                    setChartData([]);
                }
                setLoading(false);
            } catch (err) {
                setError("Failed to load payment method data");
                setLoading(false);
                toast({
                    title: "Error",
                    description: "Failed to load payment method data. Please try again.",
                    variant: "destructive",
                });
            }
        };
        getData();
    }, [toast]);

    if (loading) {
        return (
            <ChartCard title="Revenue by Payment Method" className="w-full">
                <div className="flex justify-center items-center py-8">
                    <Loader />
                </div>
            </ChartCard>
        );
    }

    if (error) {
        return (
            <ChartCard title="Revenue by Payment Method" className="w-full">
                <EmptyState 
                    title="Error Loading Data"
                    description={error}
                    icon={AlertCircle}
                />
            </ChartCard>
        );
    }

    return (
        <ChartCard 
            title="Revenue by Payment Method"
            className="w-full"
        >
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                        <Pie
                            data={chartData}
                            dataKey="total_revenue"
                            nameKey="payment_method"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="var(--color-tertiary-500)"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                            labelLine={false}
                            fontSize={12}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: "var(--color-muted)" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <EmptyState 
                    title="No Payment Data"
                    description="No payment method data available to display."
                />
            )}
        </ChartCard>
    );
}
