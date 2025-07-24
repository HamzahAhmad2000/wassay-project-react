export const formatDate = (date) =>{
    return new Date(date).toLocaleString()
}

export const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    try {
      return new Date(dateTimeString).toLocaleTimeString();
    } catch (e) {
      return `Invalid Time : ${e}`;
    }
  };