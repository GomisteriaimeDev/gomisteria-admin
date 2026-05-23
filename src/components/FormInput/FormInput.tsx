import { useState } from "react";
import "./FormInput.scss";
function FormInput(props: any) {
  const [inputType] = useState(props.type);
  const [inputValue, setInputValue] = useState("");

  function handleChange(event: any) {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (props.onChange) props.onChange(event);
  }

  return (
    <>
      <input
        type={inputType}
        value={inputValue}
        name={props.name}
        onChange={handleChange}
        placeholder={props?.placeholder}
        // autoComplete={props?.autocomplete ? props.autocomplete : "off"}
        className={`formInput ${props.isError ? 'error' : ''}`}
      />
    </>
  );
}

export default FormInput;
