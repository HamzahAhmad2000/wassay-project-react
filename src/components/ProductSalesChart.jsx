import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Loader from "./Loader";
import ChartCard from "./ChartCard";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "./EmptyState";
import PropTypes from "prop-types";
import { apiReport } from "../APIs/ReportsAPIs";



// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-md border">
                <p className="text-sm font-semibold">{data.product}</p>
                <p className="text-green-600">💰 Revenue: <strong>$ {data?.revenue.toLocaleString()}</strong></p>
                <p className="text-blue-500">📦 Sold: <strong>{data?.quantity_sold.toLocaleString()} units</strong></p>
                <p className="text-blue-500"> Average Price: <strong>$ {data?.average_price.toFixed(2).toLocaleString()}</strong></p>
            </div>
        );
    }
    return null;
}
CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.arrayOf(PropTypes.object),
};
export default function ProductSalesChart() {
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await apiReport('product');
                if (data && data.length > 0) {
                    const formattedData = data.map(item => ({
                        product: item.product__product_name,
                        revenue: item.total_revenue,
                        quantity_sold: item.total_sold,
                        average_price: item.total_revenue / item.total_sold
                    }));
                    
                    // Sort by revenue (Descending)
                    const sortedData = formattedData.sort((a, b) => b.revenue - a.revenue);
                    setSalesData(sortedData);
                } else {
                    setSalesData([]);
                }
                setLoading(false);
            } catch (err) {
                setError("Failed to load product sales data");
                setLoading(false);
                toast({
                    title: "Error",
                    description: "Failed to load product sales data. Please try again.",
                    variant: "destructive",
                });
            }
        };
        getData();
    }, [toast]);
      

    if (error) {
        return (
            <ChartCard title="Top 10 Products by Revenue" className="w-full">
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
            title="Top 10 Products by Revenue"
            className="w-full"
        >
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader />
                </div>
            ) : salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={salesData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                        <XAxis 
                            type="number" 
                            tick={{ fontSize: 12, fill: 'var(--color-foreground)' }} 
                        />
                        <YAxis 
                            type="category" 
                            width={150} 
                            tick={{ fontSize: 12, fill: 'var(--color-foreground)' }} 
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ fill: "var(--color-muted)" }}
                        />
                        <Legend />
                        <Bar 
                            dataKey="revenue" 
                            fill="var(--color-tertiary-500)" 
                            name="Revenue ($)" 
                            radius={[0, 5, 5, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <EmptyState 
                    title="No Product Sales Data"
                    description="No product sales data available to display."
                />
            )}
        </ChartCard>
    );
}
