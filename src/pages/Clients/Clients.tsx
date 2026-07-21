import React, { useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import Table from "../../components/Table/Table";
import useFetchData, { getClients } from "../../services/api";
import Pagination from "../../components/Pagination/Pagination";
import Loader from "../../components/Loader";

const Clients = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useFetchData(
    getClients,
    currentPage,
    10,
    "createdAt",
    "desc"
  );

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const columns = [
    { title: "ID", width: "8%" },
    { title: "Emri", width: "24%" },
    { title: "Email", width: "28%" },
    { title: "Numri Telefonit", width: "20%" },
    { title: "Statusi", width: "12%" },
    { title: "Regjistruar", width: "8%" },
  ];

  const rows = (data?.data || []).map((client: any) => ({
    cells: [
      { content: client.id.slice(0, 6) },
      { content: client.specialFields?.fullName || "-" },
      { content: client.email },
      { content: client.specialFields?.phone || "-" },
      {
        content: (
          <span
            style={{
              color: client.isActivated ? "#16a34a" : "#dc2626",
              fontWeight: 500,
            }}
          >
            {client.isActivated ? "Aktiv" : "Jo Aktiv"}
          </span>
        ),
      },
      {
        content: new Date(client.createdAt).toLocaleDateString("sq-AL"),
      },
    ],
  }));

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Klientët"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <div className="actionsHeaderButtonsLeft">
              <h2>Klientët Privat</h2>
            </div>
          </div>
          <Table columns={columns} rows={rows} />
          <div className="paginationSection">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          </div>
        </div>
      </Dashboard>
    </>
  );
};

export default Clients;
