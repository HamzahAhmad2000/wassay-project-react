import PropTypes from "prop-types";

const SearchFilter = ({ searchTerm, setSearchTerm, buttonText, onButtonClick }) => {
  return (
    <div className="filter-section mb-4 flex items-center justify-between px-4">
      {/* Search Input (Centered) */}
      <div className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Add Button (Right Aligned) */}
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
SearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func,
};

export default SearchFilter;
