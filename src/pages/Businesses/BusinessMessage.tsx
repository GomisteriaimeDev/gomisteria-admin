import React, { useState, useEffect } from "react";
import "./Businesses.scss";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { getBusinessTypes } from "../../services/api";
import Select from "react-select";
interface BusinessInfo {
  id: string;
  companyName: string;
  phone: string;
}

interface BusinessMessageProps {
  onClose: () => void;
  messageType: "email" | "phone";
  businessIds?: string[];
  recipients?: BusinessInfo[];
}

const BusinessMessage: React.FC<BusinessMessageProps> = ({
  onClose,
  messageType,
  businessIds,
  recipients,
}) => {
  const [subject, setSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [phoneMessage, setPhoneMessage] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  // Load business types when the component mounts.
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const data = await getBusinessTypes();
        setBusinessTypes(data);
      } catch (error) {
        console.error("Failed to fetch business types", error);
      }
    };

    fetchBusinessTypes();
  }, []);

  // Updated function to conditionally include the businessType in the payload.
  const sendEmailToBusinesses = async (
    subject: string,
    emailBody: string,
    businessType?: string
  ) => {
    try {
      const payload: { subject: string; html: string; businessType?: string; businessIds?: string[] } =
        {
          subject,
          html: emailBody,
        };

      // Only include the businessType if one is selected.
      if (businessType) {
        payload.businessType = businessType;
      }

      if (businessIds && businessIds.length > 0) {
        payload.businessIds = businessIds;
      }

      const response = await axios.post(
        "https://gomisteria-api.onrender.com/api/users/send-email-to-businesses",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload();
      return response.data;
    } catch (error) {
      throw new Error("Failed to send email to businesses");
    }
  };
  const sendPhoneMessageToBusinesses = async (
    phoneMessage: string,
    businessType?: string
  ) => {
    try {
      const payload: { message: string; businessType?: string; businessIds?: string[] } = {
        message: phoneMessage,
      };

      if (businessType) {
        payload.businessType = businessType;
      }

      if (businessIds && businessIds.length > 0) {
        payload.businessIds = businessIds;
      }

      const response = await axios.post(
        "https://gomisteria-api.onrender.com/api/users/send-message-to-businesses",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload();
      return response.data;
    } catch (error) {
      throw new Error("Failed to send phone message to businesses");
    }
  };
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (messageType === "email") {
        await sendEmailToBusinesses(subject, emailBody, businessType);
      } else if (messageType === "phone") {
        await sendPhoneMessageToBusinesses(phoneMessage, businessType);
      }
    } catch (error) {
      console.error("There was an error sending the email:", error);
    }
  };
  const businessOptions = [
    { value: "", label: "All Businesses" },
    ...businessTypes.map((type: any) => ({
      value: type.name,
      label: type.name,
    })),
  ];
  return (
    <div className="modal">
      <div className="modal-content-msg">
        <form onSubmit={handleSendEmail}>
          <div className="modal-top">
            {messageType === "email" && (
              <div className="form-group">
                <label htmlFor="subject">Subject:</label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            )}
            {/* Only show Business Type filter when no specific businesses are selected */}
            {!businessIds?.length && (
              <div className="form-group">
                <label htmlFor="businessType">Business Type (optional):</label>
                <Select
                  id="businessType"
                  options={businessOptions}
                  value={businessOptions.find(
                    (option: any) => option.value === businessType
                  )}
                  onChange={(selectedOption) =>
                    setBusinessType(selectedOption ? selectedOption.value : "")
                  }
                />
              </div>
            )}
          </div>
          {recipients && recipients.length > 0 && (
            <div className="form-group">
              <label>Pranuesit ({recipients.length}):</label>
              <ul style={{ maxHeight: 120, overflowY: "auto", margin: 0, padding: "4px 0 4px 20px", fontSize: 14 }}>
                {recipients.map((r) => (
                  <li key={r.id}>
                    {r.companyName} — {r.phone}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {messageType === "email" && (
            <div className="form-group">
              <label htmlFor="emailBody">Email Body:</label>
              <ReactQuill value={emailBody} onChange={setEmailBody} />
            </div>
          )}
          {messageType === "phone" && (
            <div className="form-group">
              <label htmlFor="phoneMessage">Phone Message:</label>
              <textarea
                id="phoneMessage"
                value={phoneMessage}
                onChange={(e) => setPhoneMessage(e.target.value)}
                required
                rows={5}
              />

              <div
                className={`char-counter ${
                  phoneMessage.length > 160 ? "over-limit" : ""
                }`}
              >
                {phoneMessage.length} / 160
              </div>
            </div>
          )}

          <div className="modalActions">
            <BlueButton type="submit">Send Email</BlueButton>
            <OutlineButton onClick={onClose}>Cancel</OutlineButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessMessage;
