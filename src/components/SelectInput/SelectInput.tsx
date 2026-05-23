import React from "react";
import "./SelectInput.scss";
const SelectInput = ({
  label,
  value,
  handleChange,
  options,
  name,
  width,
}: any) => {
  return (
    <div className="selector-with-label" style={{ width: width }}>
      <label className="input-label-select">
        <p>{label} </p>

        <select
          name={name}
          value={value}
          onChange={handleChange}
          className={`select-field ${value ? "has-value" : ""}`}
        >

          {options?.map((option: any, index: number) => (
            <option key={index} value={option?.value}>
              {option?.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default SelectInput;
