import React from "react";
import "./Businesses.scss";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import { activateBusiness } from "../../services/api";
import { useNavigate } from "react-router-dom";

const BusinessModal = ({ business, onClose }: any) => {
  const navigate = useNavigate();
  if (!business) return null;
  const handleApproveBusiness = async () => {
    try {
      await activateBusiness(business);
      onClose();
      navigate("/businesses/activate");
    } catch (error) {
      console.error("There was an error approving the business:", error);
      alert("An error occurred while approving the business.");
    }
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <p>
          Emri i Kompanisë: <span>{business.specialFields.companyName}</span>
        </p>
        <p>
          ARBK Numri: <span>NR ARBK</span>
        </p>

        <p>
          Industria: <span>{business.specialFields.businessType}</span>
        </p>
        <p>
          Email: <span>{business.email}</span>
        </p>
        <p>
          Numri i Telefonit:
          <span> {business.specialFields.phone}</span>
        </p>
        <p>
          Status: <span>{business.isActivated ? "Active" : "Inactive"}</span>
        </p>
        <div className="modalActions">
          <BlueButton onClick={handleApproveBusiness}>
            Aprovo Biznesin
          </BlueButton>
          <OutlineButton onClick={onClose}>Anulo</OutlineButton>
        </div>
      </div>
    </div>
  );
};

export default BusinessModal;
