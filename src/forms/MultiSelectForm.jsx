import  { useState, useEffect } from "react";
import Select from "react-select";
import { getLanguages } from "/src/APIs/CompanyAPIs";

const MultiSelectForm = () => {
  const [options, setOptions] = useState([]); // For storing fetched options
  const [selectedOptions, setSelectedOptions] = useState([]); // For storing selected values

  // Fetch the options for the multi-select
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getLanguages()
        ;
        // Map the fetched data into a format usable by react-select
        const formattedOptions = data.map(item => ({
          value: item.id,
          label: item.name + ` (${item.code})` , // Adjust based on your API response
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Extract only the IDs from the selected options
    const selectedIds = selectedOptions.map(option => option.value);

    try {
      const response = await fetch("https://api.example.com/your-post-endpoint", {
        method: "POST",
         headers: {
       "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${localStorage.getItem("OrbisAccessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedIds, // Include selected IDs in the request body
          // Add other form fields here if necessary
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit form");
      }
      const result = await response.json();
      console.log(result)


    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="multi-select">Select Options:</label>
        <Select
          id="multi-select"
          options={options} // Populate options dynamically
          isMulti // Enable multi-select
          onChange={setSelectedOptions} // Update selected options
          value={selectedOptions} // Bind selected options to state
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default MultiSelectForm;
