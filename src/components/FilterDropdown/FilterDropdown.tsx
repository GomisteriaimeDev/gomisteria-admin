import React from "react";
import "./FilterDropdown.scss";

const FilterDropdown = ({ label, options, selectedValue, onChange }: any) => {
  return (
    <div className="dropdown">
      <label className="dropdown__label">
        {label}
        <span className="dropdown__label--highlight">{selectedValue}</span>
      </label>
      <select
        className="dropdown__select"
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option: any, index: any) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="dropdown__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
        >
          <path
            d="M4 6.5L8 10.5L12 6.5"
            stroke="#1B2443"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
};

export default FilterDropdown;
