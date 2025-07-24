
  // Determine image preview source
  export const getImagePreviewSrc = (image) => {
    if (!image) return null;
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    if (typeof image === 'string') {
      return image; // Assume it's a URL from the server
    }
    return null;
  };
