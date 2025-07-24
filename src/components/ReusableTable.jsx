import PropTypes from "prop-types";
import useTableSort from "../hooks/useTableSort";
import { SortAsc, SortAscIcon, SortDesc } from "lucide-react";

const ReusableTable = ({ headers, data }) => {
  const { sortedData, sortBy, sortDirection, handleSort } = useTableSort(data);

  if (!data || data.length === 0) {
    return <p className="p-4 text-center text-gray-600">No data to display.</p>;
  }

  if (!headers || headers.length === 0) {
    return <p className="p-4 text-center text-gray-600">No headers provided for the table.</p>;
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200 rounded-md shadow-sm border border-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr className="text-left">
            {headers.map((header) => (
              <th
                key={header.key}
                onClick={() => header.sortable && handleSort(header.key)}
                className={`px-3 py-2 md:px-4 md:py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${
                  header.sortable ? "hover:bg-gray-100" : "cursor-default"
                } ${sortBy === header.key ? "font-semibold" : ""}`}
              >
                <div className="flex items-center">
                  <span>{header.label}</span>
                  {header.sortable && (
                    <span className="ml-2">
                      {sortBy === header.key ? (
                        sortDirection === "asc" ? (
                          <SortAsc className="h-4 w-4 text-gray-700" />
                        ) : (
                          <SortDesc className="h-4 w-4 text-gray-700" />
                        )
                      ) : (
                        <SortAscIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {/* Optional 'Actions' header can be added here */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {headers.map((header) => (
                <td
                  key={`${index}-${header.key}`} // Consider using item.id if available and unique for a more stable key
                  className="px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-700"
                >
                  {/* --- THIS IS THE CORRECTED LINE --- */}
                  {header.render ? header.render(item) : item[header.key]}
                  {/* ----------------------------------- */}
                </td>
              ))}
              {/* Optional 'Actions' column can be added here */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ReusableTable.propTypes = {
  headers: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
      sortable: PropTypes.bool,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ReusableTable;