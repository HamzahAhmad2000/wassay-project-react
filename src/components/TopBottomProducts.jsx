import { useState, useEffect } from "react";
import Loader from "./Loader";
import { apiReport } from "../APIs/ReportsAPIs";

const TopBottomProducts = () => {
    const [productsData, setProductsData] = useState(null);
    const [loading, setLoading] = useState(false);

    
  useEffect(() => {
      const getData = async () => {
          const data = await apiReport('top-bottom-products')
          if (data){
              setProductsData(data)
              setLoading(false)
          }
        }
        getData()
  }, []);
  

    return (
        <div className="p-4 bg-white shadow-md rounded-lg my-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top & Bottom Selling Products</h2>

            {loading && <Loader />}

            {!loading && productsData && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Top 10 Products */}
                    <div>
                        <h3 className="text-md font-medium text-green-600 mb-2">Top 10 Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200">
                                <thead>
                                    <tr className="bg-green-500 text-white">
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-right">Sold(Qty)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsData.top_10.map((product, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-2">{product.product__product_name}</td>
                                            <td className="px-4 py-2 text-right">{product.total_units_sold.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom 10 Products */}
                    <div>
                        <h3 className="text-md font-medium text-red-600 mb-2">Bottom 10 Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-200">
                                <thead>
                                    <tr className="bg-red-500 text-white">
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-right">Sold(Qty)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productsData.bottom_10.map((product, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="px-4 py-2">{product.product__product_name}</td>
                                            <td className="px-4 py-2 text-right">{product.total_units_sold.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopBottomProducts;
