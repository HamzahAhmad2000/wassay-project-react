// PackageGroupTable.js
import React, { useState, useEffect } from 'react';
import { getPackages } from '../APIs/ProductAPIs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeaderCell,
  TablePagination,
  TableFilter
} from '../components/ui/modern-table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/modern-card';

const PackageGroupTable = () => {
  const [packageGroups, setPackageGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { key: 'grn_number', header: 'GRN Number', sortable: true, filterable: true },
    { key: 'product_name', header: 'Product', sortable: true, filterable: true },
    { key: 'total_original_weight', header: 'Total Weight', sortable: true, filterable: true },
    { key: 'total_packed', header: 'Total Packed', sortable: true, filterable: true },
    { key: 'total_remaining', header: 'Total Remaining', sortable: true, filterable: true },
    { key: 'package_count', header: 'Package Count', sortable: true, filterable: true },
    { key: 'latest_update', header: 'Last Updated', sortable: true, filterable: true }
  ];

  const [openRows, setOpenRows] = useState({});

  useEffect(() => {
    const fetchPackageGroups = async () => {
      try {
        setLoading(true);
        const data = await getPackages();
        setPackageGroups(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching package groups:', error);
        setError('Failed to load package groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackageGroups();
  }, []);

  const handleRowToggle = (grnNumber, productId) => {
    const key = `${grnNumber}-${productId}`;
    setOpenRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardHeader>
            <CardTitle className="origin-ui-text" style={{ color: 'var(--color-tertiary-700)' }}>Package Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-tertiary-500)' }}></div>
              <span className="ml-2 origin-ui-text">Loading package groups...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardHeader>
            <CardTitle className="origin-ui-text" style={{ color: 'var(--color-tertiary-700)' }}>Package Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500 text-center py-8">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!packageGroups.length) {
    return (
      <div className="w-full p-4">
        <Card>
          <CardHeader>
            <CardTitle className="origin-ui-text" style={{ color: 'var(--color-tertiary-700)' }}>Package Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
              No package groups found.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <Card variant="chart">
        <CardHeader>
          <CardTitle className="origin-ui-text" style={{ color: 'var(--color-tertiary-700)' }}>Package Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <Table data={packageGroups} columns={columns}>
            <TableFilter />
            
            <TableHeader>
              <TableBody>
                <TableHead>
                  <TableRow>
                    {columns.map(col => (
                      <TableHeaderCell
                        key={col.key}
                        columnKey={col.key}
                        sortable={col.sortable}
                        filterable={col.filterable}
                      >
                        {col.header}
                      </TableHeaderCell>
                    ))}
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {packageGroups.map(group => {
                    const key = `${group.grn_number}-${group.product_id}`;
                    const isOpen = openRows[key];
                    
                    return (
                      <React.Fragment key={key}>
                        <TableRow>
                          <TableCell className="origin-ui-text">{group.grn_number}</TableCell>
                          <TableCell className="origin-ui-text">{group.product_name} (ID: {group.product_id})</TableCell>
                          <TableCell className="origin-ui-text">{group.total_original_weight}</TableCell>
                          <TableCell className="origin-ui-text">{group.total_packed}</TableCell>
                          <TableCell className="origin-ui-text">{group.total_remaining}</TableCell>
                          <TableCell className="origin-ui-text">{group.package_count}</TableCell>
                          <TableCell className="origin-ui-text">{formatDate(group.latest_update)}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleRowToggle(group.grn_number, group.product_id)}
                              className="font-medium origin-ui-text hover:text-[var(--color-tertiary-600)] transition-colors"
                              style={{ color: 'var(--color-tertiary-500)' }}
                            >
                              {isOpen ? 'Hide Details ▲' : 'Show Details ▼'}
                            </button>
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow>
                            <TableCell colSpan={8} style={{ backgroundColor: 'var(--color-primary-50)' }}>
                              <div className="p-4">
                                <h3 className="text-lg font-semibold mb-4 origin-ui-text">
                                  Packages for {group.product_name}
                                </h3>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3 origin-ui-text">
                                          ID
                                        </th>
                                        <th className="text-left py-2 px-3 origin-ui-text">
                                          Packed
                                        </th>
                                        <th className="text-left py-2 px-3 origin-ui-text">
                                          Remaining
                                        </th>
                                        <th className="text-left py-2 px-3 origin-ui-text">
                                          Created By
                                        </th>
                                        <th className="text-left py-2 px-3 origin-ui-text">
                                          Created At
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {group.packages?.map((pkg) => (
                                        <tr key={pkg.id || pkg.package_id} className="border-b">
                                          <td className="py-2 px-3 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
                                            {pkg.id || pkg.package_id || 'N/A'}
                                          </td>
                                          <td className="py-2 px-3 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
                                            {pkg.packed || 'N/A'}
                                          </td>
                                          <td className="py-2 px-3 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
                                            {pkg.ideal_remaining || 'N/A'}
                                          </td>
                                          <td className="py-2 px-3 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
                                            {pkg.created_by_name || 'N/A'}
                                          </td>
                                          <td className="py-2 px-3 origin-ui-text" style={{ color: 'var(--color-secondary-800)' }}>
                                            {formatDate(pkg.created_at)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </TableBody>
            </TableHeader>
            <TablePagination />
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageGroupTable;