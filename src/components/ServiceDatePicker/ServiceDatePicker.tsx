import React from "react";
import "./ServiceDatePicker.scss"; // Ensure you have corresponding CSS styles

const ServiceDatePicker = ({ label, value, handleChange }: any) => {
  return (
    <div className="date-picker-with-label">
      <label className="input-label-date">
        <p>{label}:</p>
        <input
          type="date"
          value={value}
          onChange={handleChange}
          className={`date-field ${value ? "has-value" : ""}`}
        />
      </label>
    </div>
  );
};

export default ServiceDatePicker;
