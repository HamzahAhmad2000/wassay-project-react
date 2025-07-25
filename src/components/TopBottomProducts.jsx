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
        <div className="p-4 origin-ui-background shadow-md rounded-lg my-4">
            <h2 className="text-lg font-semibold origin-ui-text mb-4" style={{ color: 'var(--color-tertiary-700)' }}>Top & Bottom Selling Products</h2>

            {loading && <Loader />}

            {!loading && productsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div>
                        <h3 className="text-md font-semibold origin-ui-text mb-3" style={{ color: 'var(--color-tertiary-600)' }}>🏆 Top Selling Products</h3>
                        <div className="space-y-2">
                            {productsData.top_products?.map((product, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-medium origin-ui-text">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {product.quantity_sold}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                                            ${product.revenue?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Products */}
                    <div>
                        <h3 className="text-md font-semibold origin-ui-text mb-3" style={{ color: 'var(--color-tertiary-600)' }}>📉 Bottom Selling Products</h3>
                        <div className="space-y-2">
                            {productsData.bottom_products?.map((product, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-medium origin-ui-text">{product.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {product.quantity_sold}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold origin-ui-text" style={{ color: 'var(--color-tertiary-600)' }}>
                                            ${product.revenue?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopBottomProducts;
