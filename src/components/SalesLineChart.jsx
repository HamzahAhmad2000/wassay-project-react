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
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Sales Trend</h2>

      {/* Error Message */}
      {error && <p className="text-red-600 text-center mb-2">{error}</p>}

      {/* Date Pickers */}
      <div className="flex justify-center gap-4 mb-4">
        <input
          type="date"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "5px" }} />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="green" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesLineChart;
