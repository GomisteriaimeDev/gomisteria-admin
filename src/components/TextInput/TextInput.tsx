import React, { ChangeEvent } from "react";
import "./TextInput.scss";

interface TextInputProps {
  label?: string;
  value: string;
  name: string;
  width?: string;
  required?: boolean;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  handleChange,
  name,
  width,
  required,
}) => {
  return (
    <div className="text-with-label" style={{ width: `${width}` }}>
      
      {/* 🔥 Autofill Trap Input — Chrome fills this instead */}
      <input
        type="text"
        name="fake-autofill-blocker"
        autoComplete="username"
        style={{
          position: "absolute",
          opacity: 0,
          height: 0,
          width: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
      />

      <label className="input-label-text">
        {label}
        <input
          type="text"
          value={value}
          name={`no-autofill-${name}`}
          onChange={handleChange}
          className={`text-field ${value ? "has-value" : ""}`}
          required={required}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </label>
    </div>
  );
};

export default TextInput;
