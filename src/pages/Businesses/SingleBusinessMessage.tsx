import React, { useState } from "react";
import "./Businesses.scss";
import BlueButton from "../../components/BlueButton/BlueButton";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import axios from "axios";

interface SingleBusinessMessageProps {
  onClose: () => void;
  businessId: string;
  businessName: string;
  businessPhone: string;
}

const SingleBusinessMessage: React.FC<SingleBusinessMessageProps> = ({
  onClose,
  businessId,
  businessName,
  businessPhone,
}) => {
  const [phoneMessage, setPhoneMessage] = useState<string>("");
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("token");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(
        "https://gomisteria-api.onrender.com/api/users/send-message-to-businesses",
        {
          message: phoneMessage,
          businessIds: [businessId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Dështoi dërgimi i mesazhit.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content-msg">
        <form onSubmit={handleSend}>
          <div className="modal-top">
            <h3>Dërgo mesazh: {businessName}</h3>
            <p style={{ margin: "4px 0 0", color: "#666", fontSize: "14px" }}>
              Tel: {businessPhone}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="phoneMessage">Mesazhi:</label>
            <textarea
              id="phoneMessage"
              value={phoneMessage}
              onChange={(e) => setPhoneMessage(e.target.value)}
              required
              rows={5}
            />
            <div
              className={`char-counter ${phoneMessage.length > 160 ? "over-limit" : ""}`}
            >
              {phoneMessage.length} / 160
            </div>
          </div>

          <div className="modalActions">
            <BlueButton type="submit" disabled={sending}>
              {sending ? "Duke dërguar..." : "Dërgo"}
            </BlueButton>
            <OutlineButton onClick={onClose}>Anulo</OutlineButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleBusinessMessage;
