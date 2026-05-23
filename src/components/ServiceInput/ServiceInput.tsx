import React from "react";

const ServiceInput = ({ label, value, handleChange }: any) => {
  return (
    <div className="selector-with-label">
      <label className="input-label">
        <p>{label}:</p>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className={`input-field ${value && "has-value"}`}
        />
      </label>
    </div>
  );
};

export default ServiceInput;
