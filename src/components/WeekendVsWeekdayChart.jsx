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
  
  const COLORS = ["var(--color-tertiary-600)", "var(--color-tertiary-500)"]; // Using Origin UI tertiary colors

  return (
    <div className="p-6 origin-ui-background rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center origin-ui-text mb-4" style={{ color: 'var(--color-tertiary-700)' }}>
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
            <Tooltip contentStyle={{ backgroundColor: "var(--color-primary-200)", borderRadius: "5px", color: "var(--color-secondary-900)" }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeekendVsWeekdayChart;
