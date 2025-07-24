import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apiReport } from "../APIs/ReportsAPIs";

const WeekendVsWeekdayChart = () => {
  const [salesData, setSalesData] = useState(null);

  useEffect(() => {
      const getData = async () => {
          const data = await apiReport('weekend-vs-weekday-sales')
          if (data){
              setSalesData([
                { name: "Weekdays (Mon-Fri)", value: data.weekday_sales },
                { name: "Weekends (Sat-Sun)", value: data.weekend_sales },
              ]);
          }
        }
        getData()
  }, []);
  
  const COLORS = ["#4CAF50", "#FF5733"]; // Green for weekdays, Red for weekends

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Weekend vs. Weekday Sales Report
      </h2>


      {salesData && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={salesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: "white", borderRadius: "5px" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeekendVsWeekdayChart;
