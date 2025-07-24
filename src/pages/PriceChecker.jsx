import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ImageOff, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { getPriceCheckerInventory } from "../APIs/ProductAPIs";

const PriceChecker = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem("OrbisUser")));
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [calculateBill, setCalculateBill] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsData = await getPriceCheckerInventory();
        setProducts(productsData);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Unable to load products. Please try again later.");
      }
    }

    if (user?.branch) {
      fetchProducts();
    } else {
      setError("User branch not found. Please log in again.");
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        Object.keys(product).some((key) => {
          const value = product[key];
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    }

    setFilteredProducts(filtered);
    if (searchTerm !== "")
      setSelectedProduct(filtered.length === 1 ? filtered[0] : null);
  }, [searchTerm, products]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setError("");
  };

  const handleProductSelect = async (productId) => {
    const product = filteredProducts.filter(p => p.id === productId)[0];

    setScannedProducts(prev => {
      const existingProductIndex = prev.findIndex(p => p.id === product.id);
      if (existingProductIndex !== -1) {
        const updatedProducts = [...prev];
        updatedProducts[existingProductIndex].quantity += 1;
        return updatedProducts;
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });

    setSelectedProduct(product);
    setSearchTerm(""); // Clear search after selection
    setFilteredProducts([]);
    setCurrentImageIndex(0);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredProducts([]);
    setSelectedProduct(null);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : (selectedProduct?.product_image ? 0 : 0)
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < (selectedProduct?.product_image ? 0 : 0) ? prev + 1 : prev
    );
  };

  const handleRemoveProduct = (productId) => {
    setScannedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const totalAmount = scannedProducts.reduce(
    (acc, product) => acc + (Number(product.retail_price) || 0) * product.quantity,
    0
  );

  const getSimilarProducts = (product) => {
    if (!product?.category) return [];
    return products
      .filter(p => {
        const currentCategory = product.category;
        const compareCategory = p.category;

        if (currentCategory?.parent) {
          return (
            compareCategory?.parent?.id === currentCategory.parent.id &&
            p.id !== product.id
          );
        }
        return (
          compareCategory?.id === currentCategory?.id &&
          p.id !== product.id
        );
      })
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center justify-center">
          <Search className="w-7 h-7 mr-3 text-blue-600" />
          <span className="text-blue-700">Orbis</span> Price Checker
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md flex items-center">
            <X className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        

        {/* Search Section */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search products (name, barcode, sku, etc.)..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-4 pl-12 pr-12 border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 transition duration-300 ease-in-out"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Options Checkboxes */}
        <div className="mb-6 flex items-center gap-4 justify-center">
          <label className="inline-flex items-center text-gray-700">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              checked={showDetails}
              onChange={() => setShowDetails(!showDetails)}
            />
            <span className="ml-2">Show Product Details</span>
          </label>
          <label className="inline-flex items-center text-gray-700">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
              checked={calculateBill}
              onChange={() => setCalculateBill(!calculateBill)}
            />
            <span className="ml-2">Calculate Bill</span>
          </label>
        </div>

        {/* Dropdown for search results */}
        {searchTerm && filteredProducts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md shadow-sm max-h-72 overflow-y-auto mb-8 mx-auto max-w-lg">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id + index}
                onClick={() => handleProductSelect(product.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center text-gray-700 transition duration-150"
              >
                <span>
                  {product.product_name} -{" "}
                  {product.product_weight} {product.unit}
                </span>
                <span className="text-blue-600 font-semibold">
                  ${product.retail_price || "0.00"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Product Display */}
        {selectedProduct && showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 bg-white rounded-xl shadow-md p-8">
            {/* Left Side - Images Slideshow */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Image</h3>
              <div className="relative rounded-md overflow-hidden border border-gray-200">
                {selectedProduct.product_image ? (
                  <img
                    src={selectedProduct.product_image}
                    alt={selectedProduct.product_name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                    <ImageOff className="w-8 h-8 mr-2" />
                    No Image
                  </div>
                )}
                {selectedProduct.product_image && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white disabled:opacity-50 hover:bg-opacity-70 transition duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70 transition duration-200"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Product Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <span className="font-medium">Name:</span>
                <span>{selectedProduct.product_name || "N/A"}</span>

                <span className="font-medium">Price:</span>
                <span className="text-green-600 font-semibold">
                  ${selectedProduct.retail_price || "0.00"}
                </span>

                <span className="font-medium">Category:</span>
                <span>{selectedProduct.category?.parent_category?.category_name || "N/A"}</span>

                <span className="font-medium">Sub Category:</span>
                <span>{selectedProduct.category?.category_name || "N/A"}</span>

                <span className="font-medium">Placement:</span>
                <span>{selectedProduct.placement_location || "Unknown"}</span>

                <span className="font-medium">Similar Products:</span>
                <div className="col-span-2">
                  {getSimilarProducts(selectedProduct).length > 0 ? (
                    <ul className="list-disc pl-5">
                      {getSimilarProducts(selectedProduct).map((similar, index) => (
                        <li key={similar.id + index}>
                          {similar.product_name} - ${similar.retail_price || "0.00"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-500 italic">No similar products found</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* Scanned Products Table */}
        {/* Scanned Products Table */}
        {scannedProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Scanned Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-blue-100 text-gray-700">
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-left">Total</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedProducts.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="py-3 px-4">{product.product_name}</td>
                      <td className="py-3 px-4">${Number(product.retail_price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setScannedProducts((prev) =>
                                prev.map((p) =>
                                  p.id === product.id && p.quantity > 1
                                    ? { ...p, quantity: p.quantity - 1 }
                                    : p
                                )
                              )
                            }
                            className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-2 py-1 rounded"
                          >
                            -
                          </button>
                          <span>{product.quantity}</span>
                          <button
                            onClick={() =>
                              setScannedProducts((prev) =>
                                prev.map((p) =>
                                  p.id === product.id
                                    ? { ...p, quantity: p.quantity + 1 }
                                    : p
                                )
                              )
                            }
                            className="bg-green-100 hover:bg-green-200 text-green-600 font-bold px-2 py-1 rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        ${(Number(product.retail_price) * product.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary */}
            {calculateBill && (
              <div className="mt-6 text-right text-lg font-semibold text-gray-800">
                Total Bill: ${totalAmount.toFixed(2)}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PriceChecker;