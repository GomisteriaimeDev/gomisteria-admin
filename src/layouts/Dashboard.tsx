import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar/AdminSidebar";
import SearchBar from "../components/SearchBar/SearchBar";

const Dashboard = ({ children, pageTitle }: any) => {

  return (
    <div className="adminWrapper">
      <AdminSidebar />
      <main className="mainAdminContent">

        <div className="adminMainSection">{children}</div>
      </main>
    </div>
  );
};

export default Dashboard;
