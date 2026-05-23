import React from "react";
import "./SelectInputCreateProduct.scss";
const SelectInputCreateProduct = ({ label, value, handleChange, options }: any) => {
  return (
    <div className="selector-with-label-create">
      <label className="input-label-select-create">
        <p>{label} </p>

        <select
          value={value}
          onChange={handleChange}
          className={`select-field-create ${value ? "has-value" : ""}`}
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

export default SelectInputCreateProduct;
