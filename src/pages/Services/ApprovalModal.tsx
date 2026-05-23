import React, { useState } from "react";
import "./Services.scss";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import formatDate from "../../utils/FormatDate";
import capitalize from "../../utils/Capitalize";
import { useNavigate } from "react-router-dom";
import SelectInput from "../../components/SelectInput/SelectInput";

const ApprovalModal = ({ show, onClose, serviceOrder, onApprove }: any) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(serviceOrder?.status || ""); // Initialize with current status

  if (!show) {
    return null;
  }

  const handleStatusChange = (event: any) => {
    setStatus(event.target.value);
  };

  return (
    <div className="modal-overlay">
      <div
        className={`modal-content-wrapper  ${
          serviceOrder.image ? "has-image" : " "
        }`}
      >
        {serviceOrder.image[0] && (
          <div className="modal-content-image">
            <img src={serviceOrder?.image[0]?.url} alt="" />
          </div>
        )}

        <div className="modal-content-services">
          <h6>
            {serviceOrder.Service.name} #{serviceOrder.id.slice(0, 5)}
          </h6>

          <h6>{serviceOrder?.User?.specialFields?.fullName}</h6>
          {serviceOrder.Business.specialFields.businessType ? (
            <p className="serviceModal">
              Industria: {serviceOrder.Business.specialFields.businessType}
            </p>
          ) : null}

          <div className="serviceModalDetails">
            {serviceOrder.cmimi ? (
              <p className="serviceModal">
                Price: <span>{serviceOrder.cmimi}</span>
              </p>
            ) : null}

            {serviceOrder.madhesia ? (
              <p className="serviceModal">
                Rim Size: <span>{serviceOrder.madhesia}"</span>
              </p>
            ) : null}

            {serviceOrder.sasia ? (
              <p className="serviceModal">
                Quantity: <span>{serviceOrder.sasia}</span>
              </p>
            ) : null}

            {serviceOrder.meFellne ? (
              <p className="serviceModal">
                {serviceOrder.meFellne ? "Me fellne" : "Pa fellne"}
              </p>
            ) : null}

            {serviceOrder.ngjyra ? (
              <p className="serviceModal">
                Ngjyra: <span>{serviceOrder.ngjyra}</span>
              </p>
            ) : null}

            {serviceOrder.ora ? (
              <p className="serviceModal">
                Time: <span>{serviceOrder.ora}</span>
              </p>
            ) : null}

            {serviceOrder.data ? (
              <p className="serviceModal">
                Date: <span>{formatDate(serviceOrder.data)}</span>
              </p>
            ) : null}

            {serviceOrder.sezona ? (
              <p className="serviceModal">
                Number of tires: <span>{capitalize(serviceOrder.sezona)}</span>
              </p>
            ) : null}
            {serviceOrder.status ? (
              <p className="serviceModal">
                Status: <span> {capitalize(serviceOrder.status)}</span>
              </p>
            ) : null}
          </div>

          <SelectInput
            value={status}
            handleChange={handleStatusChange}
            options={[
              { value: "completed", label: "Completed" },
              { value: "paid", label: "Paid" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />

          <div className="modal-actions">
            <BlueButton onClick={() => onApprove(serviceOrder.id, status)}>
              Update Status
            </BlueButton>
            <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
