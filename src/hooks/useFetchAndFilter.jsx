import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function useFetchAndFilter(fetchFn, entityName) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        setFilteredData(result);
      } catch (error) {
        toast.error(`Error fetching ${entityName}: ${error.message}`);
        console.error(`Error fetching ${entityName}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, entityName]);

  useEffect(() => {
    const filterData = () => {
      if (searchTerm) {
        const filtered = data.filter((item) =>
          Object.keys(item).some((key) => {
            const value = item[key];
            return (
              value &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          })
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(data);
      }
    };

    filterData();
  }, [data, searchTerm]);

  return {
    data: filteredData,
    isLoading,
    searchTerm,
    setSearchTerm,
    setData
  };
}

export default useFetchAndFilter;