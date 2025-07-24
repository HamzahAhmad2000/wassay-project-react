import PropTypes from 'prop-types';

const ImageModal = ({ isOpen, imageSrc, altText, onClose }) => {
  // If the modal isn't open or there's no image, render nothing.
  if (!isOpen || !imageSrc) return null;

  // Handle clicks on the overlay to close the modal.
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={imageSrc}
          alt={altText || 'Enlarged Image'}
          className="max-w-[80vw] max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-lg"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  imageSrc: PropTypes.string,
  altText: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ImageModal;