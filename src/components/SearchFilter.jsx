import PropTypes from "prop-types";
import { Button } from "../additionalOriginuiComponents/ui/button";
import { Input } from "../additionalOriginuiComponents/ui/input";

const SearchFilter = ({ searchTerm, setSearchTerm, buttonText, onButtonClick }) => {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      {/* Search Input (Centered) */}
      <div className="flex-1 flex justify-center">
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {/* Add Button (Right Aligned) */}
      {buttonText && onButtonClick && (
        <Button
          onClick={onButtonClick}
          className="bg-[#423e7f] text-white hover:bg-[#201b50]"
        >
          {buttonText}
        </Button>
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
