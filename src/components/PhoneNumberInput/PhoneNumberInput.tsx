import React, { useEffect, useState } from "react";
import "./PhoneNumberInput.scss"; // Assuming you have SASS installed and configured
import rks from "../../assets/svg/rks.svg";
import alb from "../../assets/svg/alb.svg";
import mkd from "../../assets/svg/mkd.svg";

const PhoneNumberInput = ({ onPhoneNumberChange }: any) => {
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+383");

  const countryCodes = [
    { code: "+383", flag: rks },
    { code: "+377", flag: alb },
    { code: "+381", flag: mkd },
  ];
  const fullPhoneNumber = countryCode + phone;
  useEffect(() => {
    onPhoneNumberChange(fullPhoneNumber);
  }, [fullPhoneNumber, onPhoneNumberChange]);
  return (
    <div className="phone-number-input">
      <select
        className="country-code-dropdown"
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
        name="select"
      >
        {countryCodes.map((country) => (
          <option key={country.code} value={country.code}>
            {country.code}
          </option>
        ))}
      </select>
      <input
        type="number"
        className="phone-input"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        name="number"
      />
    </div>
  );
};

export default PhoneNumberInput;
