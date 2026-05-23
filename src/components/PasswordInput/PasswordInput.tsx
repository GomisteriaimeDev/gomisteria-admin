import React, { ChangeEvent } from "react";
import "./PasswordInput.scss";

interface PasswordInputProps {
  label?: string;
  value: string;
  name: string;
  required?: boolean;
  width?: string;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  handleChange,
  name,
  width,
  required,
}) => {
  return (
    <div className="password-with-label" style={{ width: `${width}` }}>
      <label className="input-label-password">
        {label} {/* Using label directly for better accessibility */}
        <input
          type="password"
          value={value}
          name={name}
          onChange={handleChange}
          className={`password-field ${value ? "has-value" : ""}`}
          required={required}
        />
      </label>
    </div>
  );
};

export default PasswordInput;
