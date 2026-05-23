// src/components/ConfirmationDialog/ConfirmationDialog.js
import React from "react";
import "./ConfirmationDialog.scss";
import BlueButton from "../BlueButton/BlueButton";
import OutlineButton from "../OutlineButton/OutlineButton";
import DangerButton from "../DangerButton/DangerButton";

const ConfirmationDialog = ({ message, onConfirm, onCancel,productTitle }: any) => {
  return (
    <div className="confirmationDialog">
      <div className="confirmationDialogContent">
        <h6>{message}</h6>
        <h2>{productTitle}</h2>
        <div className="confirmationDialogActions">
          <OutlineButton onClick={onCancel}>Cancel</OutlineButton>
          <DangerButton onClick={onConfirm}>Delete</DangerButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
