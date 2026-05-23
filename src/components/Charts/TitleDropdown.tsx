import React, { useState } from "react";

const TitleDropdown = ({ title, onChange }: any) => {
  const [selectedOption, setSelectedOption] = useState("Të gjitha");

 
  const options = ["Të gjitha", "Aktive", "Mbyllur"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
  };
  return (
    <div className="title-dropdown">
      <h6>{title}</h6>
      {/* <FilterDropdown
        label="Shfaq:"
        options={options}
        selectedValue={selectedOption}
        onChange={handleDropdownChange}
      /> */}
    </div>
  );
};

export default TitleDropdown;
