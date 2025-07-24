import { useCallback, useState, useEffect } from "react";
import { getBundles } from "../../APIs/ProductAPIs";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
// import useFetchAndFilter from "../../hooks/useFetchAndFilter"; // Remove this import

const BundlesPage = () => {
  // const navigate = useNavigate();
  const [groupedBundles, setGroupedBundles] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const fetchBundlesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBundles();
      setGroupedBundles(response);
    } catch (error) {
      toast.error(`Error fetching bundles: ${error.message}`);
      console.error("Error fetching bundles:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBundlesData();
  }, [fetchBundlesData]);

  // const handleUpdateBundle = (bundleId) => {
  //   let targetBundle = null;
  //   for (const group in groupedBundles) {
  //     const found = groupedBundles[group].find(
  //       (ing) => ing.id === bundleId
  //     );
  //     if (found) {
  //       targetBundle = found;
  //       break;
  //     }
  //   }

  //   if (targetBundle) {
  //     navigate(`/update-bundle/${bundleId}`, {
  //       state: { bundle: targetBundle }
  //     });
  //   } else {
  //     toast.error(`Bundle with ID ${bundleId} not found.`);
  //   }
  // };

  // const handleDeleteBundle = (bundleId) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this bundle?");
  //   if (confirmDelete) {
  //     deleteBundle(bundleId)
  //       .then((response) => {
  //         if (response.ok) {
  //           toast.success("Bundle deleted successfully.");
  //           fetchBundlesData(); // Refetch to update the grouped data
  //         } else {
  //           toast.error("Failed to delete the bundle. Please try again.");
  //           console.error("Failed to delete bundle:", response.status);
  //         }
  //       })
  //       .catch((err) => {
  //         toast.error(`Error deleting bundle: ${err.message}`);
  //         console.error("Error deleting bundle:", err);
  //       });
  //   }
  // };

  const toggleGroup = (productName) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productName)) {
        newSet.delete(productName);
      } else {
        newSet.add(productName);
      }
      return newSet;
    });
  };

  return (
    <div className="bundle-page min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-title text-3xl font-bold text-gray-800 mb-6"
        >
          Product Bundle Details
        </motion.h1>

        
        <NavLink
          to={'/add-bundle'}
          className={`action-button add-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-300 mb-8`}
          title={`Add Bundle Product`}
          aria-label={`Add Bundle Product`}
        >
          Add Bundle Product
        </NavLink>

        <AnimatePresence>
          {isLoading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic text-center py-12 bg-white rounded-xl shadow-sm"
            >
              Loading bundles...
            </motion.p>
          ) : Object.keys(groupedBundles).length > 0 ? (
            Object.entries(groupedBundles).map(([productName, bundles]) => (
              <motion.div
                key={productName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-gray-800 font-semibold transition-all duration-200"
                  onClick={() => toggleGroup(productName)}
                >
                  <span>
                    {productName}
                    <span className="ml-2 text-sm text-gray-500">
                      ({bundles.length} {bundles.length === 1 ? 'Bundle' : 'Bundles'})
                    </span>
                  </span>
                  <motion.span
                    animate={{ rotate: expandedGroups.has(productName) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {expandedGroups.has(productName) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <table className="styled-table w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Sr. No.</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Produced</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Used</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bundles.map((bundle, index) => (
                            <motion.tr
                              key={bundle.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4">{index + 1}</td>
                              <td className="px-6 py-4">{bundle.product_produced_name || "N/A"}</td>
                              <td className="px-6 py-4">{bundle.product_used_name || "N/A"}</td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  {bundle.quantity < 100
                                    ? `${bundle.quantity} pieces`
                                    : `${bundle.quantity} grams`}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic text-center py-12 bg-white rounded-xl shadow-sm"
            >
              No bundles found
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BundlesPage;