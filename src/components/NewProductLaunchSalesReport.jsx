import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiReport } from "../APIs/ReportsAPIs";

const NewProductLaunchSalesReport = () => {
  const [salesData, setSalesData] = useState([]);


  useEffect(() => {
  const getData = async () => {
    const data = await apiReport('new-launch')
    if (data)
      setSalesData(data)
  }
  getData()
}, []);

  return (
    <div className="p-6 origin-ui-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-center origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
          🚀 New Product Launch Sales Report
        </h1>

        {/* Table */}
        <div className="overflow-x-auto mb-8 shadow-lg rounded-lg">
          <table className="w-full origin-ui-background border border-border rounded-lg">
            <thead className="origin-ui-table-heading" style={{ backgroundColor: 'var(--color-tertiary-600)', color: 'white' }}>
              <tr>
                <th className="py-4 px-6 text-left">Product</th>
                <th className="py-4 px-6 text-center">Total Sales</th>
                <th className="py-4 px-6 text-center">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-muted transition duration-200"
                  >
                    <td className="py-4 px-6 origin-ui-text">{item.name}</td>
                    <td className="py-4 px-6 text-center font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
  {item.total_sales.toLocaleString()} {/* Adds thousand separators */}
</td>
<td className="py-4 px-6 text-center font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
  ${item?.total_revenue ? item.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-muted-foreground">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Line Chart */}
        <h2 className="text-xl font-semibold mb-4 text-center origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
          Sales Performance Over Time
        </h2>
        <div className="origin-ui-background p-6 rounded-lg shadow-lg">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesData} margin={{ left: 20, right: 20 }}>
              <XAxis dataKey="launch_date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_sales" stroke="var(--color-tertiary-600)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NewProductLaunchSalesReport;
