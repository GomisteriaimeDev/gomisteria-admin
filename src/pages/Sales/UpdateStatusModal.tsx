// src/pages/Sales/UpdateStatusModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./UpdateStatusModal.scss";

type Order = {
  id: string | number;
  orderNumber?: string | number;
  status?: string;
  fullName?: string;
  user?: { specialFields?: { companyName?: string } };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newStatus: string) => void | Promise<void>;
  selectedOrders: Order[];
};

const STATUS_OPTIONS = [
  { value: "CREATED", label: "Krijuar" },
  { value: "PROCESSING", label: "Në Proces" },
  { value: "SHIPPED", label: "Transportuar" },
  { value: "DELIVERED", label: "Kompletuar" },
  { value: "CANCELLED", label: "Anuluar" },
  { value: "BORXH", label: "Borxh" },
];

const UpdateStatusModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUpdate,
  selectedOrders,
}) => {
  const [status, setStatus] = useState<string>("PROCESSING");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uniqueCurrentStatuses = useMemo(() => {
    const s = new Set(
      (selectedOrders || []).map((o) => String(o.status || "").trim())
    );
    s.delete("");
    return Array.from(s);
  }, [selectedOrders]);

  useEffect(() => {
    if (!isOpen) return;

    // default to the single common status if all selected share it,
    // otherwise default to PROCESSING
    if (uniqueCurrentStatuses.length === 1) {
      setStatus(uniqueCurrentStatuses[0]);
    } else {
      setStatus("PROCESSING");
    }
  }, [isOpen, uniqueCurrentStatuses]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const count = selectedOrders?.length ?? 0;

  const handleSubmit = async () => {
    if (!status) return;

    try {
      setIsSubmitting(true);
      await onUpdate(status);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="usm-backdrop" onMouseDown={onClose}>
      <div
        className="usm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="usm-header">
          <h3 id="usm-title">Përditëso statusin</h3>
          <button className="usm-iconBtn" onClick={onClose} aria-label="Mbyll">
            ✕
          </button>
        </div>

        <div className="usm-body">
          <p className="usm-subtitle">
            {count > 0
              ? `Po përditëson statusin për ${count} porosi të zgjedhura.`
              : "Nuk ka porosi të zgjedhura."}
          </p>

          {uniqueCurrentStatuses.length > 1 && (
            <div className="usm-info">
              Statuset aktuale të zgjedhura:{" "}
              <strong>{uniqueCurrentStatuses.join(", ")}</strong>
            </div>
          )}

          <label className="usm-label" htmlFor="usm-status">
            Statusi i ri
          </label>
          <select
            id="usm-status"
            className="usm-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={isSubmitting || count === 0}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {count > 0 && (
            <div className="usm-preview">
              <div className="usm-previewTitle">Të zgjedhurat</div>
              <div className="usm-previewList">
                {selectedOrders.slice(0, 6).map((o) => (
                  <div key={String(o.id)} className="usm-previewRow">
                    <span className="usm-pill">#{o.orderNumber ?? o.id}</span>
                    <span className="usm-name">
                      {o.fullName || o.user?.specialFields?.companyName || ""}
                    </span>
                    <span className="usm-muted">{o.status || ""}</span>
                  </div>
                ))}
                {selectedOrders.length > 6 && (
                  <div className="usm-muted">
                    +{selectedOrders.length - 6} të tjera…
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="usm-footer">
          <button
            className="usm-btn usm-btnSecondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Anulo
          </button>
          <button
            className="usm-btn usm-btnPrimary"
            onClick={handleSubmit}
            disabled={isSubmitting || count === 0}
          >
            {isSubmitting ? "Duke përditësuar..." : "Përditëso"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
