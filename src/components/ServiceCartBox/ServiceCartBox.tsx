// ServiceCartBox.jsx
import React, { useState } from "react";
import "./ServiceCartBox.scss"; // Make sure to create this SCSS file
import { IServiceCartBoxProps } from "../../utils/Types";
import cancel from "../../assets/svg/serviceCartBoxCancel.svg";

const ServiceCartBox: React.FC<IServiceCartBoxProps> = ({
  serviceName,
  date,
  time,
  size,
  total,
  note,
}) => {
  const [quantity, setQuanitity] = useState(4);

  const handleDecrement = () => {
    if (quantity > 1) {
      // Assuming you can't have less than 1 person
      setQuanitity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuanitity(quantity + 1);
  };
  return (
    <div className="service-cart-box">
      <div className="service-cart-box-top">
        <div className="service-cart-box-top-details">
          <h3>{serviceName}</h3>
          <p>
            Data: <span>{date}</span>
          </p>
          <p>
            Ora: <span>{time}</span>
          </p>
          <p>
            Madhësia: <span>{size}</span>
          </p>
        </div>
        <img src={cancel} alt="" />
      </div>
      <div className="service-cart-box-bottom">
        <div className="service-cart-box-counter">
          <p>Numri i gomave: </p>
          <button onClick={handleDecrement}>-</button>
          <span>{quantity}</span>
          <button onClick={handleIncrement}>+</button>
        </div>
        <p>
          Total: <span>{total}</span>
        </p>
        <p className="note">
          Shënim: Pagesa do të bëhet pas përfundimit të shërbimit!
        </p>
      </div>
    </div>
  );
};

export default ServiceCartBox;
