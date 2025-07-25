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
        <div className="origin-ui-background p-6 rounded-lg shadow-md my-4">
            <h2 className="text-lg font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-700)' }}>Year-over-Year Sales</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                    <p className="text-sm origin-ui-text">Previous Year ({salesData.previous_year})</p>
                    <p className="text-2xl font-bold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                        ${salesData.previous_sales?.toLocaleString()}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-sm origin-ui-text">Current Year ({salesData.current_year})</p>
                    <p className="text-2xl font-bold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                        ${salesData.current_sales?.toLocaleString()}
                    </p>
                </div>
            </div>
            
            <div className="mt-4 text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isGrowth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {isGrowth ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                    {Math.abs(growthRate).toFixed(1)}% {isGrowth ? 'Growth' : 'Decline'}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                        { year: salesData.previous_year, sales: salesData.previous_sales },
                        { year: salesData.current_year, sales: salesData.current_sales }
                    ]}>
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="var(--color-tertiary-600)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
