import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiReport } from "../APIs/ReportsAPIs";

const ProductAffinityReport = () => {
  const [affinityData, setAffinityData] = useState([]);

  
  useEffect(() => {
      const getData = async () => {
          const data = await apiReport('product-affinity')
          if (data){
              setAffinityData(data)
          }
        }
        getData()
  }, []);
  

  return (
    <div className="p-6 origin-ui-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold origin-ui-text mb-6 text-center" style={{ color: 'var(--color-tertiary-600)' }}>
          📊 Product Affinity Report
        </h1>

        {/* Table */}
        <div className="overflow-x-auto mb-8 shadow-lg rounded-lg">
          <table className="w-full origin-ui-background border border-border rounded-lg">
            <thead className="origin-ui-table-heading" style={{ backgroundColor: 'var(--color-tertiary-600)', color: 'white' }}>
              <tr>
                <th className="py-4 px-6 text-left">Product A</th>
                <th className="py-4 px-6 text-left">Product B</th>
                <th className="py-4 px-6 text-center">Affinity Score</th>
                <th className="py-4 px-6 text-center">Co-occurrence</th>
              </tr>
            </thead>
            <tbody>
              {affinityData.length > 0 ? (
                affinityData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-muted transition duration-200"
                  >
                    <td className="py-4 px-6 origin-ui-text">{item.product_a}</td>
                    <td className="py-4 px-6 origin-ui-text">{item.product_b}</td>
                    <td className="py-4 px-6 text-center font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                      {item.affinity_score?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                      {item.co_occurrence || 'N/A'}
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

        {/* Bar Chart */}
        <h2 className="text-xl font-semibold origin-ui-text mb-4 text-center" style={{ color: 'var(--color-tertiary-600)' }}>
          Product Affinity Visualization
        </h2>
        <div className="origin-ui-background p-6 rounded-lg shadow-lg">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={affinityData} margin={{ left: 20, right: 20 }}>
              <XAxis dataKey="product_a" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="affinity_score" fill="var(--color-tertiary-600)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductAffinityReport;
