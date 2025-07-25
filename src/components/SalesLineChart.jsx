import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

const SalesLineChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("2025-03-01");
  const [endDate, setEndDate] = useState("2025-03-14");
  const [error, setError] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (validateDates()) {
      fetchSalesData();
    }
  }, [startDate, endDate]);

  const validateDates = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (start > end) {
      setError("Start date cannot be after end date.");
      return false;
    }
    if (end > today) {
      setError("End date cannot be in the future.");
      return false;
    }
    setError(""); // Clear errors if valid
    return true;
  };

  const fetchSalesData = async () => {
    try {
        let url = `${apiUrl}/api/products/sales/sales-line-chart/`
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`
            
            const response = await fetch(url, {
                method: "GET",
                 headers: {
       "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("OrbisAccessToken")}`,
                },
            });
            const responseData = await response.json();
            
            const salesData = responseData.labels.map((date, index) => ({
                date,
                sales: responseData.sales[index],
            }));
            
            setData(salesData);
        }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  return (
    <div className="origin-ui-background p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center origin-ui-text mb-6" style={{ color: 'var(--color-tertiary-700)' }}>
        Sales Line Chart
      </h2>

      {/* Date Range Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center items-center">
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="text-sm font-medium origin-ui-text">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-md origin-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="text-sm font-medium origin-ui-text">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-md origin-input focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 text-center mb-4 p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {/* Chart */}
      {data.length > 0 && (
        <div className="origin-ui-background p-4 rounded-lg">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-100)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--color-secondary-900)' }}
                axisLine={{ stroke: 'var(--color-primary-100)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--color-secondary-900)' }}
                axisLine={{ stroke: 'var(--color-primary-100)' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-primary-200)', 
                  border: '1px solid var(--color-primary-100)',
                  borderRadius: '8px',
                  color: 'var(--color-secondary-900)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="var(--color-tertiary-600)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-tertiary-600)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: 'var(--color-tertiary-500)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No Data State */}
      {data.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          No sales data available for the selected date range.
        </div>
      )}
    </div>
  );
};

export default SalesLineChart;
