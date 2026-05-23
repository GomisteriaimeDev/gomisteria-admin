import { useState } from "react";
import "./FormSelect.scss";
function CustomSelect(props: any) {
  const [data] = useState(props.data);

  let options = data.map((item: any, index: any) => (
    <option key={index} value={item}>
      {item}
    </option>
  ));

  return (
    <>
      <select
        name="customSearch"
        onChange={(event) => props?.onSelectChange(event)}
        className="select"
      >
        <option value="" className="select-option">{props.title}</option>
        {options}
      </select>
    </>
  );
}

export default CustomSelect;
