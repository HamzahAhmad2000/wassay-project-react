import  { useState, useEffect } from "react";
import Select from "react-select";
import { getLanguages } from "/src/APIs/CompanyAPIs";
import { Button } from "../additionalOriginuiComponents/ui/button";
import { Label } from "../additionalOriginuiComponents/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../additionalOriginuiComponents/ui/card";

const MultiSelectForm = () => {
  const [options, setOptions] = useState([]); // For storing fetched options
  const [selectedOptions, setSelectedOptions] = useState([]); // For storing selected values

  // Fetch the options for the multi-select
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await getLanguages();
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
    <div className="min-h-screen bg-[#eaeaea] p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#101023]">
              Multi-Select Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="multi-select" className="text-[#101023] font-medium">
                  Select Options:
                </Label>
                <Select
                  id="multi-select"
                  options={options} // Populate options dynamically
                  isMulti // Enable multi-select
                  onChange={setSelectedOptions} // Update selected options
                  value={selectedOptions} // Bind selected options to state
                  className="w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: state.isFocused ? '#423e7f' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #423e7f' : 'none',
                      '&:hover': {
                        borderColor: '#423e7f'
                      }
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected ? '#423e7f' : state.isFocused ? '#f3f4f6' : 'white',
                      color: state.isSelected ? 'white' : '#101023',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#201b50' : '#f3f4f6'
                      }
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: '#423e7f',
                      color: 'white'
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: 'white'
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#201b50',
                        color: 'white'
                      }
                    })
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-gray-200 text-[#101023] hover:bg-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#423e7f] text-white hover:bg-[#201b50]"
                >
                  Submit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MultiSelectForm;
