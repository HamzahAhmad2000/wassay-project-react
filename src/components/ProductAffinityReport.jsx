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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-green-700 mb-6 text-center">
          📊 Product Affinity Report
        </h1>

        {/* Table */}
        <div className="overflow-x-auto mb-8 shadow-lg rounded-lg">
          <table className="w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left">Product 1</th>
                <th className="py-4 px-6 text-left">Product 2</th>
                <th className="py-4 px-6 text-center">Times Purchased Together</th>
              </tr>
            </thead>
            <tbody>
              {affinityData.length > 0 ? (
                affinityData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-green-100 transition duration-200"
                  >
                    <td className="py-4 px-6">{item.product1}</td>
                    <td className="py-4 px-6">{item.product2}</td>
                    <td className="py-4 px-6 text-center font-semibold text-green-700">
                      {item.times_purchased_together}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bar Chart */}
        <h2 className="text-xl font-semibold text-green-700 mb-4 text-center">
          Product Pair Frequency
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={affinityData}
              layout="vertical"
              margin={{ left: 50 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="product1" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="times_purchased_together" fill="#16A34A" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProductAffinityReport;
