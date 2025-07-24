import { ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiReport } from "../APIs/ReportsAPIs";



export default function YearOverYearSales() {

    const [salesData, setSalesData] = useState({
        current_year: 0,
        previous_year: 0,
        current_sales: 0,
        previous_sales: 0,
    });
    const [isGrowth, setIsGrowth] = useState(false)
    const [growthRate, setGrowthRate] = useState(0)

    
      useEffect(() => {
          const getData = async () => {
              const data = await apiReport('year-over-year')
              if (data){
                setSalesData({
                    current_year: data.current_year,
                    previous_year: data.previous_year,
                    current_sales: data.current_sales,
                    previous_sales: data.previous_sales,
                });
              }
            }
            getData()
      }, []);
        

    useEffect(()=>{
        setGrowthRate((((salesData.current_sales || 0) - (salesData.previous_sales || 0)) / (salesData.previous_sales || 1)) * 100)
        setIsGrowth(growthRate >= 0);

    }, [])
    return (
        <div className="bg-white p-6 rounded-lg shadow-md my-4">
            <h2 className="text-lg font-semibold text-gray-700">Year-over-Year Sales</h2>

            {/* Sales Comparison Section */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex flex-col">
                    <p className="text-gray-500">Current Year ({salesData.current_year}):</p>
                    <p className="text-2xl font-bold text-gray-800">${salesData.current_sales.toLocaleString()}</p>
                </div>
                <div className="flex flex-col text-right">
                    <p className="text-gray-500">Previous Year ({salesData.previous_year}):</p>
                    <p className="text-2xl font-bold text-gray-600">${salesData.previous_sales.toLocaleString()}</p>
                </div>
            </div>

            {/* Growth Percentage */}
            <div className={`flex items-center gap-2 mt-2 ${isGrowth ? "text-green-600" : "text-red-500"}`}>
                {isGrowth ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
                <p className="text-lg font-semibold">{growthRate.toFixed(2)}%</p>
            </div>

            {/* Sales Bar Chart */}
            <div className="mt-6">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesData}>
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Bar dataKey="sales" fill="#4CAF50" name="Sales" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
