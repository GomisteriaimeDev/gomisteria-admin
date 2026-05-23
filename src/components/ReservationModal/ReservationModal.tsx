import React from "react";
import "./ReservationModal.scss";
import closeicon from "../../assets/images/close.png";
const ReservationModal = ({ isOpen, close, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <img src={closeicon} alt="" onClick={close} className="modal-close"/>
        {children}
      </div>
    </div>
  );
};

export default ReservationModal;
