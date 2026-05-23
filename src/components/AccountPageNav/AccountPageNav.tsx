import React from "react";
import "./AccountPageNav.scss";
import { useAuth } from "../../context/AuthContext";
const AccountPageNav = () => {
  const { logout } = useAuth();


  return (
    <div className="account-nav-wrapper">
      <div className="account-nav-header">
        <h2>Konfigurimet</h2>
        <p>Këtu mund të menaxhoni llogarinë tuaj.</p>
      </div>
      <ul className="account-nav">
        <a className="account-nav-link" href="/account">
          <li>Informacionet e llogarisë</li>
        </a>
        <a className="account-nav-link" href="/account/notifications">
          <li>Njoftimet</li>
        </a>
        <a className="account-nav-link" href="/account/orders">
          <li>Gjurmo Porositë</li>
        </a>
        <a className="account-nav-link" href="/account/invoices">
          <li>Faturat</li>
        </a>
        <a className="account-nav-link" href="/account/statistics">
          <li>Statistikat</li>
        </a>
        <div className="account-nav-link" onClick={logout}>
          <li>Shkyçu</li>
        </div>
      </ul>
    </div>
  );
};

export default AccountPageNav;
