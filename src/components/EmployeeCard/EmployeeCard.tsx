import React, { useState } from "react";
import "./EmployeeCard.scss";
import arrow from "../../assets/svg/SelectArrow.svg";
const EmployeeCard = ({
  data,
  employeeName,
  employeeCode,
  orders,
  employeeImage,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`order-card ${isOpen ? "open" : ""}`}>
      <div className="order-card-header" onClick={toggleOpen}>
        <img
          src={employeeImage}
          alt="employeeImage"
          className="employeeImage"
        />
        <div className="order-card-info">
          <h4>{employeeName}</h4>
          <p>#{employeeCode}</p>
        </div>
        <button className={`toggle-button ${isOpen ? "open" : ""}`}>
          <img src={arrow} alt="" />
        </button>
      </div>
      {isOpen && (
        <div className="order-details">
          <h5>Porositë</h5>
          <ul>
            {orders.map((order: any, index: any) => (
              <li key={index} className={`order-item ${order.status}`}>
                <a href={`/sales/${order.id}`}>
                  Numri i faturës: <span>#{order.orderNumber}</span>
                </a>
                <div className="status">
                  <span
                    className={`status-dot ${
                      order.status === "E hapur" ? "green" : "lightBlue"
                    }`}
                  ></span>
                  {order.status}
                </div>
              </li>
            ))}
          </ul>
          <a href={`/employees/${data.id}`} className="details-link">
            Shiko detajet
          </a>
        </div>
      )}
    </div>
  );
};

export default EmployeeCard;
