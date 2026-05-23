import React, { useState } from "react";
import "./Businesses.scss";
import { useNavigate } from "react-router-dom";
import { updateBusiness } from "../../services/api";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import TextInput from "../../components/TextInput/TextInput";

const BusinessMapModal = ({ business, onClose }: any) => {
  const [formData, setFormData] = useState({
    companyName: business.specialFields.companyName,
    businessType: business.specialFields.businessType,
    phone: business.specialFields.phone,
    location: business.specialFields.location,
    email: business.email,
  });

  const navigate = useNavigate();

  if (!business) return null;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateBusiness = async () => {
    try {
      const updatedBusiness = {
        ...business,
        specialFields: {
          ...business.specialFields,
          companyName: formData.companyName,
          businessType: formData.businessType,
          phone: formData.phone,
          location: formData.location,
        },
        email: formData.email,
      };
      await updateBusiness(business.id, updatedBusiness);
      onClose();
      navigate("/businesses/map");
    } catch (error) {
      console.error("There was an error updating the business:", error);
      alert("An error occurred while updating the business.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <p>
          <TextInput
            label="Location:"
            name="location"
            value={formData.location}
            handleChange={handleInputChange}
          />
        </p>
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
          <BlueButton onClick={handleUpdateBusiness}>Shto në hartë</BlueButton>
          <OutlineButton onClick={onClose}>Anulo</OutlineButton>
        </div>
      </div>
    </div>
  );
};

export default BusinessMapModal;
