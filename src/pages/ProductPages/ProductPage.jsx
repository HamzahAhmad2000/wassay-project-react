import React, { useCallback, useEffect, useState } from "react";
import { deleteProduct, getProducts } from "../../APIs/ProductAPIs"; // Adjust the import path
import { useNavigate, Link } from "react-router-dom";
import SearchFilter from "../../components/SearchFilter";
import { hasPermission } from "../../utilityFunctions/unitilityFunctions"; // Adjust the import path
import ReusableTable from "../../components/ReusableTable"; // Import the reusable table
import { handleDelete } from "../../utils/crudUtils"; // Import the reusable delete function
import { toast } from "react-toastify";
import useFetchAndFilter from "/src/hooks/useFetchAndFilter";

const ProductPage = () => {
  const navigate = useNavigate();
  const [canAdd, setCanAdd] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const fetchProductsData = useCallback(async () => {
    const response = await getProducts();
    return response;
  }, []);

  const { data: products, isLoading, searchTerm, setSearchTerm, setData: setProducts } = useFetchAndFilter(
    fetchProductsData,
    'products'
  );

  useEffect(() => {
    const fetchPermissions = async () => {
      setCanAdd(await hasPermission('add_product'));
      setCanUpdate(await hasPermission('change_product'));
      setCanDelete(await hasPermission('delete_product'));
    };
    fetchPermissions();
  }, []);

  const handleUpdate = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      navigate(`/update-product/${productId}`, { state: { product } });
    } else {
      toast.error(`Product with ID ${productId} not found.`);
    }
  };

  const handleDeleteProduct = (productId) => {
    handleDelete(productId, deleteProduct, setProducts, 'product', () => {
      // Optionally, perform additional actions after successful deletion
      toast.success("Product deleted successfully.");
    });
  };

  const productHeaders = [
    { label: "Sr. No.", key: "serial_no" },
    { label: "Name", key: "product_name", sortable: true },
    { label: "Packaging Weight", key: "packaging_weight", sortable: true },
    { label: "Unit", key: "unit", sortable: true },
    { label: "Brand", key: "brand_name", sortable: true },
    { label: "Category", key: "category_name", sortable: true, render: (product) => product.category?.category_name || "N/A" },
    { label: "SKU", key: "sku", sortable: true },
    { label: "Barcode", key: "barcode", sortable: true },
    { label: "Season", key: "season", sortable: true },
    { label: "Gender", key: "gender", sortable: true },
    { label: "Returnable", key: "returnable", sortable: true, render: (product) => product.returnable ? "Yes" : "No" },
    {
      label: "Images",
      key: "images",
      render: (product) => (
        product.images.image ? (
            <img key={product.images.id} src={product.images.image} alt="Product" className="product-image" style={{ width: '50px', height: '50px', marginRight: '5px' }} />
        ) : (
          "No Image"
        )
      ),
    },
    { label: "Actions", key: "actions" },
  ];

  const productData = products.map((product, index) => ({
    serial_no: index + 1,
    product_name: product.product_name || "N/A",
    packaging_weight: product.packaging_weight || "N/A",
    unit: product.unit || "N/A",
    brand_name: product.brand_name || "N/A",
    category: product.category,
    sku: product.sku || "N/A",
    barcode: product.barcode || "N/A",
    season: product.season || "N/A",
    gender: product.gender || "N/A",
    returnable: product.returnable,
    images: product.images || "",
    actions: (
      <div>
        {canUpdate && (
          <button className="action-button update-button mr-2" onClick={() => handleUpdate(product.id)}>
            Update
          </button>
        )}
        {canDelete && (
          <button className="action-button delete-button" onClick={() => handleDeleteProduct(product.id)}>
            Delete
          </button>
        )}
      </div>
    ),
  }));

  return (
    <div className="product-page">
      <h1 className="page-title">Product Details</h1>
      <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search products..." />
      {canAdd && (
        <Link to="/add-product">
          <button className="action-button add-button">Add Product</button>
        </Link>
      )}
      {isLoading ? (
        <p>Loading products...</p>
      ) : (
        <ReusableTable headers={productHeaders} data={productData} />
      )}
    </div>
  );
};

export default ProductPage;