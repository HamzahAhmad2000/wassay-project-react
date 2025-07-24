import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ChartCard from "./ChartCard";
import { apiReport } from "../APIs/ReportsAPIs";

const PeakSalesChart = () => {  
  const [peakHours, setPeakHours] = useState([]);

  
      useEffect(() => {
          const getData = async () => {
              const data = await apiReport('peak-sales')
              if (data){
                  setPeakHours(data.top_peak_hours)
              }
            }
            getData()
      }, []);

    return (
        <ChartCard 
            title="Peak Hours Report"
            className="w-full max-w-3xl mx-auto"
        >
          {peakHours.length > 0 && (
            <div className="text-center mb-4">
              {peakHours.map((hour, index) => (
                <p key={index} className="text-lg font-semibold text-foreground">
                  ⏰ {hour.hour} - Peak on {hour.days_count} days
                </p>
              ))}
            </div>
          )}
    
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHours} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 14, fill: 'var(--color-foreground)' }} 
              />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-foreground)' }} />
              <Tooltip 
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{ 
                  backgroundColor: "var(--color-card)", 
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.375rem" 
                }} 
              />
              <Bar 
                dataKey="days_count" 
                fill="var(--color-tertiary-500)" 
                barSize={60}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>      
    );
    };

export default PeakSalesChart;
