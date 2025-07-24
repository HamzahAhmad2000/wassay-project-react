import { useState, useMemo } from 'react';

const useTableSort = (data, initialSortBy = null, initialSortDirection = 'asc') => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);

  const sortedData = useMemo(() => {
    if (!sortBy) {
      return data;
    }

    return [...data].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = (valueB || '').toString().toLowerCase();
      } else if (valueA instanceof Date) {
        valueA = new Date(valueA).getTime();
        valueB = (valueB instanceof Date ? new Date(valueB).getTime() : -Infinity);
      } else if (typeof valueA === 'number') {
        valueB = valueB || -Infinity;
      } else {
        valueA = valueA ? valueA.toString().toLowerCase() : "";
        valueB = valueB ? valueB.toString().toLowerCase() : "";
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  }, [data, sortBy, sortDirection]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  return { sortedData, sortBy, sortDirection, handleSort };
};

export default useTableSort;